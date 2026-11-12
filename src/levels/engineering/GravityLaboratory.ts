
import * as THREE from 'three';

export class GravityLaboratory {
  public group = new THREE.Group();

  private time = 0;
  private warningLights: THREE.PointLight[] = [];
  private energyRings: THREE.Mesh[] = [];
  private powerCell!: THREE.Mesh;
  private energyLight!: THREE.PointLight;

  private metal = new THREE.MeshStandardMaterial({
    color: 0x34475c,
    metalness: 0.82,
    roughness: 0.4,
  });

  private dark = new THREE.MeshStandardMaterial({
    color: 0x111d2d,
    metalness: 0.7,
    roughness: 0.55,
  });

  private steel = new THREE.MeshStandardMaterial({
    color: 0x7894a9,
    metalness: 0.9,
    roughness: 0.32,
  });

  private purple = new THREE.MeshStandardMaterial({
    color: 0x7648ce,
    emissive: 0x5224d6,
    emissiveIntensity: 1.8,
    metalness: 0.35,
    roughness: 0.3,
  });

  private cyan = new THREE.MeshStandardMaterial({
    color: 0x32d9ff,
    emissive: 0x00aaff,
    emissiveIntensity: 2,
    metalness: 0.35,
    roughness: 0.25,
  });

  private amber = new THREE.MeshStandardMaterial({
    color: 0xffa54c,
    emissive: 0xff6518,
    emissiveIntensity: 1.4,
  });

  private red = new THREE.MeshStandardMaterial({
    color: 0xe94b53,
    emissive: 0xb91425,
    emissiveIntensity: 1.6,
  });

  constructor() {
    this.group.name = 'GravityLaboratory';

    this.buildArchitecture();
    this.buildContainmentChamber();
    this.buildConsoles();
    this.buildCeilingEquipment();
    this.buildPowerCellStation();
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
        radius, radius, length, 16
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

  private buildArchitecture() {
    // Decorative wall panels.
    // Keep the western entrance at x = 18, z = 0 clear.

    for (const z of [-7.7, 7.7]) {
      for (const x of [20, 23, 26, 29, 31]) {
        this.box(
          2.3, 5.5, 0.12,
          x, 4.4, z,
          this.dark
        );

        this.box(
          1.8, 0.07, 0.14,
          x, 6.8, z * 0.99,
          this.purple
        );
      }
    }

    // Eastern wall supports.
    for (const z of [-6, -3, 0, 3, 6]) {
      this.box(
        0.3, 8.4, 0.35,
        31.65, 4.25, z,
        this.steel
      );
    }

    // Western wall supports, away from doorway.
    for (const z of [-6, -4, 4, 6]) {
      this.box(
        0.28, 8.2, 0.3,
        18.35, 4.2, z,
        this.metal
      );
    }

    // Floor reinforcement.
    for (const z of [-6, -3, 0, 3, 6]) {
      this.box(
        12.8, 0.035, 0.1,
        25, 0.04, z,
        this.steel
      );
    }

    // Walkway guidance lights from entrance.
    for (const z of [-1.65, 1.65]) {
      this.box(
        7.5, 0.025, 0.07,
        22.3, 0.065, z,
        this.cyan
      );
    }

    // Hazard markings around the experiment zone.
    for (const x of [25.2, 29.5]) {
      for (const z of [-3.4, 3.4]) {
        const stripe = this.box(
          0.75, 0.02, 0.13,
          x, 0.07, z,
          this.amber
        );

        stripe.rotation.y = Math.PI / 4;
      }
    }

    // Upper wall rails, useful visual landmarks
    // when the player changes gravity.
    for (const z of [-7.5, 7.5]) {
      this.box(
        12, 0.14, 0.16,
        25, 7.2, z,
        this.steel
      );
    }
  }

  private buildContainmentChamber() {
    // Experimental containment apparatus.
    // Positioned toward the eastern side of the lab.
    const cx = 28;
    const cz = 0;

    // Solid equipment base.
    this.box(
      3.5, 0.65, 3.5,
      cx, 0.325, cz,
      this.dark,
      true
    );

    this.box(
      3.2, 0.12, 3.2,
      cx, 0.72, cz,
      this.steel
    );

    // Four structural supports.
    for (const dx of [-1.45, 1.45]) {
      for (const dz of [-1.45, 1.45]) {
        this.box(
          0.2, 5.5, 0.2,
          cx + dx, 3.5, cz + dz,
          this.metal
        );
      }
    }

    // Suspended containment rings.
    for (let i = 0; i < 4; i++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(
          1.05 + i * 0.06,
          0.065,
          10,
          48
        ),
        i % 2 === 0 ? this.purple : this.cyan
      );

      ring.position.set(
        cx,
        1.6 + i * 1.05,
        cz
      );

      ring.rotation.x = Math.PI / 2;
      ring.userData.solid = false;

      this.group.add(ring);
      this.energyRings.push(ring);
    }

    // Inner energy column.
    const energyCore = this.cylinder(
      0.28, 3.8,
      cx, 3.5, cz,
      this.purple
    );

    energyCore.name = 'GravityExperimentCore';

    // Top containment assembly.
    this.box(
      3.5, 0.45, 3.5,
      cx, 6.65, cz,
      this.dark
    );

    this.box(
      2.5, 0.12, 2.5,
      cx, 6.35, cz,
      this.steel
    );

    // Energy source lighting.
    this.energyLight = new THREE.PointLight(
      0x9955ff,
      28,
      9
    );

    this.energyLight.position.set(cx, 3.5, cz);
    this.group.add(this.energyLight);
  }

  private buildConsoles() {
    // Research workstations along the north wall.
    for (const x of [21, 24]) {
      this.box(
        2.2, 1.1, 1.1,
        x, 0.55, -6.5,
        this.dark,
        true
      );

      this.box(
        2.35, 0.1, 1.2,
        x, 1.15, -6.5,
        this.steel
      );

      // Monitor housing.
      this.box(
        1.5, 1.15, 0.16,
        x, 2.05, -6.85,
        this.metal
      );

      // Glowing display.
      this.box(
        1.3, 0.95, 0.035,
        x, 2.05, -6.75,
        this.cyan
      );

      // Diagnostic display bars.
      for (let i = 0; i < 4; i++) {
        this.box(
          0.15 + i * 0.17,
          0.045, 0.04,
          x - 0.4,
          2.3 - i * 0.18,
          -6.72,
          i === 0 ? this.red : this.purple
        );
      }

      // Keyboard controls.
      for (let i = 0; i < 5; i++) {
        this.box(
          0.12, 0.035, 0.13,
          x - 0.65 + i * 0.3,
          1.23,
          -6.1,
          i === 0 ? this.amber : this.cyan
        );
      }
    }

    // Tall research equipment cabinets.
    for (const z of [-5.4, 5.4]) {
      this.box(
        1.0, 3.2, 1.3,
        30.8, 1.6, z,
        this.dark,
        true
      );

      for (let i = 0; i < 5; i++) {
        this.box(
          0.08, 0.08, 0.65,
          30.25,
          0.7 + i * 0.5,
          z,
          i === 0 ? this.red : this.cyan
        );
      }
    }

    // Wall-mounted diagnostic module.
    this.box(
      0.35, 1.5, 1.6,
      31.55, 5.2, 4,
      this.dark
    );

    for (let i = 0; i < 3; i++) {
      this.box(
        0.07, 0.12, 0.3,
        31.32,
        5.65 - i * 0.35,
        4,
        i === 0 ? this.red : this.cyan
      );
    }
  }

  private buildCeilingEquipment() {
    // Ceiling beams.
    for (const z of [-6, -2, 2, 6]) {
      this.box(
        12.5, 0.25, 0.35,
        25, 8.65, z,
        this.steel
      );
    }

    // Overhead conduits.
    for (const x of [20, 21, 30]) {
      this.cylinder(
        0.13, 13.5,
        x, 8.25, 0,
        this.steel,
        'z'
      );
    }

    // Ventilation grilles.
    for (const z of [-4.5, 4.5]) {
      this.box(
        2.4, 0.25, 1.8,
        24, 8.7, z,
        this.dark
      );

      for (let i = -3; i <= 3; i++) {
        this.box(
          0.12, 0.04, 1.5,
          24 + i * 0.3,
          8.53,
          z,
          this.steel
        );
      }
    }

    // Suspended laboratory light fixtures.
    for (const z of [-4, 4]) {
      this.box(
        2.4, 0.15, 0.7,
        25, 8.3, z,
        this.dark
      );

      this.box(
        2.1, 0.04, 0.45,
        25, 8.2, z,
        this.purple
      );
    }
  }

  private buildPowerCellStation() {
    // High-mounted power-cell station.
    // Reaching it should encourage gravity manipulation.
    // This is visual only until the puzzle system is added.

    const x = 21.5;
    const y = 7.25;
    const z = 4.8;

    // Solid platform, accessible using wall/ceiling walking.
    this.box(
      2.8, 0.35, 2.5,
      x, y - 0.175, z,
      this.metal,
      true
    );

    // Platform edge lighting.
    this.box(
      2.5, 0.07, 0.12,
      x, y + 0.04, z + 1.1,
      this.cyan
    );

    // Power-cell pedestal.
    this.box(
      1.2, 0.45, 1.2,
      x, y + 0.225, z,
      this.dark,
      true
    );

    this.box(
      1.0, 0.06, 1.0,
      x, y + 0.48, z,
      this.steel
    );

    // Power cell.
    this.powerCell = this.cylinder(
      0.2, 0.7,
      x, y + 0.9, z,
      this.cyan
    );

    this.powerCell.name = 'GravityLabPowerCell';
    this.powerCell.userData.interactable = true;
    this.powerCell.userData.itemType = 'powerCell';

    // Metallic containment caps.
    for (const dy of [-0.28, 0.28]) {
      this.cylinder(
        0.25, 0.09,
        x, y + 0.9 + dy, z,
        this.steel
      );
    }

    // Station status light.
    const glow = new THREE.PointLight(
      0x00ccff,
      12,
      5
    );

    glow.position.set(x, y + 1.1, z);
    this.group.add(glow);

    // Warning strips on the nearby wall.
    for (const offset of [-0.8, 0, 0.8]) {
      this.box(
        0.12, 0.55, 0.08,
        18.45, 6.5, z + offset,
        this.amber
      );
    }
  }

  private buildLighting() {
    // Cool purple ambient illumination.
    const purpleLight = new THREE.PointLight(
      0x8662ff,
      30,
      11
    );

    purpleLight.position.set(24, 7, -2);
    this.group.add(purpleLight);

    // Cyan work lighting near entrance.
    const entryLight = new THREE.PointLight(
      0x49d6ff,
      18,
      8
    );

    entryLight.position.set(20, 6, 0);
    this.group.add(entryLight);

    // Red warning indicators.
    for (const z of [-6.5, 6.5]) {
      this.box(
        0.5, 0.16, 0.5,
        31.45, 6.8, z,
        this.red
      );

      const light = new THREE.PointLight(
        0xff3030,
        5,
        4
      );

      light.position.set(31, 6.8, z);
      this.group.add(light);
      this.warningLights.push(light);
    }
  }

  update(delta: number) {
    this.time += delta;

    // Animated containment rings.
    for (let i = 0; i < this.energyRings.length; i++) {
      const ring = this.energyRings[i];

      ring.rotation.y +=
        delta * (i % 2 === 0 ? 0.45 : -0.55);

      ring.position.y =
        1.6 + i * 1.05 +
        Math.sin(this.time * 1.8 + i) * 0.08;
    }

    // Energy core pulse.
    this.energyLight.intensity =
      28 + Math.sin(this.time * 2.5) * 5;

    // Warning lights.
    for (let i = 0; i < this.warningLights.length; i++) {
      this.warningLights[i].intensity =
        5 + Math.max(
          0,
          Math.sin(this.time * 3 + i * 1.8)
        ) * 4;
    }

    // Floating power cell.
    this.powerCell.rotation.y += delta * 0.8;

    this.powerCell.position.y =
      8.15 + Math.sin(this.time * 2) * 0.06;
  }
}
