import { Scene } from '../common/game';
import ShaderProgram from '../common/shader-program';

// In this scene we will draw some raytraced spheres
// The goal of this scene is to learn about:
// 1- The fact that we can use only 1 triangle, a simple vertex shader and a complex fragment shader to draw complex scenes
// 2- How to draw triangles without sending vertex data to the GPU
export default class RaytracingScene extends Scene {
    program: ShaderProgram;

    // Our shader needs to know the time and the screen resolution to work
    resolutionUniformLoc: WebGLUniformLocation;
    timeUniformLoc: WebGLUniformLocation;

    public load(): void {
        // Load raytracing shaders
        this.game.loader.load({
            ["raytracing.vert"]:{url:'shaders/raytracing.vert', type:'text'},
            ["raytracing.frag"]:{url:'shaders/raytracing.frag', type:'text'}
        });
    } 
    
    public start(): void {
        this.program = new ShaderProgram(this.gl);
        this.program.attach(this.game.loader.resources["raytracing.vert"], this.gl.VERTEX_SHADER);
        this.program.attach(this.game.loader.resources["raytracing.frag"], this.gl.FRAGMENT_SHADER);
        this.program.link();

        this.resolutionUniformLoc = this.gl.getUniformLocation(this.program.program, "iResolution");
        this.timeUniformLoc = this.gl.getUniformLocation(this.program.program, "iTime");

        // Notice that we have no Vertex Array Object, Vertex Buffer Object or even an Element Buffer Object

        this.gl.clearColor(0,0,0,1);
    }
    
    public draw(deltaTime: number): void {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        
        this.gl.useProgram(this.program.program);

        this.gl.uniform1f(this.timeUniformLoc, performance.now()/1000);
        this.gl.uniform2f(this.resolutionUniformLoc, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);

        // We don't bind a VAO since we don't have or need one
        // The draw commands send the vertex index to a builtin attribute called "gl_VertexID"
        // So even if we don't have any other attributes or buffers, the vertex shader can still know which vertex we are drawing and can pick the right coordinates for it.
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 3);
    }
    
    public end(): void {
        this.program.dispose();
        this.program = null;
    }


}