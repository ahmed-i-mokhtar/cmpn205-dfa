#version 300 es
precision highp float;

out vec4 color;

uniform float iTime;
uniform vec2 iResolution;

#define PI  3.14159265
#define PI2 6.28318531

#define SIZE 25
#define DELTA PI2/float(SIZE/2)
#define BACKCOLOR_LOWER vec4(0.1,0.3,0.45,1)
#define BACKCOLOR_UPPER vec4(0,0.025,0.05,1)
#define DONT_DRAW_MAIN_SPHERE 0
#define AA
//#define BLINN
#define ACES_TM
//#define EXPOSURE_TM
//#define REINHARD_TM
//#define GAMMA_CORRECTION


const float ball_speed = 0.25;
const float light_speed = 0.25;
const vec3 mainCenter = vec3(0,0,20);
const float rotationRadius = 12.0;
const float mainRadius = 10.0;
const float subRadius = 1.0;

const vec3 albedo0 = vec3(0.7,0.6,0.1);
const vec3 ambient0 = vec3(0.1,0.1,0.05);
const vec3 albedo1 = vec3(0.6,0.05,0.1);
const vec3 ambient1 = vec3(0.1,0,0.05);
const vec3 albedo2 = vec3(0.05,0.6,0.1);
const vec3 ambient2 = vec3(0,0.1,0.05);

struct sphere
{
    vec3 center;
    float radius;
    vec3 albedo;
    vec3 ambient;
};

struct directional_light
{
    vec3 direction;
};

struct ray
{
    vec3 start;
    vec3 direction;
};

struct ray_hit
{
    int idx;
    float dist;
};

sphere spheres[SIZE];
directional_light light;

ray_hit raySphereIntersect(in ray r, in sphere s)
{
    vec3 L = s.center - r.start;
    float proj = dot(r.direction, L);
    float dis2 = dot(L,L) - proj*proj;
	float r2 = s.radius * s.radius;
    if(dis2 > r2) return ray_hit(-1,proj);
    float db = sqrt(r2 - dis2);
    float x = proj - db;
	if(x < 0.0) return ray_hit(-1,x);
	return ray_hit(0, x);
}

ray_hit sceneIntersect(in ray r, in int begin, in int end, in int except)
{
    ray_hit res = ray_hit(-1,1e12);
    for(int i = begin; i < end; i++){
        if(i != except){
        	ray_hit ires = raySphereIntersect(r, spheres[i]);
            if(ires.idx >= 0 && ires.dist < res.dist) res = ray_hit(i, ires.dist);
        }
    }
    return res;
}

vec3 rotfn(float val, float val2)
{
    float cosval = cos(val);
    return normalize(vec3(cos(val2)*cosval,sin(val2)*cosval,sin(val)));
}

vec4 simplephong(in ray r, in ray_hit h)
{
    vec3 point = r.start + h.dist * r.direction;
    ray_hit lightRes = sceneIntersect(ray(point, -light.direction), DONT_DRAW_MAIN_SPHERE, SIZE, h.idx);
    vec3 normal = (point - spheres[h.idx].center)/spheres[h.idx].radius;
    float fresnel = 0.2*pow(1.0+dot(r.direction,normal), 4.0);
    if(lightRes.idx < 0)
    {
        float diffuse = max(dot(-light.direction, normal), 0.0);
        #ifdef BLINN 
        float specular = pow(max(0.0, -dot(normal, normalize(light.direction + r.direction))), 140.0);
        #else
        float specular = pow(max(0.0, -dot(r.direction, reflect(light.direction, normal))), 70.0);
        #endif
        return vec4((diffuse+fresnel)*spheres[h.idx].albedo + spheres[h.idx].ambient + specular*vec3(1),1);
    }
    else
        return vec4(fresnel*spheres[h.idx].albedo + spheres[h.idx].ambient,1);
}

vec4 reflectivephong(in ray r, in ray_hit h)
{
    vec3 point = r.start + h.dist * r.direction;
    ray_hit lightRes = sceneIntersect(ray(point, -light.direction), DONT_DRAW_MAIN_SPHERE, SIZE, h.idx);
    vec3 normal = normalize(point - spheres[h.idx].center);
    float fresnel = 0.2*pow(1.0+dot(r.direction,normal), 4.0);
    vec4 reflected = vec4(0,0,0,1);
    vec3 refDir = reflect(r.direction, normal);
    ray_hit refRes = sceneIntersect(ray(point, refDir), DONT_DRAW_MAIN_SPHERE, SIZE, h.idx);
    if(refRes.idx >= 0){
        reflected = simplephong(ray(point, refDir), refRes);
    } else {
        reflected = mix(BACKCOLOR_LOWER,BACKCOLOR_UPPER,(refDir.y+1.0)/2.0);
    }
    if(lightRes.idx < 0)
    {
        float diffuse = max(dot(-light.direction, normal), 0.0);
        #ifdef BLINN 
        float specular = pow(max(0.0, -dot(normal, normalize(light.direction + r.direction))), 140.0);
        #else
        float specular = pow(max(0.0, -dot(r.direction, reflect(light.direction, normal))), 70.0);
        #endif
        return vec4((diffuse+fresnel)*spheres[h.idx].albedo + spheres[h.idx].ambient + 0.9*reflected.rgb + specular*vec3(1,1,1),1);
    }
    else
        return vec4(fresnel*spheres[h.idx].albedo + spheres[h.idx].ambient + 0.9*reflected.rgb,1);
}

vec3 coord2dir(vec2 coord)
{
    float aspectRatio = iResolution.x/iResolution.y;
	vec2 uv = coord / iResolution.xy;
    uv = (2.0*uv - 1.0)*vec2(aspectRatio,1);
    return normalize(vec3(uv, 1.0));
}

#ifdef ACES_TM
//ACES Filmic Tonemapping Approximation 
//From https://knarkowicz.wordpress.com/2016/01/06/aces-filmic-tone-mapping-curve/
vec3 ACESFilm( vec3 x )
{
    float a = 2.51f;
    float b = 0.03f;
    float c = 2.43f;
    float d = 0.59f;
    float e = 0.14f;
    return clamp((x*(a*x+b))/(x*(c*x+d)+e), 0.0, 1.0);
}
#endif


void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    const vec3 start = vec3(0,0,0);
    
    float stime = iTime*ball_speed;
    float lstime = iTime*light_speed;
    
    light.direction = normalize(vec3(cos(lstime),cos(lstime),sin(lstime)));
    
    spheres[0] = sphere(mainCenter, mainRadius, albedo0, ambient0);
    for(int i = 1; i < SIZE/2+1; i++){
        spheres[i] = sphere(mainCenter - rotationRadius*rotfn(stime+DELTA*float(i), stime+PI/4.0),
                            subRadius, albedo1, ambient1);
    }
    for(int i = SIZE/2+1; i < SIZE; i++){
        spheres[i] = sphere(mainCenter - rotationRadius*rotfn(stime+DELTA*float(i)+ DELTA/2.0, stime-PI/4.0),
                            subRadius, albedo2, ambient2);
    }
    
    fragColor = vec4(0);
    #ifdef AA
    for(int i = -1; i < 2; i++){
        for(int j = -1; j < 2; j++) {
            vec3 direction = coord2dir(fragCoord+vec2(i,j)/2.0);
            #else
            vec3 direction = coord2dir(fragCoord);
            #endif
            ray_hit res = sceneIntersect(ray(start, direction), DONT_DRAW_MAIN_SPHERE, SIZE, -1);
            if(res.idx < 0) 
                fragColor += mix(BACKCOLOR_LOWER,BACKCOLOR_UPPER,(direction.y+1.0)/2.0);
            else
                fragColor += reflectivephong(ray(start, direction), res);
            #ifdef AA
        }
    }
    fragColor /= 9.0;
    #endif
    #ifdef ACES_TM
    //ACES Filmic ToneMapping
    fragColor = vec4(ACESFilm(fragColor.rgb), 1.0);
    #elif defined(EXPOSURE_TM)
    //Exposure ToneMapping
    const float exposure = 1.0;
    fragColor = vec4(vec3(1.0) - exp(-fragColor.rgb * exposure), 1.0);
    #elif defined(REINHARD_TM)
    //Reinhard Tonemapping
    fragColor /= vec4((fragColor + vec4(1.0)).rgb, 1.0);
    #endif
    #ifdef GAMMA_CORRECTION
    // Gamma correction 
    const float gamma = 2.2;
    fragColor = pow(fragColor, vec4(1.0 / gamma));
    #endif
}

void main(){
    mainImage(color, gl_FragCoord.xy);
}