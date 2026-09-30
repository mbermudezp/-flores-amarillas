import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  createSky,
  createGround,
  createLights,
  createSun,
  createClouds,
} from "../three/environment.js";
import { FlowerField } from "../three/flower.js";
import { FloatingPetals } from "../three/petals.js";
import { phrases } from "../data/phrases.js";

export default function Scene({ onReady, onFlowerClick }) {
  const containerRef = useRef(null);
  const callbacks = useRef({ onReady, onFlowerClick });

  callbacks.current = { onReady, onFlowerClick };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const canvas = document.createElement("canvas");
    canvas.className = "scene";
    container.appendChild(canvas);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xffe6a3, 34, 120);

    const camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      600
    );
    camera.position.set(0, 6.5, 20);

    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 3.2, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enablePan = false;
    controls.minDistance = 7;
    controls.maxDistance = 44;
    controls.minPolarAngle = 0.25;
    controls.maxPolarAngle = Math.PI * 0.49;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.45;

    createSky(scene);
    const ground = createGround(scene);
    createLights(scene);
    createSun(scene);
    const clouds = createClouds(scene);

    const field = new FlowerField();
    scene.add(field.mesh);

    const petals = new FloatingPetals();
    scene.add(petals.mesh);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerDown = null;

    function handlePointerDown(event) {
      pointerDown = { x: event.clientX, y: event.clientY };
    }

    function handlePointerUp(event) {
      if (!pointerDown) return;
      const dx = event.clientX - pointerDown.x;
      const dy = event.clientY - pointerDown.y;
      pointerDown = null;
      if (Math.hypot(dx, dy) > 8) return;

      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);

      const hits = raycaster.intersectObject(field.mesh, false);
      if (hits.length > 0 && hits[0].instanceId !== undefined) {
        field.pulseAt(hits[0].instanceId, elapsed);
        const phrase = phrases[Math.floor(Math.random() * phrases.length)];
        callbacks.current.onFlowerClick?.(phrase, event.clientX, event.clientY);
      }
    }

    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointerup", handlePointerUp);

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    window.addEventListener("resize", handleResize);

    const clock = new THREE.Clock();
    let elapsed = 0;
    let animationId = 0;
    let readyFired = false;

    function animate() {
      animationId = requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.05);
      elapsed += delta;

      field.update(elapsed);
      petals.update(delta, elapsed);
      clouds.update(delta);
      controls.update();
      renderer.render(scene, camera);

      if (!readyFired) {
        readyFired = true;
        callbacks.current.onReady?.();
      }
    }

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointerup", handlePointerUp);
      controls.dispose();
      field.dispose();
      petals.dispose();
      ground.geometry.dispose();
      ground.material.map?.dispose();
      ground.material.dispose();
      renderer.dispose();
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    };
  }, []);

  return <div className="scene-container" ref={containerRef} />;
}
