// Here, we import the things we need from other script files 
import Game from './common/game';
import TriangleScene from './scenes/01-triangle';
import ColoredTriangleScene1 from './scenes/02-colored-triangle-1';
import ColoredTriangleScene2 from './scenes/03-colored-triangle-2';
import QuadScene from './scenes/04-quad';
import UniformScene from './scenes/05-uniform';
import RaytracingScene from './scenes/06-raytracing';

// First thing we need is to get the canvas on which we draw our scenes
var canvas: HTMLCanvasElement = document.querySelector("#app");

canvas.width  = window.innerWidth;
canvas.height = window.innerHeight;

// Then we create an instance of the game class and give it the canvas
const game = new Game(canvas);

// Here we list all our scenes and our initial scene
const scenes = {
    "triangle": TriangleScene,
    "colored-triangle-1": ColoredTriangleScene1,
    "colored-triangle-2": ColoredTriangleScene2,
    "quad": QuadScene,
    "uniform": UniformScene,
    "ray-tracing": RaytracingScene
};
const initialScene = "triangle";

// Then we add those scenes to the game object and ask it to start the initial scene
game.addScenes(scenes);
game.startScene(initialScene);

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