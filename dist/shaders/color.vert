#version 300 es
layout(location=0) in vec3 position;
layout(location=1) in vec4 color; // We added a new attribute color at the location after position

out vec4 vertexColor; // Since vertex shaders do not draw, we need to pass the color data to the fragment shader

void main(){
    gl_Position = vec4(position, 1.0f);
    vertexColor = color; // Pass the color to the fragment shader
}