document.addEventListener('DOMContentLoaded', () => {
    const cubeElement = document.getElementById('cube');
    const colorOptions = document.querySelectorAll('.color-option');
    const tiles = document.querySelectorAll('.tile');
    const solveBtn = document.getElementById('solve-btn');
    const resetBtn = document.getElementById('reset-btn');
    const scrambleBtn = document.getElementById('scramble-btn');
    const playBtn = document.getElementById('play-btn');
    const rotationBtns = document.querySelectorAll('.rotation-btn');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const solvingStatus = document.getElementById('solving-status');
    const scrambleMovesContainer = document.getElementById('scramble-moves-container');
    const solutionMovesContainer = document.getElementById('solution-moves-container');

    let currentColor = 'white';
    let currentRotationX = -20;
    let currentRotationY = -30;
    let currentRotationZ = 0;
    let isSolving = false;
    let animationTimeout = null;
    let scrambleHistory = [];
    let solutionHistory = [];
    let cubeModified = false;

    const defaultColors = {
        front: Array(9).fill('red'),
        back: Array(9).fill('green'),
        right: Array(9).fill('blue'),
        left: Array(9).fill('orange'),
        top: Array(9).fill('white'),
        bottom: Array(9).fill('yellow')
    };
    
    let cubeState = JSON.parse(JSON.stringify(defaultColors));

    // Initialize UI
    function initializeUI() {
        // Set initial colors
        tiles.forEach(tile => {
            const face = tile.parentElement.dataset.face;
            const pos = parseInt(tile.dataset.pos);
            tile.style.backgroundColor = cubeState[face][pos];
        });
        
        // Set initial rotation
        updateCubeRotation();
        
        // Disable solve and play buttons initially
        solveBtn.disabled = true;
        playBtn.disabled = true;
    }

    // Color selection
    colorOptions.forEach(option => {
        option.addEventListener('click', () => {
            currentColor = option.dataset.color;
            colorOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
        });
    });

    // Tile coloring
    tiles.forEach(tile => {
        tile.addEventListener('click', () => {
            if (isSolving) return;
            
            const face = tile.parentElement.dataset.face;
            const pos = parseInt(tile.dataset.pos);
            tile.style.backgroundColor = currentColor;
            cubeState[face][pos] = currentColor;
            
            // Mark cube as modified and update button states
            cubeModified = true;
            updateButtonStates();
        });
    });

    // Rotation controls
    rotationBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (isSolving) return;
            
            const rotation = btn.dataset.rotate;
            
            switch (rotation) {
                case 'x': currentRotationX += 20; break;
                case 'x-': currentRotationX -= 20; break;
                case 'y': currentRotationY += 20; break;
                case 'y-': currentRotationY -= 20; break;
                case 'z': currentRotationZ += 20; break;
                case 'z-': currentRotationZ -= 20; break;
            }
            
            updateCubeRotation();
        });
    });

    function updateCubeRotation() {
        cubeElement.style.transform = `
            rotateX(${currentRotationX}deg)
            rotateY(${currentRotationY}deg)
            rotateZ(${currentRotationZ}deg)
        `;
    }

    // Update button states based on cube state
    function updateButtonStates() {
        if (cubeModified) {
            // If cube was modified manually
            scrambleBtn.disabled = false;
            solveBtn.disabled = false;
            playBtn.disabled = true; // Disable play until new solution generated
        } else {
            // If cube is in original or scrambled state
            scrambleBtn.disabled = isSolving;
            solveBtn.disabled = isSolving || scrambleHistory.length === 0;
            playBtn.disabled = isSolving || solutionHistory.length === 0;
        }
        resetBtn.disabled = isSolving;
    }

    // Scramble button handler
    scrambleBtn.addEventListener('click', async () => {
        if (isSolving) return;
        
        try {
            isSolving = true;
            cubeModified = false;
            updateButtonStates();
            solvingStatus.style.display = 'block';
            solvingStatus.textContent = 'Generating scramble...';

            // Reset cube first
            resetCubeToSolvedState();

            // Get scramble moves from backend (simulated here)
            scrambleHistory = await getScrambleFromBackend();
            
            // Display scramble moves
            displayMoves(scrambleHistory, 'scramble');
            
            // Apply scramble moves
            solvingStatus.textContent = 'Applying scramble...';
            await animateMoves(scrambleHistory, false);
            
            solvingStatus.textContent = 'Scramble complete!';
        } catch (error) {
            console.error('Scramble error:', error);
            solvingStatus.textContent = `Error: ${error.message}`;
        } finally {
            isSolving = false;
            updateButtonStates();
        }
    });

    // Solve button handler - generates solution
    solveBtn.addEventListener('click', async () => {
        if (isSolving) return;
        
        try {
            isSolving = true;
            updateButtonStates();
            solvingStatus.style.display = 'block';
            
            solvingStatus.textContent = 'Generating solution...';
            
            // Generate solution (reverse of scramble with inverted moves)
            solutionHistory = invertMoves(scrambleHistory);
            
            // Display solution moves
            displayMoves(solutionHistory, 'solution');
            
            solvingStatus.textContent = 'Solution ready! Click Play Solution';
        } catch (error) {
            console.error('Solution error:', error);
            solvingStatus.textContent = `Error: ${error.message}`;
        } finally {
            isSolving = false;
            cubeModified = false;
            updateButtonStates();
        }
    });

    // Play button handler - animates the solution
    playBtn.addEventListener('click', async () => {
        if (isSolving || solutionHistory.length === 0) return;
        
        try {
            isSolving = true;
            updateButtonStates();
            solvingStatus.style.display = 'block';
            
            solvingStatus.textContent = 'Animating solution...';
            await animateMoves(solutionHistory, true);
            
            // Verify solution
            if (!verifySolvedState()) {
                solvingStatus.textContent = 'Solution incomplete!';
                resetCubeToSolvedState();
            } else {
                solvingStatus.textContent = 'Cube solved!';
            }
        } catch (error) {
            console.error('Animation error:', error);
            solvingStatus.textContent = `Error: ${error.message}`;
            resetCubeToSolvedState();
        } finally {
            isSolving = false;
            updateButtonStates();
        }
    });

    // Reset button handler
    resetBtn.addEventListener('click', () => {
        if (isSolving) {
            clearTimeout(animationTimeout);
            isSolving = false;
        }
        resetCubeToSolvedState();
        progressContainer.style.display = 'none';
        solvingStatus.style.display = 'none';
        scrambleHistory = [];
        solutionHistory = [];
        cubeModified = false;
        scrambleMovesContainer.innerHTML = '<h3>Scramble Moves</h3>';
        solutionMovesContainer.innerHTML = '<h3>Solution Moves</h3>';
        updateButtonStates();
    });

    function resetCubeToSolvedState() {
        cubeState = JSON.parse(JSON.stringify(defaultColors));
        updateCubeVisuals();
        currentRotationX = -20;
        currentRotationY = -30;
        currentRotationZ = 0;
        updateCubeRotation();
    }

    function updateCubeVisuals() {
        tiles.forEach(tile => {
            const face = tile.parentElement.dataset.face;
            const pos = parseInt(tile.dataset.pos);
            tile.style.backgroundColor = cubeState[face][pos];
        });
    }

    // Backend simulation - replace with actual API call
    async function getScrambleFromBackend() {
        const faces = ['U', 'D', 'F', 'B', 'R', 'L'];
        const modifiers = ['', "'", '2'];
        const scrambleLength = 5;
        
        return new Array(scrambleLength).fill().map(() => {
            const face = faces[Math.floor(Math.random() * faces.length)];
            const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
            return face + modifier;
        });
    }

    // Properly invert moves (including handling double moves)
    function invertMoves(moves) {
        return moves.slice().reverse().map(move => {
            if (move.includes("2")) return move; // D2 remains D2
            if (move.includes("'")) return move.replace("'", ""); // F' becomes F
            return move + "'"; // R becomes R'
        });
    }

    function verifySolvedState() {
        for (const face in defaultColors) {
            const expectedColor = defaultColors[face][0];
            for (let i = 0; i < 9; i++) {
                if (cubeState[face][i] !== expectedColor) return false;
            }
        }
        return true;
    }

    function displayMoves(moves, type) {
        const container = type === 'scramble' ? scrambleMovesContainer : solutionMovesContainer;
        const title = type === 'scramble' ? 'Scramble Moves' : 'Solution Moves';
        
        container.innerHTML = `<h3>${title}</h3>`;
        
        if (moves.length === 0) {
            container.innerHTML += '<p>No moves</p>';
            return;
        }
        
        const movesList = document.createElement('div');
        movesList.className = 'moves-list';
        
        moves.forEach((move, index) => {
            const moveElement = document.createElement('div');
            moveElement.className = 'move-chip';
            if (type === 'solution') {
                moveElement.dataset.moveIndex = index;
            }
            moveElement.innerHTML = `
                <span class="move-number">${index + 1}.</span>
                <span class="move-symbol">${move}</span>
                <span class="move-arrow">${getMoveArrow(move)}</span>
                <span class="move-desc">${getMoveDescription(move)}</span>
            `;
            movesList.appendChild(moveElement);
        });
        
        container.appendChild(movesList);
    }

    function getMoveArrow(move) {
        if (move.includes("'")) return '↺';
        if (move.includes("2")) return '↻↻';
        return '↻';
    }

    function getMoveDescription(move) {
        const faceNames = {
            'U': 'Up', 'D': 'Down', 'F': 'Front',
            'B': 'Back', 'R': 'Right', 'L': 'Left'
        };
        const face = faceNames[move.charAt(0)];
        
        if (move.includes("'")) return `${face} counter-clockwise`;
        if (move.includes("2")) return `${face} double (180°)`;
        return `${face} clockwise`;
    }

    async function animateMoves(moves, isSolution) {
        if (moves.length === 0) return;
        
        progressContainer.style.display = 'block';
        progressBar.style.width = '0%';
        
        const moveDelay = 500;
        
        for (let i = 0; i < moves.length; i++) {
            if (!isSolving) break;
            
            const progress = ((i + 1) / moves.length) * 100;
            progressBar.style.width = `${progress}%`;
            
            if (isSolution) {
                document.querySelectorAll('.move-chip').forEach(chip => {
                    chip.classList.remove('current-step');
                    if (parseInt(chip.dataset.moveIndex) === i) {
                        chip.classList.add('current-step');
                    }
                });
            }
            
            const move = moves[i];
            const face = move.charAt(0);
            
            const faceElement = document.querySelector(`.face[data-face="${getFaceName(face)}"]`);
            if (faceElement) faceElement.classList.add('face-highlight');
            
            adjustViewForMove(face);
            await applyMoveWithAnimation(move);
            
            if (faceElement) faceElement.classList.remove('face-highlight');
            
            await new Promise(resolve => {
                animationTimeout = setTimeout(resolve, moveDelay);
            });
        }
        
        document.querySelectorAll('.move-chip').forEach(chip => {
            chip.classList.remove('current-step');
        });
    }

    function getFaceName(face) {
        const faceMap = {
            'U': 'top', 'D': 'bottom', 'F': 'front',
            'B': 'back', 'R': 'right', 'L': 'left'
        };
        return faceMap[face];
    }

    async function applyMoveWithAnimation(move) {
        return new Promise(resolve => {
            const face = move.charAt(0);
            const isClockwise = !move.includes("'");
            const isDouble = move.includes("2");
            
            applyMove(face, isClockwise);
            updateCubeVisuals();
            
            if (isDouble) {
                setTimeout(() => {
                    applyMove(face, isClockwise);
                    updateCubeVisuals();
                    setTimeout(resolve, 200);
                }, 200);
            } else {
                setTimeout(resolve, 300);
            }
        });
    }

    function applyMove(face, clockwise) {
        const newState = JSON.parse(JSON.stringify(cubeState));
        rotateFace(newState, face, clockwise);
        
        switch (face) {
            case 'U': rotateUp(newState, clockwise); break;
            case 'D': rotateDown(newState, clockwise); break;
            case 'F': rotateFront(newState, clockwise); break;
            case 'B': rotateBack(newState, clockwise); break;
            case 'R': rotateRight(newState, clockwise); break;
            case 'L': rotateLeft(newState, clockwise); break;
        }
        
        cubeState = newState;
    }

    function rotateFace(state, face, clockwise) {
        const faceName = getFaceName(face);
        const faceData = [...state[faceName]];
        
        if (clockwise) {
            state[faceName][0] = faceData[6];
            state[faceName][1] = faceData[3];
            state[faceName][2] = faceData[0];
            state[faceName][3] = faceData[7];
            state[faceName][5] = faceData[1];
            state[faceName][6] = faceData[8];
            state[faceName][7] = faceData[5];
            state[faceName][8] = faceData[2];
        } else {
            state[faceName][0] = faceData[2];
            state[faceName][1] = faceData[5];
            state[faceName][2] = faceData[8];
            state[faceName][3] = faceData[1];
            state[faceName][5] = faceData[7];
            state[faceName][6] = faceData[0];
            state[faceName][7] = faceData[3];
            state[faceName][8] = faceData[6];
        }
    }
    
    function rotateUp(state, clockwise) {
        const temp = [
            state.front[0], state.front[1], state.front[2],
            state.right[0], state.right[1], state.right[2],
            state.back[0], state.back[1], state.back[2],
            state.left[0], state.left[1], state.left[2]
        ];
        
        if (clockwise) {
            state.front[0] = temp[9];
            state.front[1] = temp[10];
            state.front[2] = temp[11];
            state.right[0] = temp[0];
            state.right[1] = temp[1];
            state.right[2] = temp[2];
            state.back[0] = temp[3];
            state.back[1] = temp[4];
            state.back[2] = temp[5];
            state.left[0] = temp[6];
            state.left[1] = temp[7];
            state.left[2] = temp[8];
        } else {
            state.front[0] = temp[3];
            state.front[1] = temp[4];
            state.front[2] = temp[5];
            state.right[0] = temp[6];
            state.right[1] = temp[7];
            state.right[2] = temp[8];
            state.back[0] = temp[9];
            state.back[1] = temp[10];
            state.back[2] = temp[11];
            state.left[0] = temp[0];
            state.left[1] = temp[1];
            state.left[2] = temp[2];
        }
    }
    
    function rotateDown(state, clockwise) {
        const temp = [
            state.front[6], state.front[7], state.front[8],
            state.right[6], state.right[7], state.right[8],
            state.back[6], state.back[7], state.back[8],
            state.left[6], state.left[7], state.left[8]
        ];
        
        if (clockwise) {
            state.front[6] = temp[3];
            state.front[7] = temp[4];
            state.front[8] = temp[5];
            state.left[6] = temp[0];
            state.left[7] = temp[1];
            state.left[8] = temp[2];
            state.back[6] = temp[9];
            state.back[7] = temp[10];
            state.back[8] = temp[11];
            state.right[6] = temp[6];
            state.right[7] = temp[7];
            state.right[8] = temp[8];
        } else {
            state.front[6] = temp[9];
            state.front[7] = temp[10];
            state.front[8] = temp[11];
            state.right[6] = temp[0];
            state.right[7] = temp[1];
            state.right[8] = temp[2];
            state.back[6] = temp[3];
            state.back[7] = temp[4];
            state.back[8] = temp[5];
            state.left[6] = temp[6];
            state.left[7] = temp[7];
            state.left[8] = temp[8];
        }
    }
    
    function rotateFront(state, clockwise) {
        const temp = [
            state.top[6], state.top[7], state.top[8],
            state.right[0], state.right[3], state.right[6],
            state.bottom[0], state.bottom[1], state.bottom[2],
            state.left[2], state.left[5], state.left[8]
        ];
        
        if (clockwise) {
            state.right[0] = temp[8];
            state.right[3] = temp[7];
            state.right[6] = temp[6];
            state.bottom[0] = temp[11];
            state.bottom[1] = temp[10];
            state.bottom[2] = temp[9];
            state.left[2] = temp[2];
            state.left[5] = temp[1];
            state.left[8] = temp[0];
            state.top[6] = temp[5];
            state.top[7] = temp[4];
            state.top[8] = temp[3];
        } else {
            state.left[2] = temp[6];
            state.left[5] = temp[7];
            state.left[8] = temp[8];
            state.bottom[0] = temp[9];
            state.bottom[1] = temp[10];
            state.bottom[2] = temp[11];
            state.right[0] = temp[2];
            state.right[3] = temp[1];
            state.right[6] = temp[0];
            state.top[6] = temp[3];
            state.top[7] = temp[4];
            state.top[8] = temp[5];
        }
    }
    
    function rotateBack(state, clockwise) {
        const temp = [
            state.top[0], state.top[1], state.top[2],
            state.left[0], state.left[3], state.left[6],
            state.bottom[6], state.bottom[7], state.bottom[8],
            state.right[2], state.right[5], state.right[8]
        ];
        
        if (clockwise) {
            state.left[0] = temp[2];
            state.left[3] = temp[1];
            state.left[6] = temp[0];
            state.bottom[6] = temp[3];
            state.bottom[7] = temp[4];
            state.bottom[8] = temp[5];
            state.right[2] = temp[8];
            state.right[5] = temp[7];
            state.right[8] = temp[6];
            state.top[0] = temp[11];
            state.top[1] = temp[10];
            state.top[2] = temp[9];
        } else {
            state.right[2] = temp[0];
            state.right[5] = temp[1];
            state.right[8] = temp[2];
            state.bottom[6] = temp[11];
            state.bottom[7] = temp[10];
            state.bottom[8] = temp[9];
            state.left[0] = temp[6];
            state.left[3] = temp[7];
            state.left[6] = temp[8];
            state.top[0] = temp[5];
            state.top[1] = temp[4];
            state.top[2] = temp[3];
        }
    }
    
    function rotateRight(state, clockwise) {
        const temp = [
            state.top[2], state.top[5], state.top[8],
            state.front[2], state.front[5], state.front[8],
            state.bottom[2], state.bottom[5], state.bottom[8],
            state.back[0], state.back[3], state.back[6]
        ];
        
        if (clockwise) {
            state.front[2] = temp[0];
            state.front[5] = temp[1];
            state.front[8] = temp[2];
            state.bottom[2] = temp[3];
            state.bottom[5] = temp[4];
            state.bottom[8] = temp[5];
            state.back[0] = temp[8];
            state.back[3] = temp[7];
            state.back[6] = temp[6];
            state.top[2] = temp[11];
            state.top[5] = temp[10];
            state.top[8] = temp[9];
        } else {
            state.top[2] = temp[3];
            state.top[5] = temp[4];
            state.top[8] = temp[5];
            state.back[0] = temp[2];
            state.back[3] = temp[1];
            state.back[6] = temp[0];
            state.bottom[2] = temp[9];
            state.bottom[5] = temp[10];
            state.bottom[8] = temp[11];
            state.front[2] = temp[6];
            state.front[5] = temp[7];
            state.front[8] = temp[8];
        }
    }
    
    function rotateLeft(state, clockwise) {
        const temp = [
            state.top[0], state.top[3], state.top[6],
            state.front[0], state.front[3], state.front[6],
            state.bottom[0], state.bottom[3], state.bottom[6],
            state.back[2], state.back[5], state.back[8]
        ];
        
        if (clockwise) {
            state.top[0] = temp[3];
            state.top[3] = temp[4];
            state.top[6] = temp[5];
            state.back[2] = temp[6];
            state.back[5] = temp[3];
            state.back[8] = temp[0];
            state.bottom[0] = temp[11];
            state.bottom[3] = temp[10];
            state.bottom[6] = temp[9];
            state.front[0] = temp[6];
            state.front[3] = temp[7];
            state.front[6] = temp[8];
        } else {
            state.front[0] = temp[0];
            state.front[3] = temp[1];
            state.front[6] = temp[2];
            state.bottom[0] = temp[3];
            state.bottom[3] = temp[4];
            state.bottom[6] = temp[5];
            state.back[2] = temp[8];
            state.back[5] = temp[7];
            state.back[8] = temp[6];
            state.top[0] = temp[11];
            state.top[3] = temp[10];
            state.top[6] = temp[9];
        }
    }

    function adjustViewForMove(face) {
        const viewRotations = {
            'U': { x: -55, y: -30, z: 0 },
            'D': { x: 55, y: -30, z: 0 },
            'F': { x: 0, y: -30, z: 0 },
            'B': { x: 0, y: 150, z: 0 },
            'R': { x: 0, y: 60, z: 0 },
            'L': { x: 0, y: -120, z: 0 }
        };
        
        const rotation = viewRotations[face];
        currentRotationX = rotation.x;
        currentRotationY = rotation.y;
        currentRotationZ = rotation.z;
        updateCubeRotation();
    }

    // Initialize the UI
    initializeUI();
});