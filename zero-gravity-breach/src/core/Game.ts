
import * as THREE from 'three';
import { EngineeringRoom } from '../levels/EngineeringRoom';
import { PlayerController } from '../player/PlayerController';

export class Game {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private player: PlayerController;
  private clock = new THREE.Clock();

  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x050a12);
    this.scene.fog = new THREE.FogExp2(0x050a12, 0.025);

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
    });

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, 2)
    );
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;

    document.body.appendChild(this.renderer.domElement);

    const ambient = new THREE.AmbientLight(0x64748b, 0.35);
    this.scene.add(ambient);

    const room = new EngineeringRoom();
    this.scene.add(room.group);

    this.player = new PlayerController(
      this.camera,
      this.scene,
      this.renderer.domElement
    );

    window.addEventListener('resize', () => {
      this.camera.aspect =
        window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(
        window.innerWidth,
        window.innerHeight
      );
    });

    this.animate();
  }

  private animate = () => {
    requestAnimationFrame(this.animate);

    const delta = this.clock.getDelta();

    this.player.update(delta);

    this.renderer.render(this.scene, this.camera);
  };
}
