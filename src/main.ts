
import './style.css';
import * as RAPIER from '@dimforge/rapier3d-compat';
import { Game } from './core/Game';

async function main() {
  await RAPIER.init();

  new Game();
}

main().catch((error) => {
  console.error('Failed to initialise game:', error);
});
