
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

/**
 * Subtle cinematic finishing pass.
 * Adds vignette and light film grain.
 */
const FinishShader = {
  uniforms: {
    tDiffuse: { value: null },
    time: { value: 0 },
    vignetteStrength: { value: 0.18 },
    grainStrength: { value: 0.012 },
  },

  vertexShader: `
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float time;
    uniform float vignetteStrength;
    uniform float grainStrength;

    varying vec2 vUv;

    float hash(vec2 p) {
      return fract(
        sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123
      );
    }

    void main() {
      vec3 color = texture2D(tDiffuse, vUv).rgb;

      // Cinematic vignette.
      vec2 centered = (vUv - 0.5) * vec2(1.0, 0.85);

      float vignette = smoothstep(
        0.12,
        0.74,
        length(centered)
      );

      color *= 1.0 - vignette * vignetteStrength;

      // Subtle animated film grain.
      float noise = hash(
        floor(vUv * 1100.0) + floor(time * 24.0)
      ) - 0.5;

      color += noise * grainStrength;

      gl_FragColor = vec4(color, 1.0);
    }
  `,
};

export class PostProcessing {
  private composer: EffectComposer;
  private bloom: UnrealBloomPass;
  private finish: ShaderPass;
  private time = 0;

  constructor(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera
  ) {
    this.composer = new EffectComposer(renderer);

    // Render the original 3D scene.
    this.composer.addPass(
      new RenderPass(scene, camera)
    );

    // Bloom for bright lights and energy effects.
    this.bloom = new UnrealBloomPass(
      new THREE.Vector2(
        window.innerWidth,
        window.innerHeight
      ),
      0.25, // Bloom strength
      0.35, // Bloom radius
      1.15  // Brightness threshold
    );

    this.composer.addPass(this.bloom);

    // Cinematic finishing shader.
    this.finish = new ShaderPass(FinishShader);
    this.composer.addPass(this.finish);

    this.resize(
      window.innerWidth,
      window.innerHeight
    );
  }

  resize(width: number, height: number): void {
    this.composer.setSize(width, height);
  }

  render(delta: number): void {
    this.time += delta;

    this.finish.uniforms.time.value = this.time;

    this.composer.render(delta);
  }

  dispose(): void {
    this.composer.dispose();
    this.bloom.dispose();
    this.finish.dispose();
  }
}
