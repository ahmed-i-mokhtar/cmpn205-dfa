//TODO: Finish this later
// This file is not used anywhere yet and it is a work in progress

export interface VertexDescriptor {
    attributeLocation: number,
    bufferIndex: number,
    size: number,
    type: number,
    normalized: boolean,
    stride: number,
    offset: number
}

export default class Mesh {
    gl: WebGL2RenderingContext;
    descriptors: VertexDescriptor[];
    VBOs: WebGLBuffer[];
    EBO: WebGLBuffer;
    VAO: WebGLVertexArrayObject;
    elementCount: number;
    elementType: number;

    constructor(gl: WebGL2RenderingContext, descriptors: VertexDescriptor[], bufferCount: number){
        this.gl = gl;
        this.descriptors = descriptors;
        this.VBOs = [];
        for(let i = 0; i < bufferCount; i++) this.VBOs.push(this.gl.createBuffer());
        this.EBO = this.gl.createBuffer();
        this.VAO = this.gl.createVertexArray();

        this.gl.bindVertexArray(this.VAO);
        for(let descriptor of this.descriptors){
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.VBOs[descriptor.bufferIndex]);
            this.gl.enableVertexAttribArray(descriptor.attributeLocation);
            this.gl.vertexAttribPointer(descriptor.attributeLocation, descriptor.size, descriptor.type, descriptor.normalized, descriptor.stride, descriptor.offset);
        }
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.EBO);
        this.gl.bindVertexArray(null);
    }

    public dispose(){
        this.gl.deleteVertexArray(this.VAO);
        this.gl.deleteBuffer(this.EBO);
        for(let VBO of this.VBOs) this.gl.deleteBuffer(VBO);
        this.VBOs = null;
    }

    public setBufferData(bufferIndex: number, bufferData: number | Int8Array | Int16Array | Int32Array | Uint8Array | Uint16Array | Uint32Array | Uint8ClampedArray | Float32Array | Float64Array | DataView | ArrayBuffer, usage: number){
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.VBOs[bufferIndex]);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, bufferData, usage);
    }

    public setElementsData(bufferData: Uint8Array | Uint16Array | Uint32Array | Uint8ClampedArray, usage: number){
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.EBO);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, bufferData, usage);

        this.elementCount = bufferData.length;
        if(bufferData instanceof Uint8Array || bufferData instanceof Uint8ClampedArray) this.elementType = this.gl.UNSIGNED_BYTE;
        else if(bufferData instanceof Uint16Array) this.elementType = this.gl.UNSIGNED_SHORT;
        else if(bufferData instanceof Uint32Array) this.elementType = this.gl.UNSIGNED_INT;
    }

    public draw(mode: number = this.gl.TRIANGLES){
        this.gl.bindVertexArray(this.VAO);
        this.gl.drawElements(mode, this.elementCount, this.elementType, 0);
        this.gl.bindVertexArray(null);
    }
}