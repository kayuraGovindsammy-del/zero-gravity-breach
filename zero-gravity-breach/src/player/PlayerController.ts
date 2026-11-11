
import * as THREE from 'three';

export class PlayerController {
  public camera: THREE.PerspectiveCamera;
  public flashlight: THREE.SpotLight;

  private keys = new Set<string>();
  private yaw = 0;
  private pitch = 0;
  private readonly speed = 5;
  private readonly eyeHeight = 1.7;
  private readonly radius = 0.35;

  constructor(
    camera: THREE.PerspectiveCamera,
    scene: THREE.Scene,
    canvas: HTMLCanvasElement
  ) {
    this.camera = camera;
    this.camera.position.set(0, this.eyeHeight, 5);
    this.camera.rotation.order = 'YXZ';

    this.flashlight = new THREE.SpotLight(
      0xffffff, 35, 22, Math.PI / 7, 0.45, 1.3
    );
    this.flashlight.visible = false;
    this.flashlight.position.set(0, -0.12, 0);
    this.flashlight.target.position.set(0, -0.12, -5);

    this.camera.add(this.flashlight);
    this.camera.add(this.flashlight.target);
    scene.add(this.camera);

    canvas.addEventListener('click', () => {
      canvas.requestPointerLock();
    });

    document.addEventListener('mousemove', (event) => {
      if (document.pointerLockElement !== canvas) return;

      this.yaw -= event.movementX * 0.002;
      this.pitch -= event.movementY * 0.002;
      this.pitch = THREE.MathUtils.clamp(
        this.pitch, -Math.PI / 2 + 0.05,
        Math.PI / 2 - 0.05
      );

      this.camera.rotation.set(this.pitch, this.yaw, 0);
    });

    document.addEventListener('keydown', (event) => {
      this.keys.add(event.code);

      if (event.code === 'KeyF' && !event.repeat) {
        this.flashlight.visible = !this.flashlight.visible;
      }
    });

    document.addEventListener('keyup', (event) => {
      this.keys.delete(event.code);
    });

    window.addEventListener('blur', () => this.keys.clear());
  }

  update(delta: number) {
    if (document.pointerLockElement === null) return;

    const direction = new THREE.Vector3();

    if (this.keys.has('KeyW')) direction.z -= 1;
    if (this.keys.has('KeyS')) direction.z += 1;
    if (this.keys.has('KeyA')) direction.x -= 1;
    if (this.keys.has('KeyD')) direction.x += 1;

    if (direction.lengthSq() === 0) return;

    direction.normalize();
    direction.applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      this.yaw
    );

    const movement = direction.multiplyScalar(
      this.speed * Math.min(delta, 0.05)
    );

    // Temporary collision boundaries.
    // Physics colliders will replace these later.
    const nextX = THREE.MathUtils.clamp(
      this.camera.position.x + movement.x,
      -9.75 + this.radius,
      9.75 - this.radius
    );

    const nextZ = THREE.MathUtils.clamp(
      this.camera.position.z + movement.z,
      -9.75 + this.radius,
      9.75 - this.radius
    );

    this.camera.position.x = nextX;
    this.camera.position.z = nextZ;
  }
}
