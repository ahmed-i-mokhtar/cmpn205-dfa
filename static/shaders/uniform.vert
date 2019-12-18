#version 300 es
layout(location=0) in vec3 position;
layout(location=1) in vec4 color;

out vec4 vertexColor;

// These are uniform variables that we need to translate and scale the rectangle
uniform vec2 translation;
uniform float time;

void main(){
    gl_Position = vec4(position, 1.0f);
    gl_Position.xy *= 1.0 + (0.1 * sin(time)); // Scale the rectangle in the range from 0.9 to 1.1 based on a sine wave
    gl_Position.xy += translation; // translate the position with translation
    vertexColor = color;
}