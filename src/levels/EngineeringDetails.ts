
import * as THREE from 'three';

export class EngineeringDetails {
  public group = new THREE.Group();

  private metal = new THREE.MeshStandardMaterial({
    color: 0x263543,
    metalness: 0.85,
    roughness: 0.4,
  });

  private darkMetal = new THREE.MeshStandardMaterial({
    color: 0x101923,
    metalness: 0.8,
    roughness: 0.5,
  });

  private cyan = new THREE.MeshStandardMaterial({
  color: 0x0077aa,
  emissive: 0x0088dd,
  emissiveIntensity: 1.5,
  metalness: 0.5,
  roughness: 0.25,
});

  private orange = new THREE.MeshStandardMaterial({
    color: 0xff692b,
    emissive: 0xff3300,
    emissiveIntensity: 2,
  });

  private reactorCore!: THREE.Mesh;
  private reactorLight!: THREE.PointLight;
  private time = 0;

  constructor() {
    this.addStructuralBeams();
    this.addPipes();
    this.addCeilingVents();
    this.addReactor();
    this.addEmergencyLights();
  }

  private box(
    width: number,
    height: number,
    depth: number,
    x: number,
    y: number,
    z: number,
    material: THREE.Material
  ) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth),
      material
    );

    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.group.add(mesh);

    return mesh;
  }

  private addStructuralBeams() {
    // Reinforced wall supports.
    for (const x of [-8, -4, 0, 4, 8]) {
      this.box(
        0.35, 8, 0.55,
        x, 4, -9.55,
        this.metal
      );

      this.box(
        0.35, 8, 0.55,
        x, 4, 9.55,
        this.metal
      );
    }

    // Ceiling crossbeams.
    for (const z of [-7, -3, 1, 5, 8]) {
      this.box(
        19, 0.4, 0.55,
        0, 7.75, z,
        this.darkMetal
      );
    }

    // Floor reinforcement strips.
    for (const x of [-8, -4, 4, 8]) {
      this.box(
        0.22, 0.06, 19,
        x, 0.04, 0,
        this.metal
      );
    }
  }

  private addPipes() {
    const pipeMaterial = new THREE.MeshStandardMaterial({
      color: 0x536879,
      metalness: 0.95,
      roughness: 0.3,
    });

    for (const y of [5.8, 6.5, 7.1]) {
      const pipe = new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.13, 0.13, 18, 12
        ),
        pipeMaterial
      );

      pipe.rotation.z = Math.PI / 2;
      pipe.position.set(0, y, -9.25);

      this.group.add(pipe);
    }

    // Vertical pipes along the side wall.
    for (const z of [-7, -3, 3, 7]) {
      const pipe = new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.16, 0.16, 6, 12
        ),
        pipeMaterial
      );

      pipe.position.set(9.35, 4, z);
      this.group.add(pipe);
    }
  }

  private addCeilingVents() {
    for (const x of [-6, 0, 6]) {
      for (const z of [-5, 3]) {
        this.box(
          2.5, 0.15, 1.3,
          x, 7.9, z,
          this.darkMetal
        );

        for (let i = -4; i <= 4; i++) {
          this.box(
            0.08, 0.08, 1.1,
            x + i * 0.24, 7.79, z,
            this.metal
          );
        }
      }
    }
  }

  private addReactor() {
    // Reactor placed off-centre to preserve
    // the player's initial walking space.
    const reactor = new THREE.Group();
    reactor.position.set(4.5, 2.5, 1.5);

    const core = new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.55, 0.55, 3.4, 24
      ),
      this.cyan
    );

    reactor.add(core);
    this.reactorCore = core;

    const housing = new THREE.Mesh(
      new THREE.CylinderGeometry(
        1.1, 1.1, 4.8, 12, 1, true
      ),
      new THREE.MeshStandardMaterial({
        color: 0x203848,
        metalness: 0.8,
        roughness: 0.35,
        side: THREE.DoubleSide,
        wireframe: true,
      })
    );

    reactor.add(housing);

    for (const y of [-1.9, -1, 0, 1, 1.9]) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(
          0.9, 0.12, 10, 32
        ),
        this.metal
      );

      ring.rotation.x = Math.PI / 2;
      ring.position.y = y;
      reactor.add(ring);
    }

    this.reactorLight = new THREE.PointLight(
      0x00bfff, 15, 10
    );

    reactor.add(this.reactorLight);
    this.group.add(reactor);

    this.box(
      2.8, 0.35, 2.8,
      4.5, 0.18, 1.5,
      this.darkMetal
    );
  }

  private addEmergencyLights() {
    for (const x of [-7, -3, 3, 7]) {
      this.box(
        1.2, 0.12, 0.12,
        x, 6.7, -9.12,
        this.orange
      );

      this.box(
        1.2, 0.12, 0.12,
        x, 6.7, 9.12,
        this.orange
      );
    }

    const redLight = new THREE.PointLight(
      0xff3300, 5, 9
    );

    redLight.position.set(-7, 6, -7);
    this.group.add(redLight);
  }

  update(delta: number) {
  this.time += delta;

  const pulse = Math.sin(this.time * 2.2);

  this.reactorLight.intensity = 8 + pulse * 2;
  this.cyan.emissiveIntensity = 1.5 + pulse * 0.3;
}
}
