
import * as THREE from 'three';

export class Storage {
  public group = new THREE.Group();

  private time = 0;
  private warningLights: THREE.PointLight[] = [];
  private powerCell!: THREE.Mesh;

  private metal = new THREE.MeshStandardMaterial({
    color: 0x34495b,
    metalness: 0.85,
    roughness: 0.38,
  });

  private darkMetal = new THREE.MeshStandardMaterial({
    color: 0x172532,
    metalness: 0.8,
    roughness: 0.52,
  });

  private steel = new THREE.MeshStandardMaterial({
    color: 0x708797,
    metalness: 0.9,
    roughness: 0.3,
  });

  private crateBlue = new THREE.MeshStandardMaterial({
    color: 0x385c72,
    metalness: 0.6,
    roughness: 0.55,
  });

  private crateOrange = new THREE.MeshStandardMaterial({
    color: 0x93603a,
    metalness: 0.5,
    roughness: 0.6,
  });

  private amber = new THREE.MeshStandardMaterial({
    color: 0xffa348,
    emissive: 0xff6b16,
    emissiveIntensity: 2,
  });

  private cyan = new THREE.MeshStandardMaterial({
    color: 0x47dfff,
    emissive: 0x00aaff,
    emissiveIntensity: 2.5,
  });

  private black = new THREE.MeshStandardMaterial({
    color: 0x0b1119,
    roughness: 0.9,
  });

  constructor() {
    this.group.name = 'CargoStorage';

    this.buildFloor();
    this.buildWalls();
    this.buildShelving();
    this.buildCargo();
    this.buildMachinery();
    this.buildCeiling();
    this.buildLighting();
    this.buildPowerCellLocation();
  }

  private box(
    width: number,
    height: number,
    depth: number,
    x: number,
    y: number,
    z: number,
    material: THREE.Material,
    solid = false
  ): THREE.Mesh {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth),
      material
    );

    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.solid = solid;

    this.group.add(mesh);
    return mesh;
  }

  private cylinder(
    radius: number,
    length: number,
    x: number,
    y: number,
    z: number,
    material: THREE.Material,
    axis: 'x' | 'y' | 'z' = 'y'
  ): THREE.Mesh {
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius, length, 12),
      material
    );

    if (axis === 'x') mesh.rotation.z = Math.PI / 2;
    if (axis === 'z') mesh.rotation.x = Math.PI / 2;

    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.solid = false;

    this.group.add(mesh);
    return mesh;
  }

  private buildFloor() {
    // Floor reinforcement strips.
    for (let z = -6; z <= 6; z += 2) {
      this.box(
        12.5, 0.035, 0.1,
        -25, 0.035, z,
        this.steel
      );
    }

    // Metal grating along the storage perimeter.
    for (const x of [-31.1, -19.1]) {
      this.box(
        0.8, 0.045, 14,
        x, 0.045, 0,
        this.darkMetal
      );

      for (let z = -6.7; z <= 6.7; z += 0.55) {
        this.box(
          0.7, 0.055, 0.055,
          x, 0.075, z,
          this.steel
        );
      }
    }

    // Warning markings around the central work area.
    for (const x of [-28.5, -21.5]) {
      for (let z = -5; z <= 5; z += 1.2) {
        const stripe = this.box(
          0.12, 0.015, 0.55,
          x, 0.065, z,
          this.amber
        );
        stripe.rotation.y = Math.PI / 4;
      }
    }
  }

  private buildWalls() {
    // Wall-mounted industrial panels.
    // Leave the east doorway clear at x = -18, z = 0.
    for (const x of [-31.7, -18.3]) {
      for (let z = -6; z <= 6; z += 3) {
        if (x > -20 && Math.abs(z) < 3) continue;

        this.box(
          0.12, 4.6, 2.6,
          x, 4.5, z,
          this.darkMetal
        );

        this.box(
          0.15, 0.08, 2.3,
          x, 6.7, z,
          this.steel
        );
      }
    }

    // Horizontal wall conduits.
    for (const z of [-7.65, 7.65]) {
      for (const y of [3.5, 6.5]) {
        this.box(
          12.5, 0.12, 0.12,
          -25, y, z,
          this.steel
        );
      }
    }

    // Vertical structural braces.
    for (const x of [-30, -26, -22, -20]) {
      for (const z of [-7.55, 7.55]) {
        this.box(
          0.3, 8.5, 0.35,
          x, 4.3, z,
          this.metal
        );
      }
    }
  }

  private buildShelving() {
    // Shelving is kept against the north and south walls.
    // The central route stays open for movement.
    const shelves = [
      { x: -29.5, z: -5.5 },
      { x: -25.5, z: -5.5 },
      { x: -21.5, z: -5.5 },
      { x: -29.5, z: 5.5 },
      { x: -25.5, z: 5.5 },
      { x: -21.5, z: 5.5 },
    ];

    for (const shelf of shelves) {
      const w = 3.1;
      const h = 5.6;
      const d = 1.5;

      // One simplified collision box per shelf.
      // The visible shelves and posts remain decorative.
      const collider = this.box(
        w, h, d,
        shelf.x, h / 2, shelf.z,
        this.darkMetal,
        true
      );
      collider.visible = false;
      collider.userData.solid = true;

      for (const dx of [-w / 2, w / 2]) {
        for (const dz of [-d / 2, d / 2]) {
          this.box(
            0.13, h, 0.13,
            shelf.x + dx,
            h / 2,
            shelf.z + dz,
            this.steel
          );
        }
      }

      for (const y of [0.2, 1.9, 3.6, 5.4]) {
        this.box(
          w, 0.12, d,
          shelf.x, y, shelf.z,
          this.metal
        );
      }

      // Storage boxes on different shelves.
      for (const y of [0.95, 2.65, 4.35]) {
        this.box(
          0.9, 0.8, 0.9,
          shelf.x - 0.7,
          y,
          shelf.z,
          this.crateBlue
        );

        this.box(
          0.85, 0.75, 0.85,
          shelf.x + 0.65,
          y,
          shelf.z,
          this.crateOrange
        );
      }
    }
  }

  private buildCargo() {
    // Cargo stacks placed away from the doorway.
    const stacks = [
      { x: -30.3, z: -2.3, levels: 2 },
      { x: -30.3, z: 1.2, levels: 3 },
      { x: -20.2, z: -4.0, levels: 2 },
      { x: -20.2, z: 4.0, levels: 2 },
    ];

    for (const stack of stacks) {
      const size = 1.35;

      for (let level = 0; level < stack.levels; level++) {
        const y = size / 2 + level * size;

        this.box(
          size, size, size,
          stack.x, y, stack.z,
          level % 2 === 0
            ? this.crateBlue
            : this.crateOrange,
          true
        );

        // Container edge reinforcement.
        for (const dx of [-0.59, 0.59]) {
          this.box(
            0.07, 1.25, 0.07,
            stack.x + dx,
            y,
            stack.z + 0.65,
            this.steel
          );
        }

        this.box(
          0.9, 0.12, 0.03,
          stack.x, y,
          stack.z + 0.69,
          this.darkMetal
        );
      }
    }
  }

  private buildMachinery() {
    // Maintenance cabinets along the western wall.
    for (const z of [-4.5, 4.5]) {
      this.box(
        0.85, 2.6, 1.5,
        -31, 1.3, z,
        this.metal,
        true
      );

      this.box(
        0.08, 1.9, 1.1,
        -30.52, 1.4, z,
        this.darkMetal
      );

      this.box(
        0.1, 0.6, 0.12,
        -30.45, 1.4, z + 0.35,
        this.steel
      );

      this.box(
        0.1, 0.08, 0.2,
        -30.45, 2.35, z - 0.4,
        this.amber
      );
    }

    // Wall-mounted electrical distribution boxes.
    for (const z of [-3, 3]) {
      this.box(
        0.45, 1.8, 1.3,
        -31.5, 5, z,
        this.darkMetal
      );

      for (let i = 0; i < 3; i++) {
        this.box(
          0.07, 0.09, 0.18,
          -31.24,
          5.5 - i * 0.35,
          z,
          i === 0 ? this.amber : this.cyan
        );
      }
    }

    // Maintenance workbench.
    this.box(
      2.5, 1.05, 1.2,
      -26, 0.525, -3.2,
      this.darkMetal,
      true
    );

    this.box(
      2.7, 0.13, 1.35,
      -26, 1.12, -3.2,
      this.steel
    );

    // Tools and small equipment.
    for (let i = 0; i < 4; i++) {
      this.box(
        0.25, 0.2, 0.45,
        -26.9 + i * 0.6,
        1.33,
        -3.2,
        this.metal
      );
    }
  }

  private buildCeiling() {
    // Overhead support beams.
    for (const z of [-6, -2, 2, 6]) {
      this.box(
        13.3, 0.28, 0.4,
        -25, 8.65, z,
        this.steel
      );
    }

    // Long industrial pipes.
    for (const x of [-30.3, -29.6, -20.3]) {
      this.cylinder(
        0.16, 13.5,
        x, 8.25, 0,
        this.steel,
        'z'
      );
    }

    // Pipe clamps.
    for (const z of [-5, 0, 5]) {
      for (const x of [-30.3, -29.6, -20.3]) {
        this.box(
          0.45, 0.4, 0.16,
          x, 8.25, z,
          this.darkMetal
        );
      }
    }

    // Ceiling ventilation units.
    for (const x of [-28, -22]) {
      this.box(
        2.4, 0.3, 2,
        x, 8.7, 0,
        this.darkMetal
      );

      for (let i = -3; i <= 3; i++) {
        this.box(
          0.12, 0.04, 1.7,
          x + i * 0.28,
          8.52, 0,
          this.steel
        );
      }
    }
  }

  private buildLighting() {
    // Warm ceiling-mounted work lights.
    for (const x of [-29, -21]) {
      for (const z of [-3.5, 3.5]) {
        this.box(
          1.8, 0.18, 0.65,
          x, 8.35, z,
          this.darkMetal
        );

        this.box(
          1.55, 0.05, 0.42,
          x, 8.22, z,
          this.amber
        );
      }
    }

    // Two local lights rather than one per fixture.
    for (const z of [-3.5, 3.5]) {
      const light = new THREE.PointLight(
        0xffaa65,
        35,
        10
      );

      light.position.set(-25, 7.5, z);
      this.group.add(light);
      this.warningLights.push(light);
    }

    // Cyan utility lighting near the equipment.
    const utilityLight = new THREE.PointLight(
      0x35bfff,
      18,
      7
    );

    utilityLight.position.set(-30, 3.5, 0);
    this.group.add(utilityLight);
  }

  private buildPowerCellLocation() {
    // Future puzzle objective.
    // This is a visual placeholder, not collectible yet.

    this.box(
      1.5, 0.75, 1.3,
      -27, 0.375, 2.5,
      this.darkMetal,
      true
    );

    this.box(
      1.3, 0.08, 1.1,
      -27, 0.79, 2.5,
      this.steel
    );

    this.powerCell = this.cylinder(
      0.22, 0.75,
      -27, 1.25, 2.5,
      this.cyan
    );

    this.powerCell.name = 'EngineeringPowerCell';
    this.powerCell.userData.interactable = true;
    this.powerCell.userData.itemType = 'powerCell';

    // Energy bands.
    for (const y of [0.95, 1.55]) {
      this.cylinder(
        0.26, 0.09,
        -27, y, 2.5,
        this.steel
      );
    }

    const glow = new THREE.PointLight(
      0x00cfff,
      10,
      4
    );

    glow.position.set(-27, 1.4, 2.5);
    this.group.add(glow);
  }

  update(delta: number) {
    this.time += delta;

    // Subtle emergency light flickering.
    for (let i = 0; i < this.warningLights.length; i++) {
      const flicker =
        Math.sin(this.time * 2.5 + i * 1.7) * 4;

      this.warningLights[i].intensity = 35 + flicker;
    }

    // Power cell energy pulse.
    if (this.powerCell) {
      this.powerCell.rotation.y += delta * 0.8;

      this.powerCell.position.y =
        1.25 + Math.sin(this.time * 2) * 0.06;
    }
  }
}
