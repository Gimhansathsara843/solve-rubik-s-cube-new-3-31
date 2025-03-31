document.addEventListener('DOMContentLoaded', () => {
    const cube = document.getElementById('manual-cube');
    const moveHistoryElement = document.getElementById('move-history');
    const solutionStepsElement = document.getElementById('solution-steps');
    const progressBar = document.getElementById('progress-bar');
    const solvingStatus = document.getElementById('solving-status');
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    document.querySelector('.container').appendChild(errorMessage);
    
    let history = [];
    let currentRotation = { x: -20, y: -30, z: 0 };
    let selectedColor = 'white';
    let cubeState = {};
    const faceNames = ['front', 'back', 'right', 'left', 'top', 'bottom'];
    
    // Initialize the cube
    initializeCube();
    
    // Set up event listeners
    initControls();
    
    function initializeCube() {
        // Initialize default colors
        const defaultColors = {
            'front': 'red',
            'back': 'green',
            'right': 'blue',
            'left': 'orange',
            'top': 'white',
            'bottom': 'yellow'
        };
        
        // Set initial rotation
        updateCubeRotation();
        
        // Initialize cube state
        document.querySelectorAll('.face').forEach(face => {
            const faceName = face.dataset.face;
            const tiles = face.querySelectorAll('.tile');
            
            tiles.forEach((tile, index) => {
                tile.style.backgroundColor = defaultColors[faceName];
                if (!cubeState[faceName]) cubeState[faceName] = [];
                cubeState[faceName][index] = defaultColors[faceName];
            });
        });
    }
    
    function initControls() {
        // Color selection
        const colorOptions = document.querySelectorAll('.color-option');
        colorOptions.forEach(option => {
            option.addEventListener('click', () => {
                colorOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                selectedColor = option.dataset.color;
            });
        });
        
        // Select white color by default
        const whiteOption = document.querySelector('.color-option[data-color="white"]');
        if (whiteOption) {
            whiteOption.classList.add('selected');
        }
        
        // Tile coloring
        document.querySelectorAll('.tile').forEach(tile => {
            tile.addEventListener('click', () => {
                tile.style.backgroundColor = selectedColor;
                updateCubeState();
            });
        });
        
        // Face rotation buttons
        document.querySelectorAll('.move-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const move = btn.dataset.move;
                rotateFace(move);
                addToHistory(move);
            });
        });
        
        // View rotation buttons
        document.querySelectorAll('.rotation-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const axis = btn.dataset.rotate.replace('-', '');
                const direction = btn.dataset.rotate.includes('-') ? -90 : 90;
                
                if (axis === 'x') currentRotation.x += direction;
                if (axis === 'y') currentRotation.y += direction;
                if (axis === 'z') currentRotation.z += direction;
                
                updateCubeRotation();
            });
        });
        
        // Solve button
        document.getElementById('solve-btn').addEventListener('click', async () => {
            await solveCube();
        });
        
        // Reset button
        document.getElementById('reset-btn').addEventListener('click', resetCube);
        
        // Back button
        document.getElementById('back-btn').addEventListener('click', () => {
            window.location.href = 'index.html';
        });
        
        // Undo button
        document.getElementById('undo-btn').addEventListener('click', undoLastMove);
        
        // Reset view button
        document.getElementById('reset-view-btn').addEventListener('click', resetView);
    }
    
    // ... rest of your existing functions remain the same ...
    function rotateFace(move) {
        const face = move.charAt(0);
        const faceElement = document.querySelector(`.face[data-face="${face.toLowerCase()}"]`);
        const degrees = getRotationDegrees(move);
        
        // Animate the rotation
        faceElement.style.transition = 'transform 0.5s ease';
        faceElement.style.transform = `rotate${getRotationAxis(face)}(${degrees}deg)`;
        
        // After animation completes, update the cube state
        setTimeout(() => {
            updateCubeStateAfterMove(move);
            faceElement.style.transition = 'none';
            faceElement.style.transform = '';
        }, 500);
    }
    
    function getRotationDegrees(move) {
        if (move.includes("'")) return -90;
        if (move.includes("2")) return 180;
        return 90;
    }
    
    function getRotationAxis(face) {
        if (face === 'F' || face === 'B') return 'Y';
        if (face === 'R' || face === 'L') return 'X';
        return 'Z';
    }
    
    function updateCubeStateAfterMove(move) {
        // Implement actual cube state update after rotation
        updateCubeState();
    }
    
    function updateCubeState() {
        console.log("Updating cube state...");
        document.querySelectorAll('.face').forEach(face => {
            const faceName = face.dataset.face;
            const tiles = face.querySelectorAll('.tile');
            
            tiles.forEach((tile, index) => {
                const color = getComputedStyle(tile).backgroundColor;
                const colorName = rgbToColorName(color);
                console.log(`Face ${faceName}, tile ${index}: ${color} -> ${colorName}`);
                cubeState[faceName][index] = colorName;
            });
        });
        
        // Log the complete state for verification
        console.log("Current cube state:", JSON.stringify(cubeState, null, 2));
    }
    
    function rgbToColorName(rgb) {
        // Normalize the RGB string to handle different browser formats
        const normalizedRGB = rgb.replace(/\s/g, '').toLowerCase();
        
        // Map of color RGB values to color names
        const colorMap = {
            'rgb(255,255,255)': 'white',
            'rgb(255,0,0)': 'red',
            'rgb(0,0,255)': 'blue',
            'rgb(0,128,0)': 'green',
            'rgb(255,165,0)': 'orange',
            'rgb(255,255,0)': 'yellow'
        };
        
        // Try exact match first
        if (colorMap[normalizedRGB]) {
            return colorMap[normalizedRGB];
        }
        
        // Fallback to approximate color matching if needed
        const match = normalizedRGB.match(/rgb\((\d+),(\d+),(\d+)\)/);
        if (match) {
            const [r, g, b] = [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
            
            // Simple color distance calculation
            const colors = {
                white: { r: 255, g: 255, b: 255 },
                red: { r: 255, g: 0, b: 0 },
                blue: { r: 0, g: 0, b: 255 },
                green: { r: 0, g: 128, b: 0 },
                orange: { r: 255, g: 165, b: 0 },
                yellow: { r: 255, g: 255, b: 0 }
            };
            
            let closestColor = 'white';
            let minDistance = Infinity;
            
            for (const [colorName, colorValues] of Object.entries(colors)) {
                const distance = Math.sqrt(
                    Math.pow(r - colorValues.r, 2) +
                    Math.pow(g - colorValues.g, 2) +
                    Math.pow(b - colorValues.b, 2)
                );
                
                if (distance < minDistance) {
                    minDistance = distance;
                    closestColor = colorName;
                }
            }
            
            return closestColor;
        }
        
        return rgb; // fallback to raw value if we can't parse
    }
    
    function addToHistory(move) {
        history.push(move);
        updateHistoryDisplay();
    }
    
    function updateHistoryDisplay() {
        moveHistoryElement.innerHTML = history.map((move, index) => 
            `<span class="history-move">${index + 1}. ${move}</span>`
        ).join(' ');
    }
    
    function undoLastMove() {
        if (history.length > 0) {
            const lastMove = history.pop();
            const inverseMove = getInverseMove(lastMove);
            rotateFace(inverseMove);
            updateHistoryDisplay();
        }
    }
    
    function getInverseMove(move) {
        if (move.endsWith("'")) return move.replace("'", "");
        if (move.endsWith("2")) return move;
        return move + "'";
    }
    
    function updateCubeRotation() {
        cube.style.transform = `
            rotateX(${currentRotation.x}deg)
            rotateY(${currentRotation.y}deg)
            rotateZ(${currentRotation.z}deg)
        `;
    }
    
    function resetView() {
        currentRotation = { x: -20, y: -30, z: 0 };
        updateCubeRotation();
    }
    
    function resetCube() {
        // Reset to initial state
        initializeCube();
        
        // Clear history
        history = [];
        updateHistoryDisplay();
        
        // Clear solution and errors
        solutionStepsElement.innerHTML = '';
        errorMessage.textContent = '';
        errorMessage.style.display = 'none';
        progressBar.style.width = '0%';
        solvingStatus.style.display = 'none';
    }
    
    async function solveCube() {
        // Clear previous results
        solutionStepsElement.innerHTML = '';
        errorMessage.textContent = '';
        errorMessage.style.display = 'none';
        
        // Show solving UI
        solvingStatus.style.display = 'block';
        solvingStatus.textContent = 'Validating cube...';
        document.getElementById('progress-container').style.display = 'block';
        progressBar.style.width = '10%';
        
        // Get current cube state in API format
        const cubeStateForAPI = faceNames.map(face => {
            return cubeState[face];
        });
        
        try {
            // First validate locally
            const validation = validateCubeState(cubeStateForAPI);
            if (!validation.valid) {
                showError(validation.message);
                solvingStatus.textContent = 'Validation failed';
                progressBar.style.width = '0%';
                return;
            }
            
            progressBar.style.width = '30%';
            solvingStatus.textContent = 'Solving...';
            
            // Send to API
            const response = await fetch('/api/cube/solve', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(cubeStateForAPI)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                console.log("API response:", result);
                if (result.status === "SOLVED") {
                    progressBar.style.width = '100%';
                    solvingStatus.textContent = 'Solved!';
                    displaySolution(result.solution);
                } else {
                    showError(result.error || "Solving failed");
                    solvingStatus.textContent = 'Error';
                    progressBar.style.width = '0%';
                }
            } else {
                showError(result.error || "API Error", result.details);
                solvingStatus.textContent = 'Error';
                progressBar.style.width = '0%';
            }
        } catch (error) {
            showError("Network error", error.message);
            solvingStatus.textContent = 'Error';
            progressBar.style.width = '0%';
        }
    }
    
    function validateCubeState(cubeState) {
        // Check all tiles are colored
        for (let face of cubeState) {
            if (face.some(color => !color || color === 'undefined')) {
                return { valid: false, message: "Error: Some tiles are not colored!" };
            }
        }
        
        // Check center colors are unique
        const centers = cubeState.map(face => face[4]);
        if (new Set(centers).size !== 6) {
            return { valid: false, message: "Error: Center colors must be unique!" };
        }
        
        // Check color counts (9 of each)
        const colorCounts = {};
        cubeState.forEach(face => {
            face.forEach(color => {
                // Normalize the color name
                const normalizedColor = color.toLowerCase().trim();
                colorCounts[normalizedColor] = (colorCounts[normalizedColor] || 0) + 1;
            });
        });
        
        const expectedColors = ['white', 'red', 'blue', 'green', 'orange', 'yellow'];
        const colorErrors = [];
        
        for (let color of expectedColors) {
            if (colorCounts[color] !== 9) {
                colorErrors.push(`${color}: ${colorCounts[color] || 0}`);
            }
        }
        
        if (colorErrors.length > 0) {
            return { 
                valid: false, 
                message: `Color count errors:\n${colorErrors.join('\n')}`
            };
        }
        
        return { valid: true, message: "Cube is valid!" };
    }
    
    function displaySolution(steps) {
        solutionStepsElement.innerHTML = '';
        if (steps && steps.length > 0) {
            steps.forEach((step, index) => {
                const stepElement = document.createElement('div');
                stepElement.className = 'solution-step';
                stepElement.textContent = `${index + 1}. ${step}`;
                solutionStepsElement.appendChild(stepElement);
            });
        } else {
            solutionStepsElement.textContent = 'Cube is already solved!';
        }
    }
    
    function showError(message, details = '') {
        errorMessage.textContent = `${message} ${details}`;
        errorMessage.style.display = 'block';
    }
});