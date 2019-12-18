#version 300 es
precision highp float;

// We can define constants using #define same as C/C++
#define PI  3.14159265

in vec4 vertexColor;

out vec4 color;

// We will use the time variable to shift the colors of the quad
uniform float time;

void main(){
    vec3 phases = vec3(sin(time), sin(time + 2.0 * PI / 3.0), sin(time + 4.0 * PI / 3.0)); // We have 3 phase-shifted sine waves for each component
    color = vertexColor * vec4(0.5*phases+0.5, 1.0);
}