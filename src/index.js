import * as THREE from 'three';

const scene = new THREE.Scene()
const perspectiveCamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000)
const renderer = new THREE.WebGLRenderer({antialias: true})

renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(devicePixelRatio)
document.body.appendChild(renderer.domElement)

////////////////////////////////////////////////////////////////////////////////////////////
var initialValue = 0

const Xsegments = 50
const Zsegments = 50
const planeGeometry = new THREE.PlaneGeometry(2, 3, Xsegments-1, Zsegments-1) // (width, height, widthSegments, heightSegments)

perspectiveCamera.position.z = 6

////////////////////////////////////////////////////////////////////////////////////////////
const vertexShader = /*glsl*/`
varying vec2 vUv; 

void main(void) 
{
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

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

////////////////////////////////////////////////////////////////////////////////////////////

const planeBufferGeometry= new THREE.PlaneGeometry(1, 1);

////////////////////////////////////////////////////////////////////////////////////////////

const loader = new THREE.TextureLoader()

const path = require('../images/cloth.png')
const texture1 = loader.load(path);

const uniforms = {
    texture1: { value: texture1 },
};

const material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertexShader, 
    fragmentShader: fragmentShader
});

const planeMeshShader = new THREE.Mesh(planeGeometry, material)
const {array} = planeMeshShader.geometry.attributes.position
planeMeshShader.translateY(0.0)
planeMeshShader.rotateX(-60.0 * Math.PI / 180)
planeMeshShader.rotateZ(-60.0 * Math.PI / 180)
scene.add(planeMeshShader)

function animate() { 
    requestAnimationFrame(animate);   
    
    var sineVal = initialValue
    for(let z = 0; z < Zsegments; z++) {
        for(let x = 0; x < Xsegments; x++) {
            const index = 3 * (z * Xsegments + x);  
            
            array[index + 2] = Math.sin(sineVal * 1.5 * Math.PI / 180)
            array[index + 2] *= 0.25
        }        

        sineVal += 5.0
    }
    initialValue += 0.5

    planeMeshShader.geometry.attributes.position.needsUpdate = true;

    renderer.render(scene, perspectiveCamera)
}

animate()
