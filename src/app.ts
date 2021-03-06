// Here, we import the things we need from other script files 
import Game from './common/game';
import TextureScene from './scenes/01-Texture';
import TexturedModelsScene from './scenes/02-TexturedModels';
import TerrianScene from './scenes/03-Terrain';
import inGame from './scenes/in-game';
import BlendingScene from './scenes/05-Blending';
import FrameBufferScene from './scenes/06-Framebuffers';
import MRTScene from './scenes/07-MRT';
import PostprocessingScene from './scenes/08-Postprocessing';
import RealtimeEnvironmentMapScene from './scenes/09-RealtimeEnvMaps';

// First thing we need is to get the canvas on which we draw our scenes
var canvas: HTMLCanvasElement = document.querySelector("#app");

canvas.width  = window.innerWidth;
canvas.height = window.innerHeight;


// Then we create an instance of the game class and give it the canvas
const game = new Game(canvas);

// Here we list all our scenes and our initial scene
const scenes = {
    "in-game": inGame,
};
const initialScene = "in-game";

// Then we add those scenes to the game object and ask it to start the initial scene
game.addScenes(scenes);
game.startScene(initialScene);
/*
// Here we setup a selector element to switch scenes from the webpage
const selector: HTMLSelectElement = document.querySelector("#scenes");
for(let name in scenes){
    let option = document.createElement("option");
    option.text = name;
    option.value = name;
    selector.add(option);
}
selector.value = initialScene;
selector.addEventListener("change", ()=>{
    game.startScene(selector.value);
});
*/