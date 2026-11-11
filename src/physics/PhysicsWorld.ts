
import * as THREE from 'three';
import * as RAPIER from '@dimforge/rapier3d-compat';

export class PhysicsWorld {
  public world: RAPIER.World;
  public controller: RAPIER.KinematicCharacterController;

  constructor() {
    this.world = new RAPIER.World({
      x: 0,
      y: 0,
      z: 0,
    });

    this.controller = this.world.createCharacterController(0.01);
    this.controller.enableSnapToGround(0.15);
    this.controller.setMaxSlopeClimbAngle(Math.PI / 4);
    this.controller.setMinSlopeSlideAngle(Math.PI / 3);
  }

  addStaticBox(mesh: THREE.Mesh) {
    mesh.updateWorldMatrix(true, false);

    const geometry = mesh.geometry;
    geometry.computeBoundingBox();

    const bounds = geometry.boundingBox!;
    const size = new THREE.Vector3();
    bounds.getSize(size);

    const scale = new THREE.Vector3();
    const position = new THREE.Vector3();
    const rotation = new THREE.Quaternion();

    mesh.matrixWorld.decompose(position, rotation, scale);
    size.multiply(
  new THREE.Vector3(
    Math.abs(scale.x),
    Math.abs(scale.y),
    Math.abs(scale.z)
  )
);

    const body = this.world.createRigidBody(
      RAPIER.RigidBodyDesc.fixed()
        .setTranslation(position.x, position.y, position.z)
        .setRotation({
          x: rotation.x,
          y: rotation.y,
          z: rotation.z,
          w: rotation.w,
        })
    );

    this.world.createCollider(
      RAPIER.ColliderDesc.cuboid(
        size.x / 2,
        size.y / 2,
        size.z / 2
      ),
      body
    );
  }

  addEnvironment(group: THREE.Group) {
    group.updateWorldMatrix(true, true);

    group.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        this.addStaticBox(object);
      }
    });
  }

  setUpDirection(up: THREE.Vector3) {
  this.controller.setUp({
    x: up.x,
    y: up.y,
    z: up.z,
  });
}
}
