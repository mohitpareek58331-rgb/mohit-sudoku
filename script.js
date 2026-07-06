// =========================================================================
// 1. GRID GENERATION & CLEANUP
// =========================================================================
const container = document.getElementById('grid-container');

// Clear out any existing inputs before generating a new grid (prevents duplication)
container.innerHTML = ""; 

for (let i = 0; i < 81; i++) {
    const input = document.createElement('input');
    input.type = 'text';
    input.maxLength = 1;
    input.className = 'cell';
    
    // Strict Input: Only allow numbers 1-9
    input.oninput = function() { 
        this.value = this.value.replace(/[^1-9]/g, ''); 
    };
    
    container.appendChild(input);
}

// =========================================================================
// 2. QUALITY OF LIFE: ARROW NAVIGATION & AUTO-FORWARD
// =========================================================================

// Move between boxes smoothly using your keyboard arrow keys
container.addEventListener('keydown', function(e) {
    const active = document.activeElement;
    if (active && active.classList.contains('cell')) {
        const inputs = Array.from(document.querySelectorAll('.cell'));
        const index = inputs.indexOf(active);
        
        if (e.key === 'ArrowRight' && index < 80) inputs[index + 1].focus();
        if (e.key === 'ArrowLeft' && index > 0) inputs[index - 1].focus();
        if (e.key === 'ArrowDown' && index < 72) inputs[index + 9].focus();
        if (e.key === 'ArrowUp' && index > 8) inputs[index - 9].focus();
    }
});

// Automatically jump to the next box right after typing a number
container.addEventListener('input', function(e) {
    const active = document.activeElement;
    if (active && active.value.length === 1) {
        const inputs = Array.from(document.querySelectorAll('.cell'));
        const index = inputs.indexOf(active);
        if (index < 80) inputs[index + 1].focus();
    }
});

// =========================================================================
// 3. PRESET PUZZLES (FOR EASY TESTING)
// =========================================================================
const presets = {
    easy: [
        5,3,0, 0,7,0, 0,0,0,
        6,0,0, 1,9,5, 0,0,0,
        0,9,8, 0,0,0, 0,6,0,
        8,0,0, 0,6,0, 0,0,3,
        4,0,0, 8,0,3, 0,0,1,
        7,0,0, 0,2,0, 0,0,6,
        0,6,0, 0,0,0, 2,8,0,
        0,0,0, 4,1,9, 0,0,5,
        0,0,0, 0,8,0, 0,7,9
    ],
    hard: [
        0,0,0, 0,0,0, 0,0,0,
        0,0,0, 0,0,3, 0,8,5,
        0,0,1, 0,2,0, 0,0,0,
        0,0,0, 5,0,7, 0,0,0,
        0,0,4, 0,0,0, 1,0,0,
        0,9,0, 0,0,0, 0,0,0,
        5,0,0, 0,0,0, 0,7,3,
        0,0,2, 0,1,0, 0,0,0,
        0,0,0, 0,4,0, 0,0,9
    ]
};

function loadPreset(difficulty) {
    clearGrid();
    const inputs = document.querySelectorAll('.cell');
    const puzzle = presets[difficulty];
    
    for (let i = 0; i < 81; i++) {
        if (puzzle[i] !== 0) {
            inputs[i].value = puzzle[i];
        }
    }
}

// =========================================================================
// 4. CORE ENGINE & UI CONTROLS
// =========================================================================

// Main controller to pull puzzle from UI, solve it, and display answers
function solveGame() {
    let board = getBoardFromUI();
    
    if (solveSudoku(board)) {
        updateUI(board);
    } else {
        alert("❌ This Sudoku is impossible to solve! Check your inputs or logic constraints.");
    }
}

// Scrape the visual HTML grid inputs and map them into a 2D Array Matrix
function getBoardFromUI() {
    const inputs = document.querySelectorAll('.cell');
    let board = [];
    for (let r = 0; r < 9; r++) {
        let row = [];
        for (let c = 0; c < 9; c++) {
            let val = inputs[r * 9 + c].value;
            row.push(val === "" ? 0 : parseInt(val));
        }
        board.push(row);
    }
    return board;
}

// Print the solved array solution values back to the user screen
function updateUI(board) {
    const inputs = document.querySelectorAll('.cell');
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            let index = r * 9 + c;
            if (inputs[index].value === "") {
                inputs[index].value = board[r][c];
                inputs[index].classList.add('ai-solved'); // Highlight answers green
            }
        }
    }
}

// Reset everything to square one
function clearGrid() {
    const inputs = document.querySelectorAll('.cell');
    inputs.forEach(input => {
        input.value = "";
        input.classList.remove('ai-solved');
    });
}

// =========================================================================
// 5. THE AI BACKTRACKING ALGORITHM (SOLVER ENGINE)
// =========================================================================
function solveSudoku(board) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === 0) { // Look for an empty box
                
                for (let num = 1; num <= 9; num++) {
                    if (isValid(board, row, col, num)) {
                        board[row][col] = num; // Speculatively try placing number

                        if (solveSudoku(board)) return true; // Recursively test paths ahead

                        board[row][col] = 0; // Backtrack / Undo choice if it hits a dead-end
                    }
                }
                return false; // Triggers previous level recursive failure
            }
        }
    }
    return true; // Entire board filled successfully
}

// Double check game laws (No repeats in row, column, or matching local 3x3 box)
function isValid(board, row, col, num) {
    for (let i = 0; i < 9; i++) {
        if (board[row][i] === num) return false; // Row collision
        if (board[i][col] === num) return false; // Column collision
        
        // Local 3x3 block check equations
        let boxRow = 3 * Math.floor(row / 3) + Math.floor(i / 3);
        let boxCol = 3 * Math.floor(col / 3) + i % 3;
        if (board[boxRow][boxCol] === num) return false;
    }
    return true;
}