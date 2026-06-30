import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const canvas = document.getElementById('canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
// Enable additive blending glow effects
renderer.setClearColor(0x050508, 1); // Dark cybernetic background

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050508, 0.002);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 2000);
camera.position.set(0, 50, 400);

// Add OrbitControls for zooming, panning, and rotating
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 50; // Zoom in limit (see inside neurons)
controls.maxDistance = 800; // Zoom out limit (dense view)

// ----------------------------------------------------
// Brain Shape Parameters
// ----------------------------------------------------
const brainScaleX = 140;
const brainScaleY = 100;
const brainScaleZ = 120;

// 1. Outer Cyber-Mesh Shell (Cyan)
const outerCount = 800;
const outerGeo = new THREE.BufferGeometry();
const outerPos = new Float32Array(outerCount * 3);

for (let i = 0; i < outerCount; i++) {
  // Generate points on the surface of an ellipsoid
  const u = Math.random();
  const v = Math.random();
  const theta = u * 2.0 * Math.PI;
  const phi = Math.acos(2.0 * v - 1.0);
  
  const x = brainScaleX * Math.sin(phi) * Math.cos(theta);
  const y = brainScaleY * Math.sin(phi) * Math.sin(theta);
  const z = brainScaleZ * Math.cos(phi);
  
  outerPos[i * 3] = x;
  outerPos[i * 3 + 1] = y;
  outerPos[i * 3 + 2] = z;
}
outerGeo.setAttribute('position', new THREE.BufferAttribute(outerPos, 3));

const outerMat = new THREE.PointsMaterial({
  color: 0x00ffff, // Cyan
  size: 2.0,
  transparent: true,
  opacity: 0.6,
  blending: THREE.AdditiveBlending
});
const outerShell = new THREE.Points(outerGeo, outerMat);
scene.add(outerShell);

// 2. Inner Neural Network (Orange / Red)
const innerCount = 1500;
const innerGeo = new THREE.BufferGeometry();
const innerPos = new Float32Array(innerCount * 3);
const innerOrig = new Float32Array(innerCount * 3); // For spring physics
const innerVel = [];

for (let i = 0; i < innerCount; i++) {
  // Generate points inside the ellipsoid
  const u = Math.random();
  const v = Math.random();
  const w = Math.cbrt(Math.random()) * 0.85; // 0.85 to keep it inside the shell
  const theta = u * 2.0 * Math.PI;
  const phi = Math.acos(2.0 * v - 1.0);
  
  const x = brainScaleX * w * Math.sin(phi) * Math.cos(theta);
  const y = brainScaleY * w * Math.sin(phi) * Math.sin(theta);
  const z = brainScaleZ * w * Math.cos(phi);
  
  innerPos[i * 3] = x;
  innerPos[i * 3 + 1] = y;
  innerPos[i * 3 + 2] = z;
  
  innerOrig[i * 3] = x;
  innerOrig[i * 3 + 1] = y;
  innerOrig[i * 3 + 2] = z;
  
  innerVel.push(new THREE.Vector3(
    (Math.random() - 0.5) * 0.5,
    (Math.random() - 0.5) * 0.5,
    (Math.random() - 0.5) * 0.5
  ));
}
innerGeo.setAttribute('position', new THREE.BufferAttribute(innerPos, 3));

const innerMat = new THREE.PointsMaterial({
  color: 0xff3300, // Orange/Red neon
  size: 2.5,
  transparent: true,
  opacity: 0.9,
  blending: THREE.AdditiveBlending
});
const innerNetwork = new THREE.Points(innerGeo, innerMat);
scene.add(innerNetwork);

// 3. Inner Synapses (Lines)
const maxLines = innerCount * 4;
const linesGeo = new THREE.BufferGeometry();
const linePositions = new Float32Array(maxLines * 6);
const lineColors = new Float32Array(maxLines * 6);

linesGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
linesGeo.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));

const linesMat = new THREE.LineBasicMaterial({
  vertexColors: true,
  transparent: true,
  opacity: 0.5,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});
const synapses = new THREE.LineSegments(linesGeo, linesMat);
scene.add(synapses);


// ----------------------------------------------------
// Interaction & Animation
// ----------------------------------------------------

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2(-1000, -1000);

window.addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const clock = new THREE.Clock();
const connectionDistance = 28; // How close nodes must be to connect

function animate() {
  requestAnimationFrame(animate);
  const time = clock.getElapsedTime();
  
  controls.update(); // Required for damping
  
  // Slowly rotate the whole brain for cinematic effect
  scene.rotation.y = Math.sin(time * 0.1) * 0.2;
  scene.rotation.x = Math.cos(time * 0.1) * 0.1;
  
  // Pulse the outer shell slightly
  const shellScale = 1.0 + Math.sin(time * 2.0) * 0.02;
  outerShell.scale.set(shellScale, shellScale, shellScale);

  // Determine active intersection for interactive hovering
  raycaster.setFromCamera(mouse, camera);
  // We intersect against the invisible sphere approximation to find where mouse points
  let hoverPoint = null;
  const intersects = raycaster.intersectObject(innerNetwork);
  // We'll use ray distance to find the closest point in space instead of strict intersection
  // to make it feel more magical.
  const ray = raycaster.ray;

  // Update Inner Particles Physics
  const positions = innerNetwork.geometry.attributes.position.array;
  
  for (let i = 0; i < innerCount; i++) {
    const i3 = i * 3;
    const px = positions[i3];
    const py = positions[i3 + 1];
    const pz = positions[i3 + 2];
    
    // Natural jitter / drift
    positions[i3] += innerVel[i].x;
    positions[i3 + 1] += innerVel[i].y;
    positions[i3 + 2] += innerVel[i].z;
    
    // Spring back to original shape
    const ox = innerOrig[i3];
    const oy = innerOrig[i3 + 1];
    const oz = innerOrig[i3 + 2];
    
    positions[i3] += (ox - px) * 0.02;
    positions[i3 + 1] += (oy - py) * 0.02;
    positions[i3 + 2] += (oz - pz) * 0.02;
    
    // Mouse hover repulsion / excitement
    // We calculate distance from the particle to the camera ray
    const pVec = new THREE.Vector3(px, py, pz).applyMatrix4(innerNetwork.matrixWorld);
    const distToRay = ray.distanceToPoint(pVec);
    
    if (distToRay < 30) {
      // Repel from ray slightly
      const closestPoint = ray.closestPointToPoint(pVec, new THREE.Vector3());
      const dir = pVec.clone().sub(closestPoint).normalize();
      
      positions[i3] += dir.x * 1.5;
      positions[i3 + 1] += dir.y * 1.5;
      positions[i3 + 2] += dir.z * 1.5;
    }
  }
  innerNetwork.geometry.attributes.position.needsUpdate = true;
  
  // Calculate Synapse Lines (only for inner network)
  let lineIndex = 0;
  let activeLines = 0;
  
  // Firing logic: randomly excite some nodes to simulate thoughts
  const thoughtFocus = (Math.sin(time * 3) * 0.5 + 0.5) * innerCount; 
  
  for (let i = 0; i < innerCount; i++) {
    const i3 = i * 3;
    const p1x = positions[i3];
    const p1y = positions[i3 + 1];
    const p1z = positions[i3 + 2];
    
    // Calculate distance to ray for interaction glow
    const pVec1 = new THREE.Vector3(p1x, p1y, p1z).applyMatrix4(innerNetwork.matrixWorld);
    const distToRay1 = ray.distanceToPoint(pVec1);
    const mouseGlow1 = Math.max(0, 1.0 - (distToRay1 / 40.0));
    
    // Random thought firing glow
    const thoughtGlow1 = Math.abs(i - thoughtFocus) < 50 ? 1.0 : 0.0;
    
    const excite1 = Math.max(mouseGlow1, thoughtGlow1);
    
    for (let j = i + 1; j < innerCount; j++) {
      const j3 = j * 3;
      const p2x = positions[j3];
      const p2y = positions[j3 + 1];
      const p2z = positions[j3 + 2];
      
      const dx = p1x - p2x;
      const dy = p1y - p2y;
      const dz = p1z - p2z;
      const distSq = dx*dx + dy*dy + dz*dz;
      
      if (distSq < connectionDistance * connectionDistance) {
        if (activeLines < maxLines) {
          linePositions[lineIndex] = p1x;
          linePositions[lineIndex + 1] = p1y;
          linePositions[lineIndex + 2] = p1z;
          
          linePositions[lineIndex + 3] = p2x;
          linePositions[lineIndex + 4] = p2y;
          linePositions[lineIndex + 5] = p2z;
          
          const pVec2 = new THREE.Vector3(p2x, p2y, p2z).applyMatrix4(innerNetwork.matrixWorld);
          const distToRay2 = ray.distanceToPoint(pVec2);
          const mouseGlow2 = Math.max(0, 1.0 - (distToRay2 / 40.0));
          const thoughtGlow2 = Math.abs(j - thoughtFocus) < 50 ? 1.0 : 0.0;
          
          const excite2 = Math.max(mouseGlow2, thoughtGlow2);
          const maxExcite = Math.max(excite1, excite2);
          
          // Base color: Orange/Red (1.0, 0.2, 0.0)
          // Excited color: Bright Yellow/White (1.0, 1.0, 0.8)
          const r = 1.0;
          const g = 0.2 + maxExcite * 0.8;
          const b = 0.0 + maxExcite * 0.8;
          
          // Fade alpha by distance
          const distRatio = 1.0 - (Math.sqrt(distSq) / connectionDistance);
          const alpha = distRatio * (0.3 + maxExcite * 0.7);
          
          lineColors[lineIndex] = r * alpha;
          lineColors[lineIndex + 1] = g * alpha;
          lineColors[lineIndex + 2] = b * alpha;
          
          lineColors[lineIndex + 3] = r * alpha;
          lineColors[lineIndex + 4] = g * alpha;
          lineColors[lineIndex + 5] = b * alpha;
          
          lineIndex += 6;
          activeLines++;
        }
      }
    }
  }
  
  synapses.geometry.setDrawRange(0, activeLines * 2);
  synapses.geometry.attributes.position.needsUpdate = true;
  synapses.geometry.attributes.color.needsUpdate = true;

  renderer.render(scene, camera);
}

animate();
