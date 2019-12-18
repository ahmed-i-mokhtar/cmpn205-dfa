// This class is responsible for handling shaders for us
// Since this is a common operation in all of our scenes, we will write in a class to reuse it every where
export default class ShaderProgram {
    gl: WebGL2RenderingContext;
    program: WebGLProgram;
    
    constructor(gl: WebGL2RenderingContext){
        this.gl = gl;
        this.program = this.gl.createProgram(); // Tell webgl to create an empty program (we will attach the shaders to it later)
    }

    public dispose(): void {
        this.gl.deleteProgram(this.program); // Tell webgl to delete our program
    }

    // This function compiles a shader from source and if the compilation was successful, it attaches it to the program
    // source: the source code of the shader
    // type: the type of the shader, it can be gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
    public attach(source: string, type: number): boolean {
        let shader = this.gl.createShader(type); // Create an empty shader of the given type
        this.gl.shaderSource(shader, source); // Add the source code to the shader
        this.gl.compileShader(shader); // Now, we compile the shader
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) { // If the shader failed to compile, we print the error messages, delete the shader and return 
            console.error(`An error occurred compiling the ${{[this.gl.VERTEX_SHADER]:"vertex", [this.gl.FRAGMENT_SHADER]:"fragment"}[type]} shader: ${this.gl.getShaderInfoLog(shader)}`);
            this.gl.deleteShader(shader);
            return false;
        }
        this.gl.attachShader(this.program, shader); // If it compiled successfully, we attach it to the program
        this.gl.deleteShader(shader); // Now that the shader is attached, we don't need to keep its object anymore, so we delete it.
        return true;
    }

    // After attaching all the shader we need for our program, we link the whole program
    public link(): boolean {
        this.gl.linkProgram(this.program); // Tell webgl to link the programs
        if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) { // Check if the linking failed (the shaders could be incompatible)
            console.error('Unable to initialize the shader program: ' + this.gl.getProgramInfoLog(this.program));
            return false;
        } else {
            return true;
        }
    }
}