
import * as THREE from 'three';

export class EngineeringRoom {
  public group = new THREE.Group();

  constructor() {
    const metal = new THREE.MeshStandardMaterial({
      color: 0x303b48,
      metalness: 0.75,
      roughness: 0.4,
    });

    const wall = new THREE.MeshStandardMaterial({
      color: 0x202b38,
      metalness: 0.65,
      roughness: 0.5,
    });

    const createBox = (
      width: number,
      height: number,
      depth: number,
      x: number,
      y: number,
      z: number,
      material: THREE.Material
    ) => {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, depth),
        material
      );

      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.group.add(mesh);
      return mesh;
    };

    // Room dimensions: 20 x 8 x 20
    createBox(20, 0.5, 20, 0, -0.25, 0, metal);
    createBox(20, 0.5, 20, 0, 8.25, 0, metal);

    createBox(0.5, 8, 20, -10, 4, 0, wall);
    createBox(0.5, 8, 20, 10, 4, 0, wall);
    createBox(20, 8, 0.5, 0, 4, -10, wall);
    createBox(20, 8, 0.5, 0, 4, 10, wall);

    // Structural wall panels
    for (let x = -8; x <= 8; x += 4) {
      createBox(0.18, 8, 0.35, x, 4, -9.65, metal);
      createBox(0.18, 8, 0.35, x, 4, 9.65, metal);
    }

    // Cargo containers
    createBox(2, 2, 2, -6, 1, -5, metal);
    createBox(2, 3, 2, -6, 1.5, -2.8, metal);
    createBox(3, 1.5, 2, 6, 0.75, -5, metal);

    // Locked door
    const doorMaterial = new THREE.MeshStandardMaterial({
      color: 0x4b2428,
      metalness: 0.8,
      roughness: 0.35,
    });

    createBox(3.5, 5, 0.3, 0, 2.5, -9.55, doorMaterial);

    // Door warning light
    const warning = new THREE.PointLight(0xff2222, 15, 8);
    warning.position.set(0, 5.8, -8.7);
    this.group.add(warning);

    // Ceiling lights
    for (const x of [-6, 0, 6]) {
      const light = new THREE.PointLight(0x75baff, 25, 12);
      light.position.set(x, 7.3, 0);
      this.group.add(light);

      createBox(
        1.5, 0.1, 0.4,
        x, 7.95, 0,
        new THREE.MeshStandardMaterial({
          color: 0x99ccff,
          emissive: 0x4488ff,
          emissiveIntensity: 2,
        })
      );
    }
  }
}
