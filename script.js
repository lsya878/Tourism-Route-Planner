// Tamil Nadu cities data with positions and connections
const cities = {
  Chennai: {
    x: 80,
    y: 50,
    connections: { Vellore: 150, Kanchipuram: 70, Tiruvallur: 40 },
  },
  Coimbatore: {
    x: 40,
    y: 80,
    connections: { Tiruppur: 50, Erode: 90, Nilgiris: 120 },
  },
  Madurai: {
    x: 60,
    y: 85,
    connections: { Dindigul: 60, Theni: 70, Sivaganga: 80 },
  },
  Trichy: {
    x: 70,
    y: 70,
    connections: { Pudukkottai: 50, Karur: 70, Perambalur: 60 },
  },
  Salem: {
    x: 50,
    y: 60,
    connections: { Dharmapuri: 70, Namakkal: 40, Krishnagiri: 80 },
  },
  Vellore: {
    x: 60,
    y: 40,
    connections: { Tiruvannamalai: 70, Kanchipuram: 80 },
  },
  Kanchipuram: { x: 70, y: 45, connections: { Chennai: 70, Tiruvallur: 50 } },
  Tiruvallur: { x: 75, y: 40, connections: { Chennai: 40 } },
  Tiruppur: { x: 35, y: 75, connections: { Coimbatore: 50, Erode: 60 } },
  Erode: {
    x: 45,
    y: 70,
    connections: { Coimbatore: 90, Tiruppur: 60, Salem: 80 },
  },
  Nilgiris: { x: 30, y: 90, connections: { Coimbatore: 120 } },
  Dindigul: { x: 55, y: 80, connections: { Madurai: 60, Karur: 90 } },
  Theni: { x: 50, y: 90, connections: { Madurai: 70 } },
  Sivaganga: { x: 65, y: 90, connections: { Madurai: 80 } },
  Pudukkottai: { x: 65, y: 75, connections: { Trichy: 50 } },
  Karur: { x: 55, y: 70, connections: { Trichy: 70, Dindigul: 90 } },
  Perambalur: { x: 75, y: 65, connections: { Trichy: 60 } },
  Dharmapuri: { x: 45, y: 50, connections: { Salem: 70, Krishnagiri: 60 } },
  Namakkal: { x: 50, y: 65, connections: { Salem: 40 } },
  Krishnagiri: { x: 55, y: 45, connections: { Salem: 80, Dharmapuri: 60 } },
  Tiruvannamalai: { x: 65, y: 55, connections: { Vellore: 70 } },
};

// Global variables
let selectedAlgorithm = null;
let currentStep = 0;
let algorithmSteps = [];
let visitedNodes = new Set();
let currentPath = [];
let mstEdges = [];
let shortestPath = [];

// Initialize the visualization
function initializeVisualization() {
  const container = document.getElementById("map-container");
  container.innerHTML = "";

  // Draw connections first (so they appear behind nodes)
  for (const city in cities) {
    for (const connectedCity in cities[city].connections) {
      // Only draw each connection once
      if (city < connectedCity) {
        drawConnection(city, connectedCity);
      }
    }
  }

  // Draw cities
  for (const city in cities) {
    drawCity(city);
  }

  // Reset algorithm state
  resetAlgorithmState();
}

// Draw a city node
function drawCity(city) {
  const container = document.getElementById("map-container");
  const cityData = cities[city];

  const node = document.createElement("div");
  node.className = "city-node";
  node.id = `node-${city}`;
  node.style.left = `calc(${cityData.x}% - 20px)`;
  node.style.top = `calc(${cityData.y}% - 20px)`;
  node.textContent = city.substring(0, 3);
  node.title = city;

  // Add city label
  const label = document.createElement("div");
  label.className = "city-label";
  label.textContent = city;
  label.style.left = `calc(${cityData.x}% + 25px)`;
  label.style.top = `calc(${cityData.y}% - 10px)`;

  container.appendChild(node);
  container.appendChild(label);
}

// Draw a connection between two cities
function drawConnection(city1, city2) {
  const container = document.getElementById("map-container");
  const city1Data = cities[city1];
  const city2Data = cities[city2];

  // Calculate distance and angle
  const dx = city2Data.x - city1Data.x;
  const dy = city2Data.y - city1Data.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

  const connection = document.createElement("div");
  connection.className = "city-connection";
  connection.id = `conn-${city1}-${city2}`;
  connection.style.left = `calc(${city1Data.x}% - 1.5px)`;
  connection.style.top = `calc(${city1Data.y}% - 1.5px)`;
  connection.style.width = `${distance}%`;
  connection.style.transform = `rotate(${angle}deg)`;

  container.appendChild(connection);
}

// Select an algorithm
function selectAlgorithm(algorithm) {
  selectedAlgorithm = algorithm;

  // Update UI
  document.querySelectorAll(".algorithm-card").forEach((card) => {
    card.classList.remove("selected");
  });
  document.getElementById(`${algorithm}-card`).classList.add("selected");

  // Update visualization title
  document.getElementById("viz-title").textContent = `${getAlgorithmFullName(
    algorithm
  )} Visualization`;

  // Show/hide city selector based on algorithm
  const citySelector = document.getElementById("city-selector");
  if (algorithm === "dijkstra") {
    citySelector.style.display = "flex";
  } else {
    citySelector.style.display = "none";
  }

  // Reset visualization
  resetVisualization();

  // Update results placeholder
  document.getElementById(
    "results-content"
  ).textContent = `${getAlgorithmFullName(
    algorithm
  )} selected. Click "Run Algorithm" to see results.`;
}

// Get full algorithm name
function getAlgorithmFullName(algorithm) {
  switch (algorithm) {
    case "dfs":
      return "DFS Traversal";
    case "prims":
      return "Prim's MST";
    case "dijkstra":
      return "Dijkstra's Path";
    default:
      return "Algorithm";
  }
}

// Run the selected algorithm
function runAlgorithm() {
  if (!selectedAlgorithm) {
    alert("Please select an algorithm first.");
    return;
  }

  resetAlgorithmState();

  switch (selectedAlgorithm) {
    case "dfs":
      runDFS();
      break;
    case "prims":
      runPrims();
      break;
    case "dijkstra":
      runDijkstra();
      break;
  }

  // Display first step
  displayStep(0);
}

// Step through the algorithm
function stepAlgorithm() {
  if (algorithmSteps.length === 0) {
    alert("Please run an algorithm first.");
    return;
  }

  currentStep = (currentStep + 1) % algorithmSteps.length;
  displayStep(currentStep);
}

// Display a specific step of the algorithm
function displayStep(stepIndex) {
  if (stepIndex < 0 || stepIndex >= algorithmSteps.length) return;

  currentStep = stepIndex;
  const step = algorithmSteps[stepIndex];

  // Update visualization based on step
  highlightNodes(step.visited || []);
  if (step.path) highlightPath(step.path);
  if (step.mst) highlightMST(step.mst);

  // Update steps display
  const stepsContainer = document.getElementById("algorithm-steps");
  stepsContainer.innerHTML = "";

  algorithmSteps.forEach((s, i) => {
    const stepElement = document.createElement("div");
    stepElement.className = `step ${i === stepIndex ? "current-step" : ""}`;
    stepElement.textContent = `${i + 1}. ${s.description}`;
    stepsContainer.appendChild(stepElement);
  });

  // Update results
  if (step.result) {
    document.getElementById("results-content").textContent = step.result;
  }

  // Auto-scroll to current step
  stepsContainer.scrollTop = stepsContainer.scrollHeight;
}

// Highlight visited nodes
function highlightNodes(nodes) {
  // Reset all nodes
  document.querySelectorAll(".city-node").forEach((node) => {
    node.style.background = "#1a237e";
  });

  // Highlight visited nodes
  nodes.forEach((node) => {
    const nodeElement = document.getElementById(`node-${node}`);
    if (nodeElement) {
      nodeElement.style.background = "#4caf50";
    }
  });
}

// Highlight a path
function highlightPath(path) {
  // Reset all connections
  document.querySelectorAll(".city-connection").forEach((conn) => {
    conn.style.background = "#5c6bc0";
    conn.style.height = "3px";
  });

  // Highlight path connections
  for (let i = 0; i < path.length - 1; i++) {
    const conn1 = document.getElementById(`conn-${path[i]}-${path[i + 1]}`);
    const conn2 = document.getElementById(`conn-${path[i + 1]}-${path[i]}`);

    if (conn1) {
      conn1.style.background = "#ff9800";
      conn1.style.height = "5px";
    }
    if (conn2) {
      conn2.style.background = "#ff9800";
      conn2.style.height = "5px";
    }
  }
}

// Highlight MST edges
function highlightMST(mstEdges) {
  // Reset all connections
  document.querySelectorAll(".city-connection").forEach((conn) => {
    conn.style.background = "#5c6bc0";
    conn.style.height = "3px";
  });

  // Highlight MST edges
  mstEdges.forEach((edge) => {
    const conn = document.getElementById(`conn-${edge[0]}-${edge[1]}`);
    if (conn) {
      conn.style.background = "#4caf50";
      conn.style.height = "5px";
    }
  });
}

// Reset visualization
function resetVisualization() {
  initializeVisualization();
  resetAlgorithmState();
  document.getElementById("results-content").textContent = selectedAlgorithm
    ? `${getAlgorithmFullName(
        selectedAlgorithm
      )} selected. Click "Run Algorithm" to see results.`
    : "Select an algorithm and run it to see results here.";
}

// Reset algorithm state
function resetAlgorithmState() {
  currentStep = 0;
  algorithmSteps = [];
  visitedNodes.clear();
  currentPath = [];
  mstEdges = [];
  shortestPath = [];

  const stepsContainer = document.getElementById("algorithm-steps");
  stepsContainer.innerHTML = "";

  // Reset all visual elements
  document.querySelectorAll(".city-node").forEach((node) => {
    node.style.background = "#1a237e";
  });

  document.querySelectorAll(".city-connection").forEach((conn) => {
    conn.style.background = "#5c6bc0";
    conn.style.height = "3px";
  });
}

// DFS Algorithm
function runDFS() {
  const startCity = "Chennai"; // Default start city
  algorithmSteps = [];
  visitedNodes.clear();

  algorithmSteps.push({
    description: `Starting DFS from ${startCity}`,
    visited: [startCity],
  });

  const stack = [startCity];
  visitedNodes.add(startCity);

  while (stack.length > 0) {
    const current = stack.pop();

    algorithmSteps.push({
      description: `Visiting ${current}`,
      visited: Array.from(visitedNodes),
      path: [current],
    });

    for (const neighbor in cities[current].connections) {
      if (!visitedNodes.has(neighbor)) {
        visitedNodes.add(neighbor);
        stack.push(neighbor);

        algorithmSteps.push({
          description: `Moving from ${current} to ${neighbor}`,
          visited: Array.from(visitedNodes),
          path: [current, neighbor],
        });
      }
    }
  }

  algorithmSteps.push({
    description: "DFS traversal complete",
    visited: Array.from(visitedNodes),
    result: `DFS visited ${visitedNodes.size} cities: ${Array.from(
      visitedNodes
    ).join(", ")}`,
  });
}

// Prim's MST Algorithm
function runPrims() {
  algorithmSteps = [];
  mstEdges = [];
  visitedNodes.clear();
  const inMST = new Set();

  // Start with first city
  const startCity = Object.keys(cities)[0];
  inMST.add(startCity);

  algorithmSteps.push({
    description: `Starting Prim's MST from ${startCity}`,
    mst: [...mstEdges],
    visited: Array.from(inMST),
  });

  while (inMST.size < Object.keys(cities).length) {
    let minEdge = null;
    let minWeight = Infinity;

    // Find minimum weight edge connecting MST to non-MST vertex
    for (const city of inMST) {
      for (const neighbor in cities[city].connections) {
        if (!inMST.has(neighbor)) {
          const weight = cities[city].connections[neighbor];
          if (weight < minWeight) {
            minWeight = weight;
            minEdge = [city, neighbor];
          }
        }
      }
    }

    if (minEdge) {
      mstEdges.push(minEdge);
      inMST.add(minEdge[1]);

      algorithmSteps.push({
        description: `Adding edge ${minEdge[0]} - ${minEdge[1]} (weight: ${minWeight}) to MST`,
        mst: [...mstEdges],
        visited: Array.from(inMST),
      });
    } else {
      break; // No more edges to add
    }
  }

  // Calculate total weight
  let totalWeight = 0;
  mstEdges.forEach((edge) => {
    totalWeight += cities[edge[0]].connections[edge[1]];
  });

  algorithmSteps.push({
    description: "Prim's MST complete",
    mst: [...mstEdges],
    result: `MST has ${mstEdges.length} edges with total weight ${totalWeight}`,
  });
}

// Dijkstra's Algorithm
function runDijkstra() {
  const startCity = document.getElementById("start-city").value;
  const endCity = document.getElementById("end-city").value;

  if (startCity === endCity) {
    alert("Please select different start and end cities.");
    return;
  }

  algorithmSteps = [];
  visitedNodes.clear();
  const distances = {};
  const previous = {};
  const unvisited = new Set(Object.keys(cities));

  // Initialize distances
  for (const city in cities) {
    distances[city] = city === startCity ? 0 : Infinity;
    previous[city] = null;
  }

  algorithmSteps.push({
    description: `Starting Dijkstra from ${startCity} to ${endCity}`,
    visited: [startCity],
    result: `Finding shortest path from ${startCity} to ${endCity}`,
  });

  while (unvisited.size > 0) {
    // Find unvisited node with smallest distance
    let current = null;
    for (const city of unvisited) {
      if (current === null || distances[city] < distances[current]) {
        current = city;
      }
    }

    if (current === null || distances[current] === Infinity) break;

    unvisited.delete(current);
    visitedNodes.add(current);

    algorithmSteps.push({
      description: `Visiting ${current} (distance: ${distances[current]})`,
      visited: Array.from(visitedNodes),
      path: [current],
    });

    // Stop if we reached the destination
    if (current === endCity) break;

    // Update distances to neighbors
    for (const neighbor in cities[current].connections) {
      if (unvisited.has(neighbor)) {
        const alt = distances[current] + cities[current].connections[neighbor];
        if (alt < distances[neighbor]) {
          distances[neighbor] = alt;
          previous[neighbor] = current;

          algorithmSteps.push({
            description: `Updating distance to ${neighbor} to ${alt} via ${current}`,
            visited: Array.from(visitedNodes),
          });
        }
      }
    }
  }

  // Reconstruct path
  const path = [];
  let current = endCity;
  while (current !== null) {
    path.unshift(current);
    current = previous[current];
  }

  // Check if path was found
  if (path.length === 1 && path[0] === endCity && startCity !== endCity) {
    algorithmSteps.push({
      description: "No path found between selected cities",
      visited: Array.from(visitedNodes),
      result: `No path found from ${startCity} to ${endCity}`,
    });
  } else {
    algorithmSteps.push({
      description: `Shortest path found: ${path.join(" → ")}`,
      visited: Array.from(visitedNodes),
      path: path,
      result: `Shortest path from ${startCity} to ${endCity}: ${path.join(
        " → "
      )} (Total distance: ${distances[endCity]})`,
    });
  }
}

// Initialize the page
window.onload = function () {
  initializeVisualization();
};
