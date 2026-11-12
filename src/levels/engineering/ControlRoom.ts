
import * as THREE from 'three';

export class ControlRoom {
  public group = new THREE.Group();

  private time = 0;
  private screens: THREE.Mesh[] = [];
  private warningLights: THREE.PointLight[] = [];
  private powerTerminal!: THREE.Mesh;

  private metal = new THREE.MeshStandardMaterial({
    color: 0x354b5c,
    metalness: 0.85,
    roughness: 0.38,
  });

  private darkMetal = new THREE.MeshStandardMaterial({
    color: 0x14212e,
    metalness: 0.8,
    roughness: 0.5,
  });

  private steel = new THREE.MeshStandardMaterial({
    color: 0x728c9e,
    metalness: 0.9,
    roughness: 0.3,
  });

  private black = new THREE.MeshStandardMaterial({
    color: 0x080f18,
    roughness: 0.8,
  });

  private cyan = new THREE.MeshStandardMaterial({
    color: 0x26cfff,
    emissive: 0x00aaff,
    emissiveIntensity: 1.8,
  });

  private amber = new THREE.MeshStandardMaterial({
    color: 0xffa64d,
    emissive: 0xff6b18,
    emissiveIntensity: 1.5,
  });

  private red = new THREE.MeshStandardMaterial({
    color: 0xff3434,
    emissive: 0xff0000,
    emissiveIntensity: 1.8,
  });

  private screenMaterials: THREE.MeshStandardMaterial[] = [];

  constructor() {
    this.group.name = 'EngineeringControlRoom';

    this.buildFloor();
    this.buildWalls();
    this.buildConsoles();
    this.buildPowerTerminal();
    this.buildEquipment();
    this.buildCeiling();
    this.buildLighting();
  }

  private box(
    w: number,
    h: number,
    d: number,
    x: number,
    y: number,
    z: number,
    material: THREE.Material,
    solid = false
  ): THREE.Mesh {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
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
      new THREE.CylinderGeometry(
        radius,
        radius,
        length,
        12
      ),
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

  private createScreen(
    x: number,
    y: number,
    z: number,
    width: number,
    height: number,
    rotationY = 0,
    warning = false
  ) {
    const frame = this.box(
      width + 0.16,
      height + 0.16,
      0.15,
      x,
      y,
      z,
      this.darkMetal
    );

    frame.rotation.y = rotationY;

    const material = new THREE.MeshStandardMaterial({
      color: warning ? 0x4a1218 : 0x063d58,
      emissive: warning ? 0xff2020 : 0x00aaff,
      emissiveIntensity: warning ? 1.1 : 1.4,
      roughness: 0.3,
      metalness: 0.2,
    });

    const screen = this.box(
      width,
      height,
      0.025,
      x + Math.sin(rotationY) * 0.095,
      y,
      z + Math.cos(rotationY) * 0.095,
      material
    );

    screen.rotation.y = rotationY;
    screen.userData.warning = warning;

    this.screens.push(screen);
    this.screenMaterials.push(material);

    // Horizontal diagnostic lines.
    for (let i = 0; i < 4; i++) {
      const line = this.box(
        width * (0.3 + (i % 3) * 0.2),
        0.025,
        0.008,
        x + Math.sin(rotationY) * 0.115,
        y + height * 0.3 - i * height * 0.19,
        z + Math.cos(rotationY) * 0.115,
        warning ? this.red : this.cyan
      );

      line.rotation.y = rotationY;
    }
  }

  private buildFloor() {
    // Decorative floor reinforcement.
    for (let z = -5; z <= 5; z += 2) {
      this.box(
        11.5,
        0.035,
        0.1,
        z,
        0.04,
        -24.5,
        this.steel
      );
    }

    // Central floor panel.
    this.box(
      5,
      0.045,
      4,
      0,
      0.05,
      -24.5,
      this.darkMetal
    );

    // Illuminated floor guidance strips.
    for (const x of [-2.6, 2.6]) {
      this.box(
        0.08,
        0.025,
        6,
        x,
        0.085,
        -24.5,
        this.cyan
      );
    }

    // Entrance threshold.
    this.box(
      4.2,
      0.08,
      0.35,
      0,
      0.06,
      -18.4,
      this.steel
    );
  }

  private buildWalls() {
    // Rear wall panels.
    for (let x = -5; x <= 5; x += 2) {
      this.box(
        1.8,
        5.8,
        0.15,
        x,
        4.2,
        -31.7,
        this.darkMetal
      );

      this.box(
        1.5,
        0.08,
        0.18,
        x,
        6.8,
        -31.55,
        this.steel
      );
    }

    // Side wall panels.
    for (const x of [-6.65, 6.65]) {
      for (const z of [-29, -26, -23, -20]) {
        this.box(
          0.13,
          5.5,
          2.4,
          x,
          4.2,
          z,
          this.metal
        );

        this.box(
          0.16,
          0.08,
          2.1,
          x,
          6.7,
          z,
          this.cyan
        );
      }
    }

    // Structural columns.
    for (const x of [-6.3, 6.3]) {
      for (const z of [-30.5, -19]) {
        this.box(
          0.45,
          8.7,
          0.45,
          x,
          4.35,
          z,
          this.steel
        );
      }
    }
  }

  private buildConsoles() {
    // Three operator stations along the rear wall.
    for (const x of [-3.8, 0, 3.8]) {
      this.box(
        2.8,
        1.1,
        1.3,
        x,
        0.55,
        -29.6,
        this.darkMetal,
        true
      );

      // Console top.
      const top = this.box(
        3,
        0.12,
        1.5,
        x,
        1.17,
        -29.6,
        this.steel
      );

      top.rotation.x = -0.08;

      // Two monitors per station.
      this.createScreen(
        x - 0.65,
        2.05,
        -30.15,
        1.2,
        0.85
      );

      this.createScreen(
        x + 0.65,
        2.05,
        -30.15,
        1.2,
        0.85,
        0,
        x === 0
      );

      // Console buttons.
      for (let i = 0; i < 6; i++) {
        this.box(
          0.14,
          0.045,
          0.14,
          x - 0.9 + (i % 3) * 0.4,
          1.26,
          -29.15 - Math.floor(i / 3) * 0.25,
          i === 0 ? this.amber : this.cyan
        );
      }
    }

    // Side monitoring stations.
    for (const x of [-5.7, 5.7]) {
      for (const z of [-26.5, -22]) {
        this.box(
          1.1,
          1.2,
          2.5,
          x,
          0.6,
          z,
          this.darkMetal,
          true
        );

        this.box(
          1.25,
          0.1,
          2.7,
          x,
          1.25,
          z,
          this.steel
        );

        // Side-facing screen.
        const rotation = x < 0
          ? Math.PI / 2
          : -Math.PI / 2;

        this.createScreen(
          x < 0 ? x + 0.4 : x - 0.4,
          2.1,
          z,
          1.25,
          0.9,
          rotation
        );
      }
    }
  }

  private buildPowerTerminal() {
    // Main engineering power management terminal.
    // This becomes interactive in the puzzle milestone.

    this.box(
      2.4,
      1.25,
      1.5,
      0,
      0.625,
      -24,
      this.darkMetal,
      true
    );

    this.box(
      2.65,
      0.12,
      1.7,
      0,
      1.3,
      -24,
      this.steel
    );

    // Main monitor housing.
    this.box(
      2.2,
      1.5,
      0.25,
      0,
      2.35,
      -24.55,
      this.metal
    );

    const screenMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x173e48,
        emissive: 0x00b7ff,
        emissiveIntensity: 1.4,
        roughness: 0.25,
      });

    this.powerTerminal = this.box(
      1.95,
      1.25,
      0.04,
      0,
      2.35,
      -24.39,
      screenMaterial
    );

    this.powerTerminal.name = 'EngineeringPowerTerminal';

    this.powerTerminal.userData.interactable = true;
    this.powerTerminal.userData.interactionType =
      'restorePower';

    this.screens.push(this.powerTerminal);
    this.screenMaterials.push(screenMaterial);

    // Main emergency indicator.
    this.box(
      1.4,
      0.13,
      0.08,
      0,
      3.25,
      -24.4,
      this.red
    );

    // Terminal controls.
    for (let i = 0; i < 5; i++) {
      this.box(
        0.2,
        0.06,
        0.2,
        -0.8 + i * 0.4,
        1.42,
        -23.55,
        i === 0 ? this.amber : this.cyan
      );
    }
  }

  private buildEquipment() {
    // Server racks near the side walls.
    for (const x of [-5.5, 5.5]) {
      for (const z of [-28.5, -20.5]) {
        this.box(
          1.25,
          3.6,
          1.4,
          x,
          1.8,
          z,
          this.black,
          true
        );

        for (let i = 0; i < 6; i++) {
          this.box(
            0.08,
            0.12,
            0.75,
            x < 0 ? x + 0.68 : x - 0.68,
            0.7 + i * 0.43,
            z,
            i % 3 === 0 ? this.amber : this.cyan
          );
        }
      }
    }

    // Suspended cable conduits.
    for (const x of [-4.8, 4.8]) {
      this.cylinder(
        0.13,
        10,
        x,
        7.9,
        -24.5,
        this.steel,
        'z'
      );
    }

    // Wall-mounted emergency boxes.
    for (const z of [-28, -22]) {
      this.box(
        0.45,
        1.1,
        0.85,
        -6.45,
        4.2,
        z,
        this.darkMetal
      );

      this.box(
        0.06,
        0.5,
        0.55,
        -6.19,
        4.2,
        z,
        this.red
      );
    }
  }

  private buildCeiling() {
    // Overhead structural beams.
    for (const z of [-30, -27, -24, -21]) {
      this.box(
        12.8,
        0.28,
        0.4,
        0,
        8.55,
        z,
        this.steel
      );
    }

    // Ventilation units.
    for (const x of [-3.5, 3.5]) {
      this.box(
        2.6,
        0.3,
        2,
        x,
        8.6,
        -24.5,
        this.darkMetal
      );

      for (let i = -3; i <= 3; i++) {
        this.box(
          0.12,
          0.05,
          1.7,
          x + i * 0.32,
          8.4,
          -24.5,
          this.steel
        );
      }
    }
  }

  private buildLighting() {
    // Blue overhead work lights.
    for (const x of [-3.8, 3.8]) {
      for (const z of [-28, -21]) {
        this.box(
          2.2,
          0.2,
          0.7,
          x,
          8.25,
          z,
          this.darkMetal
        );

        this.box(
          1.9,
          0.05,
          0.45,
          x,
          8.12,
          z,
          this.cyan
        );
      }
    }

    // Main room illumination.
    for (const z of [-28, -21]) {
      const light = new THREE.PointLight(
        0x57baff,
        28,
        11
      );

      light.position.set(0, 7.2, z);
      this.group.add(light);
    }

    // Emergency red lighting.
    for (const x of [-5.7, 5.7]) {
      const light = new THREE.PointLight(
        0xff3030,
        8,
        5
      );

      light.position.set(x, 5.8, -30);
      this.group.add(light);
      this.warningLights.push(light);
    }

    // Terminal accent lighting.
    const terminalLight = new THREE.PointLight(
      0x00bfff,
      9,
      5
    );

    terminalLight.position.set(0, 3, -24);
    this.group.add(terminalLight);
  }

  update(delta: number) {
    this.time += delta;

    // Subtle monitor activity.
    for (let i = 0; i < this.screenMaterials.length; i++) {
      const material = this.screenMaterials[i];

      const pulse =
        Math.sin(this.time * 1.5 + i * 0.7) * 0.15;

      material.emissiveIntensity = 1.4 + pulse;
    }

    // Emergency warning lights.
    for (let i = 0; i < this.warningLights.length; i++) {
      const pulse =
        Math.sin(this.time * 3 + i * 2) * 2;

      this.warningLights[i].intensity = 8 + pulse;
    }
  }
}
