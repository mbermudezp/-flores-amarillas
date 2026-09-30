import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

const STEM_HEIGHT = 2;

function colorize(geometry, hex) {
  const color = new THREE.Color(hex);
  const count = geometry.attributes.position.count;
  const array = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    array[i * 3] = color.r;
    array[i * 3 + 1] = color.g;
    array[i * 3 + 2] = color.b;
  }
  geometry.setAttribute("color", new THREE.BufferAttribute(array, 3));
  return geometry;
}

function makePetal() {
  const petal = new THREE.SphereGeometry(0.5, 12, 8);
  petal.scale(0.28, 0.06, 0.9);
  petal.translate(0, 0, 0.5);
  return petal;
}

function makeLeaf() {
  const leaf = new THREE.SphereGeometry(0.5, 10, 6);
  leaf.scale(0.5, 0.06, 0.9);
  leaf.translate(0, 0, 0.5);
  return leaf;
}

export function buildFlowerGeometry() {
  const parts = [];

  const stem = new THREE.CylinderGeometry(0.035, 0.055, STEM_HEIGHT, 8);
  stem.translate(0, STEM_HEIGHT / 2, 0);
  parts.push(colorize(stem, "#4a9e3f"));

  const leafBase = makeLeaf();
  const leafLeft = leafBase.clone();
  leafLeft.rotateX(-0.75);
  leafLeft.rotateY(0.7);
  leafLeft.translate(0, STEM_HEIGHT * 0.42, 0);
  parts.push(colorize(leafLeft, "#3f8f34"));

  const leafRight = leafBase.clone();
  leafRight.rotateX(-0.75);
  leafRight.rotateY(0.7 + Math.PI);
  leafRight.translate(0, STEM_HEIGHT * 0.6, 0);
  parts.push(colorize(leafRight, "#47a03c"));

  const petalBase = makePetal();
  colorize(petalBase, "#ffd21f");

  const outerCount = 12;
  for (let i = 0; i < outerCount; i += 1) {
    const petal = petalBase.clone();
    petal.rotateX(-0.3);
    petal.rotateY((i / outerCount) * Math.PI * 2);
    petal.translate(0, STEM_HEIGHT, 0);
    parts.push(petal);
  }

  const innerBase = petalBase.clone();
  innerBase.scale(0.82, 0.9, 0.68);
  colorize(innerBase, "#ffbe0b");

  const innerCount = 9;
  for (let i = 0; i < innerCount; i += 1) {
    const petal = innerBase.clone();
    petal.rotateX(-0.62);
    petal.rotateY((i / innerCount) * Math.PI * 2 + Math.PI / innerCount);
    petal.translate(0, STEM_HEIGHT + 0.04, 0);
    parts.push(petal);
  }

  const center = new THREE.SphereGeometry(0.32, 16, 12);
  center.scale(1, 0.68, 1);
  center.translate(0, STEM_HEIGHT + 0.06, 0);
  parts.push(colorize(center, "#7a4b12"));

  const merged = mergeGeometries(parts, false);
  merged.computeBoundingSphere();
  return merged;
}

function easeOutBack(p) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2);
}

export class FlowerField {
  constructor(count = 200, radius = 28) {
    this.growthDuration = 1.9;
    this.geometry = buildFlowerGeometry();
    this.material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.75,
      metalness: 0,
    });
    this.mesh = new THREE.InstancedMesh(this.geometry, this.material, count);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    this.dummy = new THREE.Object3D();
    this.tint = new THREE.Color();
    this.flowers = [];

    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.sqrt(Math.random()) * radius;
      this.flowers.push({
        x: Math.cos(angle) * distance,
        z: Math.sin(angle) * distance,
        rotationY: Math.random() * Math.PI * 2,
        scale: 0.55 + Math.random() * 1.05,
        delay: Math.random() * 2.6,
        phase: Math.random() * Math.PI * 2,
        speed: 0.9 + Math.random() * 0.6,
        pulse: -100,
      });

      this.tint.setRGB(
        0.96 + Math.random() * 0.04,
        0.94 + Math.random() * 0.06,
        0.84 + Math.random() * 0.16
      );
      this.mesh.setColorAt(i, this.tint);
    }
    if (this.mesh.instanceColor) {
      this.mesh.instanceColor.needsUpdate = true;
    }
  }

  pulseAt(index, elapsed) {
    if (this.flowers[index]) {
      this.flowers[index].pulse = elapsed;
    }
  }

  update(elapsed) {
    const { flowers, dummy, mesh } = this;

    for (let i = 0; i < flowers.length; i += 1) {
      const flower = flowers[i];
      const progress = THREE.MathUtils.clamp(
        (elapsed - flower.delay) / this.growthDuration,
        0,
        1
      );
      const grown = Math.max(easeOutBack(progress), 0.0001);
      const sincePulse = elapsed - flower.pulse;
      const bounce =
        sincePulse >= 0 && sincePulse < 1
          ? 1 + 0.3 * Math.cos(sincePulse * 16) * Math.exp(-sincePulse * 4)
          : 1;
      const scale = flower.scale * grown * bounce;
      const swayZ = Math.sin(elapsed * flower.speed + flower.phase) * 0.07 * progress;
      const swayX = Math.cos(elapsed * flower.speed * 0.8 + flower.phase) * 0.05 * progress;

      dummy.position.set(flower.x, 0, flower.z);
      dummy.rotation.set(swayX, flower.rotationY, swayZ);
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}
