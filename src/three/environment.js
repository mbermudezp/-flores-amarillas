import * as THREE from "three";

export function createSky(scene) {
  const geometry = new THREE.SphereGeometry(240, 32, 16);
  const material = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      topColor: { value: new THREE.Color("#5fb8ff") },
      midColor: { value: new THREE.Color("#bfe4ff") },
      bottomColor: { value: new THREE.Color("#ffe6a3") },
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 midColor;
      uniform vec3 bottomColor;
      varying vec3 vWorldPosition;
      void main() {
        float h = normalize(vWorldPosition).y;
        float upper = smoothstep(0.0, 0.7, h);
        float lower = smoothstep(-0.35, 0.05, h);
        vec3 color = mix(bottomColor, midColor, lower);
        color = mix(color, topColor, upper);
        gl_FragColor = vec4(color, 1.0);
      }
    `,
  });
  const sky = new THREE.Mesh(geometry, material);
  scene.add(sky);
  return sky;
}

function createGrassTexture() {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#6fae4a";
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 6000; i += 1) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const green = 120 + Math.random() * 70;
    ctx.fillStyle = `rgba(${40 + Math.random() * 40}, ${green}, ${35 + Math.random() * 35}, 0.7)`;
    ctx.fillRect(x, y, 2, 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(24, 24);
  texture.anisotropy = 4;
  return texture;
}

export function createGround(scene) {
  const geometry = new THREE.CircleGeometry(130, 72);
  geometry.rotateX(-Math.PI / 2);
  const material = new THREE.MeshStandardMaterial({
    map: createGrassTexture(),
    color: 0xa8d47a,
    roughness: 1,
    metalness: 0,
  });
  const ground = new THREE.Mesh(geometry, material);
  ground.receiveShadow = true;
  scene.add(ground);
  return ground;
}

export function createLights(scene) {
  const hemisphere = new THREE.HemisphereLight(0xbfe4ff, 0x6fae4a, 0.9);
  scene.add(hemisphere);

  const sun = new THREE.DirectionalLight(0xfff2c4, 2.1);
  sun.position.set(28, 42, 18);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 140;
  sun.shadow.camera.left = -45;
  sun.shadow.camera.right = 45;
  sun.shadow.camera.top = 45;
  sun.shadow.camera.bottom = -45;
  sun.shadow.bias = -0.0006;
  sun.shadow.normalBias = 0.02;
  scene.add(sun);
  scene.add(sun.target);

  const ambient = new THREE.AmbientLight(0xffffff, 0.35);
  scene.add(ambient);

  return { hemisphere, sun, ambient };
}

export function createSun(scene) {
  const group = new THREE.Group();

  const core = new THREE.Mesh(
    new THREE.SphereGeometry(7, 24, 24),
    new THREE.MeshBasicMaterial({ color: 0xfff6c9 })
  );
  group.add(core);

  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(13, 24, 24),
    new THREE.MeshBasicMaterial({
      color: 0xffe680,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
    })
  );
  group.add(glow);

  group.position.set(90, 70, -120);
  scene.add(group);
  return group;
}

function createCloud(scale) {
  const cloud = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 1,
    metalness: 0,
    transparent: true,
    opacity: 0.92,
  });

  const puffs = 5 + Math.floor(Math.random() * 4);
  for (let i = 0; i < puffs; i += 1) {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 10), material);
    const radius = 0.7 + Math.random() * 0.9;
    puff.scale.setScalar(radius);
    puff.position.set(
      (Math.random() - 0.5) * 6,
      (Math.random() - 0.5) * 1.4,
      (Math.random() - 0.5) * 3
    );
    cloud.add(puff);
  }

  cloud.scale.setScalar(scale);
  return cloud;
}

export function createClouds(scene) {
  const group = new THREE.Group();
  const clouds = [];

  for (let i = 0; i < 9; i += 1) {
    const cloud = createCloud(2 + Math.random() * 2.6);
    cloud.position.set(
      (Math.random() - 0.5) * 180,
      26 + Math.random() * 22,
      (Math.random() - 0.5) * 180
    );
    cloud.userData.speed = 0.6 + Math.random() * 0.9;
    group.add(cloud);
    clouds.push(cloud);
  }

  scene.add(group);

  return {
    group,
    update(delta) {
      clouds.forEach((cloud) => {
        cloud.position.x += cloud.userData.speed * delta;
        if (cloud.position.x > 110) {
          cloud.position.x = -110;
          cloud.position.z = (Math.random() - 0.5) * 180;
        }
      });
    },
  };
}
