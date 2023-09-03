// imports
import * as THREE from 'three'

// scene and camera setup
const scene = new THREE.Scene()
const perspectiveCamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000)
perspectiveCamera.position.depth = 6

// renderer setup
const renderer = new THREE.WebGLRenderer({antialias: true})
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(devicePixelRatio)
document.body.appendChild(renderer.domElement)

// global variables
var textureLocal
var planeGeometry
var planeMesh
var planeGrid
var initialTheta = 0
var numberOfWidthSegments = 10
var numberOfDepthSegments = 10

// function for texture loading
function loadTexture() {
    const loader = new THREE.TextureLoader();
    const path = require('../images/cloth.png')
    textureLocal = loader.load(path);    
}

// function to  initialize shader
function initialShaders() {
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    const vertexShader = /*glsl*/`
    varying vec2 vUv; 

    void main(void) 
    {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
    `;

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    const fragmentShader = /*glsl*/`
    uniform sampler2D texture1; 
    uniform sampler2D texture2; 
    varying vec2 vUv;

    void main(void) 
    {
        vec4 color1 = texture2D(texture1, vUv);
        vec4 color2 = texture2D(texture2, vUv);
        gl_FragColor = color1;
    }
    `;

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    loadTexture()

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    const uniforms = {
        texture1: { value: textureLocal }
    };

    const material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: vertexShader, 
        fragmentShader: fragmentShader
    });

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    planeGeometry = new THREE.PlaneGeometry(2, 3, numberOfWidthSegments-1, numberOfDepthSegments-1) // (numberOfWidthSegments, height, numberOfWidthSegmentsSegments, heightSegments)
    planeMesh = new THREE.Mesh(planeGeometry, material)
    const {planeGridArray} = planeMesh.geometry.attributes.position
    planeMesh.translateY(0.0)
    planeMesh.rotateX(-60.0 * Math.PI / 180)
    planeMesh.rotateZ(-60.0 * Math.PI / 180)
    
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    planeGrid = planeGridArray
    
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    scene.add(planeMesh)  
}

// function to update mesh animation
function animateMesh() {
    var theta = initialTheta

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    for(let depth = 0; depth < numberOfDepthSegments; depth++) {
        for(let width = 0; width < numberOfWidthSegments; width++) {
            const index = 3 * (depth * numberOfWidthSegments + width);  
            
            planeGrid[index + 0] = Math.sin(theta * Math.PI / 180)
            planeGrid[index + 2] += Math.sin(theta * 2 * Math.PI / 180)
            planeGrid[index + 2] *= 0.25 
        }        

        theta += 3.0
    }

    initialTheta += 0.5

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    planeMesh.geometry.attributes.position.needsUpdate = true;
}
   
// function to render scene with mesh
function render() { 
    requestAnimationFrame(render)
        
    animateMesh()
    
    renderer.render(scene, perspectiveCamera)
}

initialShaders()
render()
