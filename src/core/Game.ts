
import * as THREE from 'three';

import { EngineeringDeck } from '../levels/engineering/EngineeringDeck';
import { PlayerController } from '../player/PlayerController';
import { PhysicsWorld } from '../physics/PhysicsWorld';
import { GravityHUD } from '../ui/GravityHUD';
import { GravityTarget } from '../effects/GravityTarget';
import { PostProcessing } from './PostProcessing';

export class Game {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private postProcessing: PostProcessing;

  private hud: GravityHUD;
  private gravityTarget: GravityTarget;
  private deck: EngineeringDeck;

  private physics: PhysicsWorld;
  private player: PlayerController;

  private clock = new THREE.Clock();
  private accumulator = 0;
  private readonly fixedStep = 1 / 60;

  constructor() {
    // Scene setup.
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x050a12);
    this.scene.fog = new THREE.FogExp2(
      0x050a12,
      0.025
    );

    // First-person camera.
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    // WebGL renderer.
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
    });

    this.renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );

    this.renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, 2)
    );

    // Shadows.
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type =
      THREE.PCFSoftShadowMap;

    // Cinematic tone mapping.
    this.renderer.toneMapping =
      THREE.ACESFilmicToneMapping;

    this.renderer.toneMappingExposure = 1.1;

    document.body.appendChild(
      this.renderer.domElement
    );

    // Hemisphere lighting.
    this.scene.add(
      new THREE.HemisphereLight(
        0x789cc4,
        0x17202d,
        1.2
      )
    );

    // Directional fill lighting.
    const fillLight = new THREE.DirectionalLight(
      0x7395b8,
      0.7
    );

    fillLight.position.set(-4, 7, 3);
    this.scene.add(fillLight);

    // Engineering Deck.
    this.deck = new EngineeringDeck();
    this.scene.add(this.deck.group);

    // Physics and environment collisions.
    this.physics = new PhysicsWorld();
    this.physics.addEnvironment(this.deck.group);

    // Gravity HUD.
    this.hud = new GravityHUD();

    // Gravity targeting system.
    this.gravityTarget = new GravityTarget(
      this.deck.group
    );

    this.scene.add(
      this.gravityTarget.group
    );

    // Player controller.
    this.player = new PlayerController(
      this.camera,
      this.scene,
      this.renderer.domElement,
      this.physics,
      this.hud,
      this.gravityTarget
    );

    this.player.syncCamera();

    // Post-processing.
    this.postProcessing = new PostProcessing(
      this.renderer,
      this.scene,
      this.camera
    );

    // Window resizing.
    window.addEventListener('resize', () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(width, height);
      this.postProcessing.resize(width, height);
    });

    // Start game loop.
    this.animate();
  }

  private animate = () => {
    requestAnimationFrame(this.animate);

    const delta = Math.min(
      this.clock.getDelta(),
      0.1
    );

    this.accumulator += delta;

    // Fixed physics timestep.
    while (this.accumulator >= this.fixedStep) {
      this.player.update(this.fixedStep);

      this.physics.world.timestep =
        this.fixedStep;

      this.physics.world.step();

      this.accumulator -= this.fixedStep;
    }

    // Update player camera.
    this.player.syncCamera(delta);

    // Update gravity target.
    this.gravityTarget.update(this.camera);

    const target = this.gravityTarget.getHit();

    this.hud.setTarget(
      target !== null,
      target?.label ?? ''
    );

    // Update room animations.
    this.deck.update(delta);

    // Render using post-processing.
    this.postProcessing.render(delta);
  };
}
