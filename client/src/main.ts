import './style.css';
import { initTelegram } from './telegram.ts';
import { Game } from './game/Game.ts';

initTelegram();

const canvas = document.getElementById('game') as HTMLCanvasElement;
new Game(canvas);
