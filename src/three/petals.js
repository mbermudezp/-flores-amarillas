import * as THREE from "three";

export class FloatingPetals {
  constructor(count = 160, radius = 30, height = 24) {
    this.height = height;
    this.radius = radius;

    const geometry = new THREE.SphereGeometry(0.5, 10, 6);
    geometry.scale(0.24, 0.05, 0.46);

    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.6,
      metalness: 0,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide,
    });

    this.geometry = geometry;
    this.material = material;
    this.mesh = new THREE.InstancedMesh(geometry, material, count);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.dummy = new THREE.Object3D();
    this.tint = new THREE.Color();
    this.items = [];

    for (let i = 0; i < count; i += 1) {
      this.items.push(this.createItem(true));

      this.tint.setHSL(
        0.13 + Math.random() * 0.04,
        0.85 + Math.random() * 0.15,
        0.5 + Math.random() * 0.14
      );
      this.mesh.setColorAt(i, this.tint);
    }

    if (this.mesh.instanceColor) {
      this.mesh.instanceColor.needsUpdate = true;
    }
  }

  createItem(spread) {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.sqrt(Math.random()) * this.radius;
    return {
      x: Math.cos(angle) * distance,
      y: spread ? Math.random() * this.height : this.height + Math.random() * 6,
      z: Math.sin(angle) * distance,
      fall: 0.5 + Math.random() * 1.1,
      drift: 0.6 + Math.random() * 1.4,
      phase: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 1.6,
      rotationX: Math.random() * Math.PI,
      rotationY: Math.random() * Math.PI,
      rotationZ: Math.random() * Math.PI,
    };
  }

  update(delta, elapsed) {
    const { items, dummy, mesh } = this;

    for (let i = 0; i < items.length; i += 1) {
      const petal = items[i];
      petal.y -= petal.fall * delta;
      petal.x += Math.sin(elapsed * petal.drift + petal.phase) * delta * 0.6;
      petal.rotationX += petal.spin * delta;
      petal.rotationY += petal.spin * delta * 0.7;
      petal.rotationZ += petal.spin * delta * 0.4;

      if (petal.y < -0.5) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.sqrt(Math.random()) * this.radius;
        petal.x = Math.cos(angle) * distance;
        petal.z = Math.sin(angle) * distance;
        petal.y = this.height + Math.random() * 6;
        petal.fall = 0.5 + Math.random() * 1.1;
      }

      dummy.position.set(petal.x, petal.y, petal.z);
      dummy.rotation.set(petal.rotationX, petal.rotationY, petal.rotationZ);
      dummy.scale.setScalar(1);
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
