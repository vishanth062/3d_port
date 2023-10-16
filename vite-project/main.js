import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import{GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 100);
camera.position.setZ(40);
var renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

// Spinning ball with changing color
var ballGeometry = new THREE.SphereGeometry(1, 32, 32);
var ballMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
var spinningBall = new THREE.Mesh(ballGeometry, ballMaterial);
scene.add(spinningBall);

// Original torus
var torusGeometry = new THREE.TorusGeometry(10, 3, 16, 100);
var torusMaterial = new THREE.MeshStandardMaterial({
  color: 0x0ffff0,
});
var torus = new THREE.Mesh(torusGeometry, torusMaterial);
scene.add(torus);

// Moon at the center of the torus with texture
var moonGeometry = new THREE.SphereGeometry(3, 32, 32);
var moonTexture = new THREE.TextureLoader().load('moon_texture.jpg'); // Provide the path to your moon texture
var moonMaterial = new THREE.MeshStandardMaterial({ map: moonTexture, color: 0xffff00 }); // Set color to yellow
var moon = new THREE.Mesh(moonGeometry, moonMaterial);
scene.add(moon);

moon.position.set(0, 0, 0); // Position the moon at the center of the torus

// Spotlight on the moon
var moonSpotlight = new THREE.SpotLight(0xffffff, 1);
moonSpotlight.position.set(0, 0, 0); // Set the position of the spotlight to the moon
moonSpotlight.target = moon; // Set the moon as the target of the spotlight
scene.add(moonSpotlight);


// Lights
var light = new THREE.SpotLight(0xffffff);
light.position.set(5, 5, 5);
scene.add(light);

var light2 = new THREE.AmbientLight(0xffffff);
scene.add(light2);

// Grid helper
var gridhelper = new THREE.GridHelper(200, 50);
scene.add(gridhelper);

// Controls
var controls = new OrbitControls(camera, renderer.domElement);
scene.background = new THREE.Color(0x000000); // Set background color to black

// Function to move the spinning ball based on mouse coordinates
function moveBall(event) {
  const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

  const vector = new THREE.Vector3(mouseX, mouseY, 0.5);
  vector.unproject(camera);

  const dir = vector.sub(camera.position).normalize();
  const distance = -camera.position.z / dir.z;
  const pos = camera.position.clone().add(dir.multiplyScalar(distance));

  spinningBall.position.copy(pos);
}

document.addEventListener('mousemove', moveBall, false);

// Create an array of stars
var stars = createStars();

// Create and animate freely floating squares
var squares = createFloatingSquares();
animateFloatingSquares();
//
function addBalloon() {
  const balloonGeometry = new THREE.SphereGeometry(1, 16, 16);
  const balloonMaterial = new THREE.MeshStandardMaterial({
    color: getRandomColor(),
  });
  const balloon = new THREE.Mesh(balloonGeometry, balloonMaterial);

  // Position balloons randomly in the scene above the torus
  balloon.position.set(
    THREE.MathUtils.randFloatSpread(20),
    20 + THREE.MathUtils.randFloat(5, 15),
    THREE.MathUtils.randFloatSpread(20)
  );

  scene.add(balloon);
  return balloon;
}

// Function to create and add balloons
function createBalloons() {
  const numBalloons = 10;
  const balloons = [];

  for (let i = 0; i < numBalloons; i++) {
    const balloonGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const balloonMaterial = new THREE.MeshStandardMaterial({
      color: getRandomColor(),
    });
    const balloon = new THREE.Mesh(balloonGeometry, balloonMaterial);

    // Position balloons randomly in the scene
    balloon.position.set(
      THREE.MathUtils.randFloatSpread(20),
      THREE.MathUtils.randFloat(5, 15),
      THREE.MathUtils.randFloatSpread(20)
    );

    // Create spotlight for each balloon
    const spotlight = new THREE.SpotLight(getRandomColor(), 1);
    spotlight.position.copy(balloon.position);
    scene.add(spotlight);

    scene.add(balloon);
    balloons.push({ balloon, spotlight });
  }

  return balloons;
}

// Create an array of balloons
var balloons = createBalloons();
//const spaceTexture=new THREE.TextureLoader().load('./space4.jpg');
//scene.background=spaceTexture;
// Function to animate balloons
function animateBalloons() {
  balloons.forEach((balloon) => {
    balloon.position.y += 0.05; // Adjust the speed of the balloons rising
    balloon.position.x += Math.sin(Date.now() * 0.001) * 0.1; // Add horizontal motion

    // Reset balloon position when it goes above a certain height
    if (balloon.position.y > 25) {
      balloon.position.y = THREE.MathUtils.randFloat(5, 15);
      balloon.position.x = THREE.MathUtils.randFloatSpread(20);
      balloon.position.z = THREE.MathUtils.randFloatSpread(20);
    }
  });
}
// Function to animate the scene
function animate() {
  requestAnimationFrame(animate);

  // Spinning animation for the white ball and the torus
  spinningBall.rotation.x += 0.01;
  spinningBall.rotation.y += 0.005;
  spinningBall.rotation.z += 0.002;

  // Change color of the spinning ball over time
  spinningBall.material.color.set(getRandomColor());

  torus.rotation.x += 0.01;
  torus.rotation.y += 0.005;
  torus.rotation.z += 0.002;

  // Move stars in a sine wave pattern
  moveStars();

  // Animate freely floating squares
  animateFloatingSquares();

  controls.update();
  renderer.render(scene, camera);
}

// Start the animation
function handleScroll() {
  const scrollY = window.scrollY;
  const zoomFactor = 0.1; // Adjust the zoom speed as needed

  // Update camera position based on scroll
  camera.position.z = 40 - scrollY * zoomFactor;
}

// Add scroll event listener
document.addEventListener('scroll', handleScroll);
animate();

// Helper function to get a random color
function getRandomColor() {
  return new THREE.Color(Math.random(), Math.random(), Math.random());
}

// Function to create and add a star
function addStar() {
  const gemort = new THREE.SphereGeometry(0.25, 24, 24);
  const material = new THREE.MeshStandardMaterial({
    color: getRandomColor(),
  });
  const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));
  var star = new THREE.Mesh(gemort, material);
  scene.add(star);

  // Add a property to each star to keep track of its initial position
  star.userData = { initialX: x, initialY: y, initialZ: z };

  return star;
}

// Function to create an array of stars
function createStars() {
  return Array(500).fill().map(addStar);
}

// Function to move stars in a sine wave pattern
function moveStars() {
  const time = Date.now() * 0.001;

  stars.forEach((star, index) => {
    const distance = 5 + index * 0.1;
    const speed = 0.1;

    star.position.x = star.userData.initialX + Math.sin(time * speed) * distance;
    star.position.y = star.userData.initialY + Math.cos(time * speed) * distance;
    star.position.z = star.userData.initialZ + Math.sin(time * speed) * distance;
  });
}

// Function to create freely floating squares
function createFloatingSquares() {
  const numSquares = 10;
  const squares = [];

  for (let i = 0; i < numSquares; i++) {
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshStandardMaterial({
      color: getRandomColor(),
      wireframe: true, // Enable wireframe
    });
    const square = new THREE.Mesh(geometry, material);

    // Position squares randomly in the scene
    square.position.set(
      THREE.MathUtils.randFloatSpread(20),
      THREE.MathUtils.randFloatSpread(20),
      THREE.MathUtils.randFloatSpread(20)
    );

    scene.add(square);
    squares.push(square);
  }

  return squares;
}


const gltfLoader=new GLTFLoader();
gltfLoader.load('./sony_fx_300_-_jackal/scene.gltf',(gltfScene)=>{
  gltfScene.scene.position.set(0, 0,0);
  scene.add(gltfScene.scene);

  const boundingBox = new THREE.Box3().setFromObject(gltfScene.scene);

    // Calculate the center of the bounding box
    const center = new THREE.Vector3();
    boundingBox.getCenter(center);
var camerra=new THREE.PerspectiveCamera(45,innerWidth/innerHeight,1,1000);
    // Adjust the camera position to look at the center of the model
    camerra.position.set(0, 0, boundingBox.max.z * 2); // Adjust the multiplier as needed
    camerra.lookAt(center);

    camerra.userData.originalPosition = camera.position.clone();
    camerra.userData.originalRotation = camera.rotation.clone();

    // Add the camera to the scene
    scene.add(camerra);

    const spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(0, 10, 10); // Adjust position as needed
    spotLight.target = gltfScene.scene; // Make the spotlight target the loaded model
    scene.add(spotLight);
});



// Function to animate freely floating squares
function animateFloatingSquares() {
  squares.forEach((square) => {
    square.rotation.x += 0.01;
    square.rotation.y += 0.005;
    square.rotation.z += 0.002;
  });
}
