import { Scene } from '../common/game';
import ShaderProgram from '../common/shader-program';
import { vec2 } from 'gl-matrix';

// In this scene we will draw one colored rectangle that pulses, moves with the mouse and changes color with time
// The goal of this scene is to learn about:
// 1- How to send Uniform data (variables that have the same value across all vertices and pixels)
export default class UniformScene extends Scene {
    program: ShaderProgram;
    VAO: WebGLVertexArrayObject;
    positionVBO: WebGLBuffer;
    colorVBO: WebGLBuffer;
    EBO: WebGLBuffer;

    // Similar to attribute location, uniforms also have a location in their layout
    translationUniformLoc: WebGLUniformLocation; // We will use these store the locations for our uniform variable data
    timeUniformLoc: WebGLUniformLocation;

    public load(): void {
        // We will need a new pair of shaders that receives uniform variables
        this.game.loader.load({
            ["uniform.vert"]:{url:'shaders/uniform.vert', type:'text'},
            ["uniform.frag"]:{url:'shaders/uniform.frag', type:'text'}
        });
    } 
    
    public start(): void {
        this.program = new ShaderProgram(this.gl);
        this.program.attach(this.game.loader.resources["uniform.vert"], this.gl.VERTEX_SHADER);
        this.program.attach(this.game.loader.resources["uniform.frag"], this.gl.FRAGMENT_SHADER);
        this.program.link();

        // Similar to getAttribLocation, we use getUniformLocation to get a uniform variable's location from its name
        this.translationUniformLoc = this.gl.getUniformLocation(this.program.program, "translation");
        this.timeUniformLoc = this.gl.getUniformLocation(this.program.program, "time");

        // The remaining steps in "Start" are not any different compared to the Quad Scene
        const positions = new Float32Array([
            -0.5, -0.5, 0.0,
            0.5, -0.5, 0.0,
            0.5,  0.5, 0.0,
            -0.5,  0.5, 0.0,
        ]);

        const colors = new Uint8Array([
            255,   0,   0, 255,
              0, 255,   0, 255,
              0,   0, 255, 255,
            255,   0, 255, 255,
        ]);

        const elements = new Uint32Array([
            0, 1, 2,
            2, 3, 0
        ]);
    
        this.VAO = this.gl.createVertexArray();
        this.positionVBO = this.gl.createBuffer();
        this.colorVBO = this.gl.createBuffer();
        this.EBO = this.gl.createBuffer();
    
        this.gl.bindVertexArray(this.VAO);
    
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionVBO);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);

        const positionAttrib = this.gl.getAttribLocation(this.program.program, "position");
        this.gl.enableVertexAttribArray(positionAttrib);
        this.gl.vertexAttribPointer(positionAttrib, 3, this.gl.FLOAT, false, 0, 0);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorVBO);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, colors, this.gl.STATIC_DRAW);

        const colorAttrib = this.gl.getAttribLocation(this.program.program, "color");
        this.gl.enableVertexAttribArray(colorAttrib);
        this.gl.vertexAttribPointer(colorAttrib, 4, this.gl.UNSIGNED_BYTE, true, 0, 0);

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.EBO);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, elements, this.gl.STATIC_DRAW);

        this.gl.bindVertexArray(null);

        this.gl.clearColor(0,0,0,1);
    }
    
    public draw(deltaTime: number): void {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        
        this.gl.useProgram(this.program.program);

        // Before drawing, we need to update the data in the uniform variables
        // First, we will send the time in seconds to the time uniform variable
        this.gl.uniform1f(this.timeUniformLoc, performance.now()/1000);
        // Here, I calculate the mouse position in NDC space (ranges from (-1,-1) to (1,1)) from the position in pixel coordinates (range from (0,0) to (width, height)) 
        const translation: vec2 = this.game.input.getMousePosition();
        vec2.div(translation, translation, [this.game.canvas.width, this.game.canvas.height]);
        vec2.add(translation, translation, [-0.5, -0.5]);
        vec2.mul(translation, translation, [2, -2]); // In pixel coordinate y points down, while in NDC y points up so I multiply the y by -1
        // Second, I send the mouse translation to the translation uniform variable
        this.gl.uniform2f(this.translationUniformLoc, translation[0], translation[1]);

        // Then, I will draw as usual
        this.gl.bindVertexArray(this.VAO);
        this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_INT, 0);
        this.gl.bindVertexArray(null);
    }
    
    public end(): void {
        this.program.dispose();
        this.program = null;
        this.gl.deleteVertexArray(this.VAO);
        this.gl.deleteBuffer(this.positionVBO);
        this.gl.deleteBuffer(this.colorVBO);
        this.gl.deleteBuffer(this.EBO);
    }


}