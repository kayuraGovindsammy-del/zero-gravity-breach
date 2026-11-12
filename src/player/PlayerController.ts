
import * as THREE from 'three';
import * as RAPIER from '@dimforge/rapier3d-compat';
import { PhysicsWorld } from '../physics/PhysicsWorld';

import { GravityHUD } from '../ui/GravityHUD';
import { GravityTarget } from '../effects/GravityTarget';

export class PlayerController {
  public camera: THREE.PerspectiveCamera;
  public flashlight: THREE.SpotLight;

  private physics: PhysicsWorld;
  private canvas: HTMLCanvasElement;

  private hud: GravityHUD;
  private gravityTarget: GravityTarget; 

  private keys = new Set<string>();

  private up = new THREE.Vector3(0, 1, 0);
  private gravity = new THREE.Vector3(0, -1, 0);
  private verticalSpeed = 0;
  private grounded = false;

  private yaw = 0;
  private pitch = 0;
  private frame = new THREE.Quaternion();
  private targetCameraRotation = new THREE.Quaternion();

  private readonly speed = 5;
  private readonly jumpSpeed = 6;
  private readonly gravityStrength = 18;
  private readonly eyeOffset = 0.55;

  private body: RAPIER.RigidBody;
  private collider: RAPIER.Collider;

  constructor(
    camera: THREE.PerspectiveCamera,
    scene: THREE.Scene,
    canvas: HTMLCanvasElement,
    physics: PhysicsWorld,
    hud: GravityHUD,
    gravityTarget: GravityTarget
  ) {
    this.camera = camera;
    this.canvas = canvas;
    this.physics = physics;

    this.hud = hud;
    this.gravityTarget = gravityTarget;

    this.body = physics.world.createRigidBody(
      RAPIER.RigidBodyDesc.kinematicPositionBased()
        .setTranslation(0, 1.15, 5)
    );

    this.collider = physics.world.createCollider(
      RAPIER.ColliderDesc.capsule(0.65, 0.35),
      this.body
    );

    
this.flashlight = new THREE.SpotLight(
  0xf2f7ff,       // Neutral white with a slight blue tint
  105,            // Lower peak intensity
  48,             // Longer range
  Math.PI / 3.8,  // Wider beam
  0.85,           // Softer edges
  1.0             // More gradual falloff
);

this.flashlight.castShadow = true;
this.flashlight.shadow.mapSize.set(1024, 1024);
this.flashlight.shadow.bias = -0.00015;
this.flashlight.shadow.camera.near = 0.1;
this.flashlight.shadow.camera.far = 48;

this.flashlight.position.set(0.12, -0.15, -0.1);
this.flashlight.target.position.set(0, -0.1, -12);


    camera.add(this.flashlight);
    camera.add(this.flashlight.target);
    scene.add(camera);


    this.physics.setUpDirection(this.up);
    this.updateTargetRotation();
    this.camera.quaternion.copy(this.targetCameraRotation);

    canvas.addEventListener('click', () => {
      canvas.requestPointerLock();
    });

    document.addEventListener('mousemove', (event) => {
      if (document.pointerLockElement !== canvas) return;

      this.yaw -= event.movementX * 0.002;
      this.pitch -= event.movementY * 0.002;

      this.pitch = THREE.MathUtils.clamp(
        this.pitch,
        -Math.PI / 2 + 0.05,
        Math.PI / 2 - 0.05
      );

      this.updateTargetRotation();
    });

    document.addEventListener('keydown', (event) => {
      if (['Space', 'KeyG'].includes(event.code)) {
        event.preventDefault();
      }

      this.keys.add(event.code);

      if (event.code === 'KeyF' && !event.repeat) {
        this.flashlight.visible = !this.flashlight.visible;
      }

      if (
        event.code === 'Space' &&
        !event.repeat &&
        this.grounded
      ) {
        this.verticalSpeed = this.jumpSpeed;
        this.grounded = false;
      }

      if (
        event.code === 'KeyG' &&
        !event.repeat &&
        document.pointerLockElement === this.canvas
      ) {
        this.shiftGravity();
      }
    });

    document.addEventListener('keyup', (event) => {
      this.keys.delete(event.code);
    });

    window.addEventListener('blur', () => {
      this.keys.clear();
    });
  }

  private updateTargetRotation() {
    const yawRotation = new THREE.Quaternion()
      .setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);

    const pitchRotation = new THREE.Quaternion()
      .setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.pitch);

    this.targetCameraRotation
      .copy(this.frame)
      .multiply(yawRotation)
      .multiply(pitchRotation);
  }

  
private shiftGravity() {
  // Refresh targeting immediately when G is pressed.
  this.gravityTarget.update(this.camera);

  const hit = this.gravityTarget.getHit();

  if (!hit) return;

  const axis = hit.normal.clone();

  // Ignore a surface with the same gravity orientation.
  if (axis.dot(this.up) > 0.99) return;

  const forward = new THREE.Vector3(0, 0, -1)
    .applyQuaternion(this.camera.quaternion);

  let projectedForward = forward.clone()
    .addScaledVector(axis, -forward.dot(axis));

  if (projectedForward.lengthSq() < 0.001) {
    const right = new THREE.Vector3(1, 0, 0)
      .applyQuaternion(this.camera.quaternion);

    projectedForward = right.cross(axis);
  }

  projectedForward.normalize();

  const right = projectedForward.clone()
    .cross(axis)
    .normalize();

  const backward = projectedForward.clone().negate();

  const rotationMatrix = new THREE.Matrix4()
    .makeBasis(right, axis, backward);

  this.frame.setFromRotationMatrix(rotationMatrix);

  this.up.copy(axis);
  this.gravity.copy(axis).negate();

  this.yaw = 0;
  this.pitch = 0;
  this.verticalSpeed = 0;
  this.grounded = false;

  this.physics.setUpDirection(this.up);

  const capsuleRotation = new THREE.Quaternion()
    .setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      this.up
    );

  this.collider.setRotation({
    x: capsuleRotation.x,
    y: capsuleRotation.y,
    z: capsuleRotation.z,
    w: capsuleRotation.w,
  });

  this.updateTargetRotation();

  // Update the interface and play the visual pulse.
  this.hud.setGravity(this.up);
  this.hud.triggerShift();
}


  update(delta: number) {
    const dt = Math.min(delta, 0.05);

    const input = new THREE.Vector3();

    if (document.pointerLockElement === this.canvas) {
      if (this.keys.has('KeyW')) input.z -= 1;
      if (this.keys.has('KeyS')) input.z += 1;
      if (this.keys.has('KeyA')) input.x -= 1;
      if (this.keys.has('KeyD')) input.x += 1;
    }

    const movement = new THREE.Vector3();

    if (input.lengthSq() > 0) {
      input.normalize();

      const walkingRotation = this.frame.clone()
        .multiply(
          new THREE.Quaternion().setFromAxisAngle(
            new THREE.Vector3(0, 1, 0),
            this.yaw
          )
        );

      movement.copy(input)
        .applyQuaternion(walkingRotation)
        .multiplyScalar(this.speed * dt);
    }

    this.verticalSpeed -= this.gravityStrength * dt;

    movement.addScaledVector(
      this.up,
      this.verticalSpeed * dt
    );

    this.physics.controller.computeColliderMovement(
      this.collider,
      {
        x: movement.x,
        y: movement.y,
        z: movement.z,
      }
    );

    const corrected =
      this.physics.controller.computedMovement();

    const position = this.body.translation();

    this.body.setNextKinematicTranslation({
      x: position.x + corrected.x,
      y: position.y + corrected.y,
      z: position.z + corrected.z,
    });

    this.grounded =
      this.physics.controller.computedGrounded();

    if (this.grounded && this.verticalSpeed < 0) {
      this.verticalSpeed = 0;
    }
  }

  syncCamera(delta = 1 / 60) {
    const position = this.body.translation();

    this.camera.position.set(
      position.x + this.up.x * this.eyeOffset,
      position.y + this.up.y * this.eyeOffset,
      position.z + this.up.z * this.eyeOffset
    );

    const blend = 1 - Math.exp(-8 * delta);

    this.camera.quaternion.slerp(
      this.targetCameraRotation,
      blend
    );
  }
}
