#version 300 es
precision highp float;

in vec4 vertexColor; // An input received from the vertex shader. Since the vertex shader only send 3 colors (one for each vertex), the rasterizer will interpolate the 3 values to get values for the fragments in the middle of the triangle
// Info: the variables sending data between the vertex and fragment shader are called Interpolators

out vec4 color;

void main(){
    color = vertexColor; // Send our interpolated color
}