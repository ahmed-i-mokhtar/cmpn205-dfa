#version 300 es

// Since we have no buffers to contain the vertices, we can store them here in a constant vec3 array
const vec3 vertices[3] = vec3[3]( 
    vec3(-1.0f, -1.0f, 0.0f),
    vec3( 3.0f, -1.0f, 0.0f),
    vec3(-1.0f,  3.0f, 0.0f)
);
// Note that the vertex coordinates exceed the NDC limits (-1 to 1) since we need to use only one triangle to cover the whole screen

void main(){
    // Pick a vertex from the constant array and send it.
    gl_Position = vec4(vertices[gl_VertexID], 1.0f);
}