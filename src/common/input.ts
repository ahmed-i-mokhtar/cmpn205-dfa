import { Key } from 'ts-key-enum'

export { Key } from 'ts-key-enum'

import { vec2 } from 'gl-matrix'

// This is a small helper class we created to manage the user input
// The input on webpages is received via event listeners only so this class add some listeners and collect the keyboard and mouse input to be accessed at any time
// This class is a work in progress so expect it to be enhanced in future labs
export default class Input {
    canvas: HTMLCanvasElement;

    private currentKeys: {[key: string]: boolean};
    private previousKeys: {[key: string]: boolean};

    private currentButtons: boolean[];
    private previousButtons: boolean[];

    private firstMouseMove: boolean = true;
    private currentPosition: vec2;
    private perviousPosition: vec2;

    constructor(canvas: HTMLCanvasElement){
        this.canvas = canvas;
        this.currentKeys = {};
        this.previousKeys = {};
        for(let key in Key){
            this.currentKeys[key] = false;
            this.previousKeys[key] = false;
        }
        document.body.addEventListener("keydown", (ev)=>{
            this.currentKeys[ev.key] = true; 
            switch(ev.key){
                case Key.ArrowUp:
                case Key.ArrowDown:
                case Key.ArrowLeft:
                case Key.ArrowRight:
                case ' ':
                    ev.preventDefault();
            }
        });
        document.body.addEventListener("keyup", (ev)=>{
            this.currentKeys[ev.key] = false; 
        });

        this.currentButtons = [false, false, false];
        this.previousButtons = [false, false, false];

        canvas.addEventListener("mousedown", (ev)=>{
            ev.preventDefault();
            this.currentButtons[ev.button] = true;
        });
        canvas.addEventListener("mouseup", (ev)=>{
            ev.preventDefault();
            this.currentButtons[ev.button] = false;
        });

        this.currentPosition = vec2.fromValues(0, 0);
        this.perviousPosition = vec2.fromValues(0, 0);

        canvas.addEventListener("mousemove", (ev)=>{
            ev.preventDefault();
            vec2.set(this.currentPosition, ev.pageX - canvas.offsetLeft, ev.pageY - canvas.offsetTop);
            if(this.firstMouseMove){
                vec2.copy(this.perviousPosition, this.currentPosition);
                this.firstMouseMove = false;
            }
        });
    }

    public update(): void {
        for(let key in Key){
            this.previousKeys[key] = this.currentKeys[key];
        }
        for(let button = 0; button < 3; button++){
            this.previousButtons[button] = this.currentButtons[button];
        }
        vec2.copy(this.perviousPosition, this.currentPosition);
    }

    public isKeyDown(key: Key): boolean { return this.currentKeys[key]; }
    public isKeyUp(key: Key): boolean { return !this.currentKeys[key]; }
    public isKeyJustDown(key: Key): boolean { return this.currentKeys[key] && !this.previousKeys[key]; }
    public isKeyJustUp(key: Key): boolean { return !this.currentKeys[key] && this.previousKeys[key]; }

    public isButtonDown(button: number): boolean { return this.currentButtons[button]; }
    public isButtonUp(button: number): boolean { return !this.currentButtons[button]; }
    public isButtonJustDown(button: number): boolean { return this.currentButtons[button] && !this.previousButtons[button]; }
    public isButtonJustUp(button: number): boolean { return !this.currentButtons[button] && this.previousButtons[button]; }

    public getMousePosition(): vec2 { return vec2.copy(vec2.create(), this.currentPosition); }
    public getMouseDelta(): vec2 { return vec2.sub(vec2.create(), this.currentPosition, this.perviousPosition); }

}