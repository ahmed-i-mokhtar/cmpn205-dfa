# WebGL Lab 1

## Steps to run

1. Install [Node.js](https://nodejs.org/en/) and [Visual Studio Code](https://code.visualstudio.com/).
2. Open this lab folder in Visual Studio Code.
3. Open a terminal (Terminal > New Terminal).
4. run `npm install` . If it failed for any reason, try again.
5. run `npm run watch` .
6. Ctrl + click the link shown in the terminal (usually it will be http://localhost:1234).

## Lab Structure

**index.html** is the webpage in which we run our app. It is the entry point of our app and it links to the main script file "app.ts"

**app.ts** is the entry point of our code. It just initializes the game object, sets the scenes and fills the scene selector. It can be considered as the equivalent of the main function in C++.

**game.ts** contains the *Game* class and the abstract *Scene* class. The game class is responsible for creating the WebGL2 context, running the game loop, managing scenes and running other helper classes such as the *Input* class and the *Loader* class. The *Scene* class is the base class of all the other scenes.

**Loader.ts** and **input.ts** contain helper classes that handles fetching data from the webserver and capturing the user input.

**shader-program.ts** contains the *ShaderProgram* class which contains some boilerplate code to loading shaders. It will be used extensively in every scene so we isolated it into a reusable class from the start.

**scenes folder** contains the scenes that demonstrate some concepts we need to understand about WebGL2.

1. **01-triangle.ts** draws a white triangle.
2. **02-colored-triangle-1.ts** draws a colored triangle.
3. **03-colored-triangle-2.ts** draws a colored triangle.
4. **04-quad.ts** draws a color rectangle.
5. **05-uniform.ts** draws one colored rectangle that pulses, moves with the mouse and changes color with time.
6. **06-raytracing.ts** draws some raytraced spheres on a single triangle.

**static folder** contains the assets file for our project. It currently contains the shader files in the **shaders folder**.

## Extra Resources

* [Mozilla WebGL Reference and Tutorial](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API) which is for WebGL1 but many of the presented material is still valid for WebGL2.
* [WebGL2 Fundamentals](https://webgl2fundamentals.org/)