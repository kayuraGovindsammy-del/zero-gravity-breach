
import * as THREE from 'three';

export class GravityHUD {
  private reticle: HTMLDivElement;
  private status: HTMLDivElement;
  private direction: HTMLDivElement;
  private pulse: HTMLDivElement;

  constructor() {
    const hud = document.createElement('div');
    hud.className = 'gravity-hud';

    hud.innerHTML = `
      <div class="gravity-reticle">
        <span class="reticle-dot"></span>
      </div>

      <div class="gravity-status">
        <div class="hud-label">GRAVITY MANIPULATOR</div>
        <div class="hud-target">SCANNING...</div>
        <div class="hud-hint">AIM + G TO SHIFT</div>
      </div>

      <div class="gravity-direction">
        <div class="hud-label">GRAVITY VECTOR</div>
        <div class="hud-vector">DOWN / FLOOR</div>
      </div>

      <div class="gravity-pulse"></div>
    `;

    document.body.appendChild(hud);

    this.reticle = hud.querySelector('.gravity-reticle')!;
    this.status = hud.querySelector('.hud-target')!;
    this.direction = hud.querySelector('.hud-vector')!;
    this.pulse = hud.querySelector('.gravity-pulse')!;
  }

  setTarget(valid: boolean, label = '') {
    this.reticle.classList.toggle('valid', valid);

    this.status.textContent = valid
      ? `TARGET: ${label}`
      : 'NO VALID SURFACE';
  }

  setGravity(up: THREE.Vector3) {
    let label = 'UNKNOWN';

    if (up.y > 0.9) label = 'DOWN / FLOOR';
    else if (up.y < -0.9) label = 'UP / CEILING';
    else if (up.x > 0.9) label = 'LEFT WALL';
    else if (up.x < -0.9) label = 'RIGHT WALL';
    else if (up.z > 0.9) label = 'FRONT WALL';
    else if (up.z < -0.9) label = 'BACK WALL';

    this.direction.textContent = label;
  }

  triggerShift() {
    this.pulse.classList.remove('active');

    // Restart the animation on repeated gravity shifts.
    void this.pulse.offsetWidth;

    this.pulse.classList.add('active');
  }
}
