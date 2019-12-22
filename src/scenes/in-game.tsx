import { Scene } from '../common/game';
import ShaderProgram from '../common/shader-program';
import Mesh from '../common/mesh';
import * as MeshUtils from '../common/mesh-utils';
import Camera from '../common/camera';
import FlyCameraController from '../common/camera-controllers/fly-camera-controller';
import { vec3, mat4, quat} from 'gl-matrix';
import { Vector, Selector } from '../common/dom-utils';
import { createElement, StatelessProps, StatelessComponent } from 'tsx-create-element';
import {Howl, Howler} from 'howler';


// In this scene we will draw one object with a cube map to emulate reflection and refraction. We will also draw a sky box
export default class CubemapScene extends Scene {
    programs: {[name: string]: ShaderProgram} = {};
    camera: Camera;
    controller: FlyCameraController;
    meshes: {[name: string]: Mesh} = {};
    textures: {[name: string]: WebGLTexture} = {};
    sampler: WebGLSampler;
    period: number = 0;
    PlyrPos: number = 25;
    PlyrAlt: number = 1495;
    intOri: number;
    PlyrOri: number = 1;
    cameraPos: number = 1500;
    cameraDir: number = -0.25;   
   
    windSound: Howl;
    flapSound: Howl;
    themeSound: Howl;
    rsgSound: Howl;
    winSound: Howl;
    loseSound: Howl;

    currentMesh: string;
    tint: [number, number, number] = [255, 255, 255];
    refraction: boolean = false;
    refractiveIndex: number = 1.0;
    drawSky: boolean = true;
    //Obstacles
    transdirx: {[index: number]: number}={};
    transdiry: {[index: number]: number}={};
    transdirz: {[index: number]: number}={};
    scalex: {[index: number]: number}={};
    scaley: {[index: number]: number}={};
    scalez:  {[index: number]: number}={};
    anisotropy_ext: EXT_texture_filter_anisotropic; // This will hold the anisotropic filtering extension
    anisotropic_filtering: number = 0; // This will hold the maximum number of samples that the anisotropic filtering is allowed to read. 1 is equivalent to isotropic filtering.
    fl: number = 0;

    material = {
        diffuse: vec3.fromValues(0.5,0.3,0.1),
        specular: vec3.fromValues(1,1,1),
        ambient: vec3.fromValues(0.5,0.3,0.1),
        shininess: 20
    };

    // And this will store our directional light properties
    light = {
        diffuse: vec3.fromValues(1,1,1),
        specular: vec3.fromValues(1,1,1),
        ambient: vec3.fromValues(0.5,0.5,0.1),
        direction: vec3.fromValues(1,1,1)
    };

    // These are the 6 cubemap directions: -x, -y, -z, +x, +y, +z
    static readonly cubemapDirections = ['negz', 'negy', 'negx', 'posz', 'posy', 'posx']

    public load(): void {
        
        let windDir ='sounds/wind.wav'
        let flapDir = 'sounds/flapping.wav'
        let themeDir = 'sounds/acdc-are-you-ready.mp3'
        let rsgDir = 'sounds/rsg.mp3'
        let winDir = 'sounds/win.mp3'
        let loseDir = 'sounds/lose.mp3'

        this.windSound = new Howl({
            src: [windDir],
            format: ['wav'],
            loop: true,
            onload: () => console.log('onload'),
            onloaderror: (e, msg) => console.log('onloaderror', e, msg),
            onplayerror: (e, msg) => console.log('onplayerror', e, msg),
            onplay: () => console.log('onplay'),
            onend: () => console.log('onend'),
            onpause: () => console.log('onpause'),
            onrate: () => console.log('onrate'),
            onstop: () => console.log('onstop'),
            onseek: () => console.log('onseek'),
            onfade: () => console.log('onfade'),
            onunlock: () => console.log('onunlock'),
          });


          this.flapSound = new Howl({
            src: [flapDir],
            format: ['wav'],
            loop: true,
            onload: () => console.log('onload'),
            onloaderror: (e, msg) => console.log('onloaderror', e, msg),
            onplayerror: (e, msg) => console.log('onplayerror', e, msg),
            onplay: () => console.log('onplay'),
            onend: () => console.log('onend'),
            onpause: () => console.log('onpause'),
            onrate: () => console.log('onrate'),
            onstop: () => console.log('onstop'),
            onseek: () => console.log('onseek'),
            onfade: () => console.log('onfade'),
            onunlock: () => console.log('onunlock'),
          });
          this.themeSound = new Howl({
            src: [themeDir],
            format: ['mp3'],
            loop: true,
            volume: 0.5,
            onload: () => console.log('onload'),
            onloaderror: (e, msg) => console.log('onloaderror', e, msg),
            onplayerror: (e, msg) => console.log('onplayerror', e, msg),
            onplay: () => console.log('onplay'),
            onend: () => console.log('onend'),
            onpause: () => console.log('onpause'),
            onrate: () => console.log('onrate'),
            onstop: () => console.log('onstop'),
            onseek: () => console.log('onseek'),
            onfade: () => console.log('onfade'),
            onunlock: () => console.log('onunlock'),
          });

          this.rsgSound = new Howl({
            src: [rsgDir],
            format: ['mp3'],
            loop: false,
            volume: 0.5,
            onload: () => console.log('onload'),
            onloaderror: (e, msg) => console.log('onloaderror', e, msg),
            onplayerror: (e, msg) => console.log('onplayerror', e, msg),
            onplay: () => console.log('onplay'),
            onend: () => console.log('onend'),
            onpause: () => console.log('onpause'),
            onrate: () => console.log('onrate'),
            onstop: () => console.log('onstop'),
            onseek: () => console.log('onseek'),
            onfade: () => console.log('onfade'),
            onunlock: () => console.log('onunlock'),
          });

          this.winSound = new Howl({
            src: [winDir],
            format: ['mp3'],
            loop: false,
            volume: 0.5,
            onload: () => console.log('onload'),
            onloaderror: (e, msg) => console.log('onloaderror', e, msg),
            onplayerror: (e, msg) => console.log('onplayerror', e, msg),
            onplay: () => console.log('onplay'),
            onend: () => console.log('onend'),
            onpause: () => console.log('onpause'),
            onrate: () => console.log('onrate'),
            onstop: () => console.log('onstop'),
            onseek: () => console.log('onseek'),
            onfade: () => console.log('onfade'),
            onunlock: () => console.log('onunlock'),
          });
        
          this.loseSound = new Howl({
            src: [loseDir],
            format: ['mp3'],
            loop: false,
            volume: 0.5,
            onload: () => console.log('onload'),
            onloaderror: (e, msg) => console.log('onloaderror', e, msg),
            onplayerror: (e, msg) => console.log('onplayerror', e, msg),
            onplay: () => console.log('onplay'),
            onend: () => console.log('onend'),
            onpause: () => console.log('onpause'),
            onrate: () => console.log('onrate'),
            onstop: () => console.log('onstop'),
            onseek: () => console.log('onseek'),
            onfade: () => console.log('onfade'),
            onunlock: () => console.log('onunlock'),
          });

        this.game.loader.load({
            ["texture-cube.vert"]:{url:'shaders/texture-cube.vert', type:'text'},
            ["texture-cube.frag"]:{url:'shaders/texture-cube.frag', type:'text'},
            ["texture.vert"]:{url:'shaders/texture.vert', type:'text'},
            ["texture.frag"]:{url:'shaders/texture.frag', type:'text'},
            ["sky-cube.vert"]:{url:'shaders/sky-cube.vert', type:'text'},
            ["sky-cube.frag"]:{url:'shaders/sky-cube.frag', type:'text'},
            ["moon-texture"]:{url:'shaders/sk3.jpg', type:'image'},
            ["suzanne"]:{url:'models/Suzanne/Mi28.obj', type:'text'},
            ["hel"]:{url:'images/1.png', type:'image'},
            // We will load all the 6 textures to create cubemap
            
            ...Object.fromEntries(CubemapScene.cubemapDirections.map(dir=>[dir, {url:`images/Vasa/${dir}.jpg`, type:'image'}]))
        });
    }
    
    public start(): void {
        
        this.windSound.play();
        this.flapSound.play();
        this.themeSound.play();
        this.rsgSound.play();
        


        this.themeSound.volume = 0.7;
        

        this.programs['obstacle'] = new ShaderProgram(this.gl);
        this.programs['obstacle'].attach(this.game.loader.resources["texture.vert"], this.gl.VERTEX_SHADER);
        this.programs['obstacle'].attach(this.game.loader.resources["texture.frag"], this.gl.FRAGMENT_SHADER);
        this.programs['obstacle'].link();
       
        this.programs['texture'] = new ShaderProgram(this.gl);
        this.programs['texture'].attach(this.game.loader.resources["texture-cube.vert"], this.gl.VERTEX_SHADER);
        this.programs['texture'].attach(this.game.loader.resources["texture-cube.frag"], this.gl.FRAGMENT_SHADER);
        this.programs['texture'].link();

        
        this.programs['sky'] = new ShaderProgram(this.gl);
        this.programs['sky'].attach(this.game.loader.resources["sky-cube.vert"], this.gl.VERTEX_SHADER);
        this.programs['sky'].attach(this.game.loader.resources["sky-cube.frag"], this.gl.FRAGMENT_SHADER);
        this.programs['sky'].link();

        this.meshes['moon'] = MeshUtils.Cube(this.gl);
        this.meshes['cube'] = MeshUtils.Cube(this.gl);
        this.meshes['sphere'] = MeshUtils.Sphere(this.gl);


        this.meshes['suzanne'] = MeshUtils.LoadOBJMesh(this.gl, this.game.loader.resources['suzanne']);
        
        // These will be our 6 targets for loading the images to the texture
        const target_directions = [
            this.gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
            this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
            this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
            this.gl.TEXTURE_CUBE_MAP_POSITIVE_X,
            this.gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
            this.gl.TEXTURE_CUBE_MAP_POSITIVE_Z
        ]

        this.textures['environment'] = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, this.textures['environment']); // Here, we will bind the texture to TEXTURE_CUBE_MAP since it will be a cubemap
        this.gl.pixelStorei(this.gl.UNPACK_ALIGNMENT, 4);
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, false); // No need for UNPACK_FLIP_Y_WEBGL with cubemaps
        for(let i = 0; i < 6; i++){
            // The only difference between the call here and with normal 2D textures, is that the target is one of the 6 cubemap faces, instead of TEXTURE_2D
            this.gl.texImage2D(target_directions[i], 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.game.loader.resources[CubemapScene.cubemapDirections[i]]);
        }
        this.gl.generateMipmap(this.gl.TEXTURE_CUBE_MAP); // Then we generate the mipmaps

        this.sampler = this.gl.createSampler();
        // No need to specify wrapping since we will use directions instead of texture coordinates to sample from the texture.
        this.gl.samplerParameteri(this.sampler, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.samplerParameteri(this.sampler, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
/*Obstacles Texture*/
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);  
        this.textures['moon'] = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures['moon']);
        this.gl.pixelStorei(this.gl.UNPACK_ALIGNMENT, 4);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.game.loader.resources['moon-texture']);
        this.gl.generateMipmap(this.gl.TEXTURE_2D);
        // Instead of using a sampler, we send the parameter directly to the texture here.
        // While we prefer using samplers since it is a clear separation of responsibilities, anisotropic filtering is yet to be supported by sampler and this issue is still not closed on the WebGL github repository.  
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
        // To keep things organized, we will use two classes we create to handle the camera
        // The camera class contains all the information about the camera
        // The controller class controls the camera

        this.anisotropy_ext = this.gl.getExtension('EXT_texture_filter_anisotropic');
        // The device does not support anisotropic fltering, the extension will be null. So we need to check before using it.
        // if it is supported, we will set our default filtering samples to the maximum value allowed by the device.
        if(this.anisotropy_ext) this.anisotropic_filtering = this.gl.getParameter(this.anisotropy_ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT);


/*Obstacles Texture*/ 
        this.textures['suzanne'] = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures['suzanne']);
        this.gl.pixelStorei(this.gl.UNPACK_ALIGNMENT, 4);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.game.loader.resources['hel']);
        this.gl.generateMipmap(this.gl.TEXTURE_2D);
        // Instead of using a sampler, we send the parameter directly to the texture here.
        // While we prefer using samplers since it is a clear separation of responsibilities, anisotropic filtering is yet to be supported by sampler and this issue is still not closed on the WebGL github repository.  
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
        // To keep things organized, we will use two classes we create to handle the camera
        // The camera class contains all the information about the camera
        // The controller class controls the camera

        this.anisotropy_ext = this.gl.getExtension('EXT_texture_filter_anisotropic');
        // The device does not support anisotropic fltering, the extension will be null. So we need to check before using it.
        // if it is supported, we will set our default filtering samples to the maximum value allowed by the device.
        if(this.anisotropy_ext) this.anisotropic_filtering = this.gl.getParameter(this.anisotropy_ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT);


        this.camera = new Camera();
        this.camera.type = 'perspective';
        this.camera.position = vec3.fromValues(0,this.cameraPos,0);
        this.camera.direction = vec3.fromValues(1,this.cameraDir,1);
        this.camera.aspectRatio = this.gl.drawingBufferWidth/this.gl.drawingBufferHeight;
        
        this.controller = new FlyCameraController(this.camera, this.game.input);
        this.controller.movementSensitivity = 0.01;
        this.controller.fastMovementSensitivity = 0.05;
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.cullFace(this.gl.BACK);
        this.gl.frontFace(this.gl.CCW);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);

        this.gl.clearColor(0,0,0,1);

        this.setupControls();
        this.intOri = this.PlyrOri*this.controller.yaw;

        this.transdirx[0]= this.randomInt(0, 80);
        this.transdiry[0]= 1460;
        this.transdirz[0]=50-this.transdirx[0];
        this.scalex[0]=this.randomInt(5, 10);
        this.scaley[0]=this.randomInt(3,5);
        this.scalez[0]=this.randomInt(5,10); 
        for(let i=1;i<240;i++)
        {
            this.transdirx[i]= this.randomInt(-20, 50);
            this.transdiry[i]= this.randomInt(0, 1450);
            this.transdirz[i]=50-this.transdirx[i];
            this.scalex[i]=this.randomInt(2, 5);
            this.scaley[i]=this.randomInt(2,3);
            this.scalez[i]=this.randomInt(2,5);        
        }
    }

    randomInt(min, max){
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    private checkCollision(plyrPos: vec3)
    {
        for(let i=0;i<240;i++)
        {
            if(plyrPos[0] < this.transdirx[i] + this.scalex[i] && plyrPos[0] > this.transdirx[i] - this.scalex[i])
            if(plyrPos[1] <= this.transdiry[i] + this.scaley[i] + 1.5 && plyrPos[1] >= this.transdiry[i] - 0.5 + this.scaley[i])
            if(plyrPos[2] < this.transdirz[i] + this.scalez[i] && plyrPos[2] > this.transdirz[i] - this.scalez[i])
            {
                return true;
            }       
        }
        return false;
    }


    private onRight(plyrPos: vec3)
    {
        for(let i=0;i<240;i++)
        {
            if(plyrPos[0] < this.transdirx[i] + this.scalex[i] +2&& plyrPos[0] > this.transdirx[i] - this.scalex[i]-2)
            if(plyrPos[1] <= this.transdiry[i] + this.scaley[i] && plyrPos[1] >= this.transdiry[i] - this.scaley[i]-5)
            if(plyrPos[2] < this.transdirz[i] + this.scalez[i]+2 && plyrPos[2] > this.transdirz[i] - this.scalez[i]-2)
            if(plyrPos[0] - this.transdirx[i]-this.scalex[i] + 2 > plyrPos[2] - this.transdirz[i] +this.scalez[i] -2)
            {
                return true;
            }     
        }
        return false;
    }

    private onLeft(plyrPos: vec3)
    {
        for(let i=0;i<240;i++)
        {
            if(plyrPos[0] < this.transdirx[i] + this.scalex[i] +2&& plyrPos[0] > this.transdirx[i] - this.scalex[i]-2)
            if(plyrPos[1] <= this.transdiry[i] + this.scaley[i] && plyrPos[1] >= this.transdiry[i] - this.scaley[i]-5)
            if(plyrPos[2] < this.transdirz[i] + this.scalez[i]+2 && plyrPos[2] > this.transdirz[i] - this.scalez[i]-2)
            if(plyrPos[0] - this.transdirx[i]-this.scalex[i] + 2 < plyrPos[2] - this.transdirz[i] +this.scalez[i]-2)
            {
                return true
            }     
        }
        return false;
    }

    public draw(deltaTime: number): void {
        this.controller.update(deltaTime);
        this.period += deltaTime;    
        if(this.period > 100)
        {
        this.controller.yawSensitivity = Math.random() * 2 - 1;
        this.controller.pitchSensitivity = Math.random() * 2 - 1;
        this.period = 0
        }
        this.controller.yaw += 0.001* this.controller.yawSensitivity;
        this.controller.pitch += 0.001* this.controller.pitchSensitivity;
        this.controller.yaw = Math.min(Math.PI/2, Math.max(-Math.PI/2, this.controller.yaw));
        this.cameraDir -= 0.000008333;
        this.camera.direction = vec3.fromValues(Math.cos(this.controller.yaw)*Math.cos(this.controller.pitch), this.cameraDir+Math.sin(this.controller.pitch), Math.sin(this.controller.yaw)*Math.cos(this.controller.pitch))
        
        
       
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        
        this.programs['texture'].use();

        this.programs['texture'].setUniformMatrix4fv("VP", false, this.camera.ViewProjectionMatrix);
        this.programs['texture'].setUniform3f("cam_position", this.camera.position);

        this.cameraPos-=0.104+performance.now()/950000;
        this.camera.position = vec3.fromValues(0,this.cameraPos,0); 
        //console.log(this.camera.position[1])
        let M = mat4.create();
        let zmp = 50-this.PlyrPos;
        let tvec = vec3.fromValues(this.PlyrPos,this.PlyrAlt,zmp)

        //console.log("Player Position: ", tvec);
        let scal = vec3.fromValues(2,2,2)
        if(this.PlyrPos > 50) this.PlyrPos = 50;
        if(this.PlyrPos < -20) this.PlyrPos = -20;
        if(!this.checkCollision(tvec))
        {
            this.PlyrAlt-=0.12+performance.now()/1000000;
        }
        if(this.PlyrAlt <= 0) this.PlyrAlt = 0;
        if(this.PlyrAlt > this.camera.position[1] + 10)
            {
                if(this.fl==0)
            {
                this.themeSound.stop();
                this.loseSound.play();
                this.PlyrAlt = 0;
                this.end();
                
            }
            }
        //mat4.scale(M,M,scal)
        mat4.translate(M, M, tvec)
        mat4.scale(M, M, scal);
        mat4.rotateY(M,M, 9/7*Math.PI)
        mat4.rotateY(M,M, performance.now()/150)
        mat4.rotateZ(M,M, this.PlyrOri-1)
        
        if(this.camera.position[1] <=0)
        {
            console.log("Reached Ground");
            this.camera.position[1] =0;
            mat4.rotateY(M,M, performance.now()/100)
            this.PlyrAlt = 0
            if(this.fl==0)
            {
                this.winSound.play();
                this.fl=1;
            }
        }

        if(this.game.input.isKeyDown("a")) // Go Left
        {
            if(!this.onLeft(tvec))
            {
            this.PlyrPos+=0.2;
            if(this.PlyrOri < 1.3)
                this.PlyrOri+=0.015;
            }
        }
        if(this.game.input.isKeyDown("d")) // Go Right
        {
            if(!this.onRight(tvec))
            {  
            this.PlyrPos-=0.2;
            if(this.PlyrOri > 0.7)
                this.PlyrOri-=0.015;
            }   
        }

        //console.log("Ori:", this.PlyrOri)
        if(this.PlyrOri > 1.1) this.PlyrOri -= 0.005;
        else if(this.PlyrOri <1.1) this.PlyrOri += 0.005;

        //Lighting
        // Send light properties (remember to normalize the light direction)
        this.programs['texture'].setUniform3f("light.diffuse", this.light.diffuse);
        this.programs['texture'].setUniform3f("light.specular", this.light.specular);
        this.programs['texture'].setUniform3f("light.ambient", this.light.ambient);
        this.programs['texture'].setUniform3f("light.direction", vec3.normalize(vec3.create(), this.light.direction));

          // Send material properties
          this.programs['texture'].setUniform3f("material.diffuse", [0.5,0.5,0.5]);
          this.programs['texture'].setUniform3f("material.specular", [0.2,0.2,0.2]);
          this.programs['texture'].setUniform3f("material.ambient", [0.1,0.1,0.1]);
          this.programs['texture'].setUniform1f("material.shininess", 2);





        this.programs['texture'].setUniformMatrix4fv("M", false, M);
        // We send the model matrix inverse transpose since normals are transformed by the inverse transpose to get correct world-space normals
        this.programs['texture'].setUniformMatrix4fv("M_it", true, mat4.invert(mat4.create(), M));

        //this.programs['texture'].setUniform4f("tint", [0/255, 50/255, 0/255, 1]);
        //this.programs['texture'].setUniform1f('refraction', this.refraction?1:0);
        //this.programs['texture'].setUniform1f('refractive_index', this.refractiveIndex);

        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, this.textures['environment']);
        this.programs['texture'].setUniform1i('cube_texture_sampler', 0);
        
        this.gl.bindSampler(0, this.sampler);
        this.currentMesh = 'suzanne'
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures['hel']);
        this.programs['obstacle'].setUniform1i('texture_sampler', 0);
        // If anisotropic filtering is supported, we send the parameter to the texture paramters.
        if(this.anisotropy_ext) this.gl.texParameterf(this.gl.TEXTURE_2D, this.anisotropy_ext.TEXTURE_MAX_ANISOTROPY_EXT, this.anisotropic_filtering);
        
        this.meshes['suzanne'].draw(this.gl.TRIANGLES);


        //Game Ending
     


        if(this.drawSky){
            this.gl.cullFace(this.gl.FRONT);
            this.gl.depthMask(false);

            this.programs['sky'].use();

            this.programs['sky'].setUniformMatrix4fv("VP", false, this.camera.ViewProjectionMatrix);
            this.programs['sky'].setUniform3f("cam_position", this.camera.position);

            let skyMat = mat4.create();
            mat4.translate(skyMat, skyMat, this.camera.position);
            
            this.programs['sky'].setUniformMatrix4fv("M", false, skyMat);

            this.programs['sky'].setUniform4f("tint", [1, 1, 1, 1]);

            this.gl.activeTexture(this.gl.TEXTURE0);
            this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, this.textures['environment']);
            this.programs['sky'].setUniform1i('cube_texture_sampler', 0);
            this.gl.bindSampler(0, this.sampler);

            this.meshes['cube'].draw(this.gl.TRIANGLES);
            
            this.gl.cullFace(this.gl.BACK);
            this.gl.depthMask(true);
        }

        //Obstacles Draw

         
        this.programs['obstacle'].use();
        for (let i = 0; i < 240; i++) {
    
        let tveco = vec3.fromValues(this.transdirx[i],this.transdiry[i],this.transdirz[i]);        //Need to be randomized
        let sveco = vec3.fromValues(this.scalex[i],this.scaley[i],this.scalez[i]);        //Need to be randomized
        let rotAngle =0;
        let rveco = quat.fromValues(0,0,0,Math.cos(rotAngle/2)); 
        let Mo = mat4.create();
        let diff = mat4.create();
        mat4.fromRotationTranslationScale(Mo,rveco,tveco,sveco);
        let VPo = this.camera.ViewProjectionMatrix; // We get the VPo matrix from our camera class
   
        let MVPo = mat4.create();
        mat4.mul(MVPo, VPo, Mo);

        this.programs['obstacle'].setUniformMatrix4fv("MVP", false, MVPo);
        this.programs['obstacle'].setUniform4f("tint", [1, 1, 1, 1]);

        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures['moon']);
        this.programs['obstacle'].setUniform1i('texture_sampler', 0);
        // If anisotropic filtering is supported, we send the parameter to the texture paramters.
        if(this.anisotropy_ext) this.gl.texParameterf(this.gl.TEXTURE_2D, this.anisotropy_ext.TEXTURE_MAX_ANISOTROPY_EXT, this.anisotropic_filtering);
        this.meshes['moon'].draw(this.gl.TRIANGLES);
    }







        
    }
    
    public end(): void {
        for(let key in this.programs)
            this.programs[key].dispose();
        this.programs = {};
        for(let key in this.meshes)
            this.meshes[key].dispose();
        this.meshes = {};
        for(let key in this.textures)
            this.gl.deleteTexture(this.textures[key]);
        this.textures = {};
        this.gl.deleteSampler(this.sampler);
        this.clearControls();
    }


    /////////////////////////////////////////////////////////
    ////// ADD CONTROL TO THE WEBPAGE (NOT IMPORTNANT) //////
    /////////////////////////////////////////////////////////
    private setupControls() {
        const controls = document.querySelector('#controls');

        const RGBToHex = (rgb: [number, number, number]): string => {
            let arraybuffer = new ArrayBuffer(4);
            let dv = new DataView(arraybuffer);
            dv.setUint8(3, 0);
            dv.setUint8(2, rgb[0]);
            dv.setUint8(1, rgb[1]);
            dv.setUint8(0, rgb[2]);
            return '#' + dv.getUint32(0, true).toString(16);
        }

        const HexToRGB = (hex: string): [number, number, number] => {
            let arraybuffer = new ArrayBuffer(4);
            let dv = new DataView(arraybuffer);
            dv.setUint32(0, Number.parseInt(hex.slice(1), 16), true);
            return [dv.getUint8(2), dv.getUint8(1), dv.getUint8(0)];
        }
        
        controls.appendChild(
            <div>
                <div className="control-row">
                    <label className="control-label">Model:</label>
                    <Selector options={Object.fromEntries(Object.keys(this.meshes).map((x)=>[x,x]))} value={this.currentMesh} onchange={(v)=>{this.currentMesh=v;}}/> 
                </div>
                <div className="control-row">
                    <label className="control-label">Tint:</label>
                    <input type="color" value={RGBToHex(this.tint)} onchange={(ev: InputEvent)=>{this.tint = HexToRGB((ev.target as HTMLInputElement).value)}}/>
                </div>
                <div className="control-row">
                    <input type="checkbox" checked={this.refraction?true:undefined} onchange={(ev: InputEvent)=>{this.refraction = ((ev.target as HTMLInputElement).checked)}}/>
                    <label className="control-label">Refractive Index:</label>
                    <input type="number" value={this.refractiveIndex} onchange={(ev: InputEvent)=>{this.refractiveIndex=Number.parseFloat((ev.target as HTMLInputElement).value)}} step="0.1"/>
                </div>
                <div className="control-row">
                    <input type="checkbox" checked={this.drawSky} onchange={(ev: InputEvent)=>{this.drawSky = ((ev.target as HTMLInputElement).checked)}}/>
                    <label className="control-label">Draw Sky</label>
                </div>
            </div>
            
        );
        
    }

    private clearControls() {
        const controls = document.querySelector('#controls');
        controls.innerHTML = "";
    }


}