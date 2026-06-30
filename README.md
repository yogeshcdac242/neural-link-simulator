<div align="center">
  <h1>🧠 Extremis Neural Graph</h1>
  <p><strong>A Hyper-Detailed, Interactive 3D Sci-Fi Brain Simulator</strong></p>
  
  [![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
  [![Three.js](https://img.shields.io/badge/ThreeJs-black?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
  [![JavaScript](https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
</div>

<br />

![Cyber Brain Preview](./image11)


*(Note: Add your own `screenshot.png` to the root of the repository to display the preview here!)*

## 🌌 Overview

**Extremis Neural Graph** is a futuristic, highly interactive 3D particle simulation built with **Three.js**. It renders a hyper-detailed, holographic model of a human brain featuring a glowing cyber-mesh shell and an active, firing inner neural network. 

The simulation is fully responsive and reacts dynamically to user interaction, providing a cinematic, cyberpunk aesthetic straight out of a sci-fi movie.

## ✨ Features

- **Holographic Cyber-Mesh Shell**: The outer layer is composed of a glowing cyan particle grid, mathematically constrained to an ellipsoidal brain shape.
- **Neon Neural Core**: Zoom inside the shell to reveal a dense network of firing orange and red nodes (neurons).
- **Dynamic Synapses**: Neurons that drift close to each other dynamically form glowing line connections (synapses).
- **Thought Pulses**: Simulated "thoughts" periodically fire through the network, illuminating random pathways with bright bursts of energy.
- **Interactive Physics**: 
  - Hover your mouse into the network to excite nearby neurons and repel them magnetically.
  - Active areas glow intensely to simulate localized neural processing.
- **Cinematic Controls**: Full 3D camera controls using `OrbitControls` allow you to freely rotate, pan, and zoom completely inside the brain.

## 🚀 Quick Start

Ensure you have [Node.js](https://nodejs.org/) installed, then run the following commands to get the simulation running locally:

### 1. Clone the repository
```bash
git clone https://github.com/yogeshcdac242/neural-link-simulator.git
cd neural-link-simulator
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run the development server
```bash
npm run dev
```

Open `http://localhost:5173` (or the port provided in your terminal) in your browser to interact with the simulation.

## 🛠️ Technology Stack

- **[Three.js](https://threejs.org/)**: Core WebGL 3D rendering engine.
- **[Vite](https://vitejs.dev/)**: Next-generation frontend tooling and bundler.
- **Vanilla JavaScript & CSS**: Clean, dependency-free logic and styling.

## 📂 Project Structure

- `main.js`: Contains all the Three.js logic, geometry generation, animation loop, and interactive raycasting.
- `index.html`: The entry point and main canvas container.
- `style.css`: Minimal styling to ensure a full-screen, responsive, dark cybernetic background.
