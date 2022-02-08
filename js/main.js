const WALL = 'WALL';
const FLOOR = 'FLOOR';
const BURGER = 'CANDY';
const GAMER = 'GAMER';
const PLANKTON = 'PLANKTON';
const PLANKTON_IMG = '<img src="img/plankton.png">';
const GAMER_IMG = '<img src="img/bob.png">';
const BURGER_IMG = '🍔';

// Model:
var gBoard;
var gGamerPos;
var gIntervalId;
var gIntervalPlankton;
var gCountBurger = 0;
var gCollectedBurger = 0;
var gIsStuck = false;

function initGame() {
	gGamerPos = { i: 5, j: 6 };
	gBoard = buildBoard();
	randomCandy();
	randomPlankton();
	renderBoard(gBoard);
}


function buildBoard() {
	// Create the Matrix 11 * 13 
	var board = createMat(11, 13);
	// Put FLOOR everywhere and WALL at edges
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[0].length; j++) {
			var cell = { type: FLOOR, gameElement: null };
			if (i === 0 || j === 0 || i === board.length - 1 ||
				j === board[0].length - 1) {
				cell.type = WALL;
			}
			board[i][j] = cell;
		}
	}
	board[0][6].type = 'FLOOR';
	board[10][6].type = 'FLOOR';
	board[5][0].type = 'FLOOR';
	board[5][12].type = 'FLOOR';

	// Place the gamer and two balls
	board[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
	return board;
}

function randomCandy() {
	gIntervalId = setInterval(function () {
		var ranRow = getRandomInt(1, 9);
		var ranCol = getRandomInt(1, 11);
		if (isEmpty(ranRow, ranCol)) {
			gBoard[ranRow][ranCol].gameElement = BURGER;
			renderCell({ i: ranRow, j: ranCol }, BURGER_IMG);
			gCountBurger++;
		}
	}, 1000);
}

function randomPlankton() {
	gIntervalPlankton = setInterval(function () {
		var ranRow = getRandomInt(1, 9);
		var ranCol = getRandomInt(1, 11);
		if (isEmpty(ranRow, ranCol)) {
			gBoard[ranRow][ranCol].gameElement = PLANKTON;
			renderCell({ i: ranRow, j: ranCol }, PLANKTON_IMG);
			setTimeout(() => {
				if (gBoard[ranRow][ranCol].gameElement !== GAMER) {
					gBoard[ranRow][ranCol].gameElement = null;
					renderCell({ i: ranRow, j: ranCol }, null);
				}
			}, 3000);
		}
	}, 5000);
}

function isEmpty(i, j) {
	return (!gBoard[i][j].gameElement);
}

function gameOver() {
	if (gCountBurger <= gCollectedBurger) {
		clearInterval(gIntervalId);
		var elGameOver = document.querySelector('.gameOver');
		elGameOver.style.display = 'block';
		var elRestart = document.querySelector('button');
		elRestart.style.display = 'block';
	}
}

// Render the board to an HTML table
function renderBoard(board) {

	var elBoard = document.querySelector('.board');
	var strHTML = '';
	for (var i = 0; i < board.length; i++) {
		strHTML += '<tr>\n';
		for (var j = 0; j < board[0].length; j++) {
			var currCell = board[i][j];

			var cellClass = getClassName({ i: i, j: j }); // cell-i-j

			if (currCell.type === FLOOR) cellClass += ' floor';
			else if (currCell.type === WALL) cellClass += ' wall';

			strHTML += `\t<td class="cell ${cellClass}" onclick="moveTo(${i},${j})" >\n`;


			if (currCell.gameElement === GAMER) {
				strHTML += GAMER_IMG;
			} else if (currCell.gameElement === BURGER) {
				strHTML += BURGER_IMG;
			}

			strHTML += '\t</td>\n';
		}
		strHTML += '</tr>\n';
	}
	// console.log('strHTML is:');
	// console.log(strHTML);
	elBoard.innerHTML = strHTML;

}

// Move the player to a specific location
function moveTo(i, j) {
	// { type:WALL, gameElement:null }
	if (gIsStuck) return
	var targetCell = gBoard[i][j];
	if (targetCell.type === WALL) return;

	// Calculate distance to make sure we are moving to a neighbor cell
	var iAbsDiff = Math.abs(i - gGamerPos.i); // 1-2 = -1 === 1
	var jAbsDiff = Math.abs(j - gGamerPos.j);

	// If the clicked Cell is one of the four allowed
	if (iAbsDiff < 2 && jAbsDiff < 2 &&(
		(iAbsDiff === 1 && jAbsDiff === 0) || 
		(jAbsDiff === 1 && iAbsDiff === 0) || 
		(gGamerPos.i === 0) || 
		(gGamerPos.i === 10) || 
		(gGamerPos.j === 0) || 
		(gGamerPos.j === 12))) {

		if (targetCell.gameElement === BURGER) {
			gCollectedBurger++;
			var elCandy = document.querySelector('.candy');
			elCandy.innerHTML = 'krabby pattys:' + gCollectedBurger;
			var laugh = new Audio('sounds/spongebob-laugh.mp3');
			laugh.play();
			gameOver();
		} else if (targetCell.gameElement === PLANKTON) {
			gIsStuck = true;
			var laugh = new Audio('sounds/plankton-laugh.mp3');
			laugh.play();
			setTimeout(() => gIsStuck = false, 3000);
		}
		// TODO: Move the gamer
		// MODEL
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = null;

		// DOM
		renderCell(gGamerPos, '');

		// update game pos
		gGamerPos = { i: i, j: j };

		// MODEL
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER;

		// DOM
		renderCell(gGamerPos, GAMER_IMG);
	} else {console.log('TOO FAR', iAbsDiff, jAbsDiff)};
}

// Convert a location object {i, j} to a selector and render a value in that element

// .cell-0-0
function renderCell(location, value) {
	var cellSelector = '.' + getClassName(location);
	var elCell = document.querySelector(cellSelector);
	elCell.innerHTML = value;
}

// Move the player by keyboard arrows
function handleKey(event) {
	var i = gGamerPos.i;
	var j = gGamerPos.j;
	switch (event.key) {
		case 'ArrowLeft':
			(j === 0) ? moveTo(5, 11) : moveTo(i, j - 1);
			break;
		case 'ArrowRight':
			(j === 12) ? moveTo(5, 0) : moveTo(i, j + 1);
			break;
		case 'ArrowUp':
			(i === 0) ? moveTo(10, 6) : moveTo(i - 1, j);
			break;
		case 'ArrowDown':
			(i === 10) ? moveTo(0, 6) : moveTo(i + 1, j);
			break;
	}
}

// Returns the class name for a specific cell
function getClassName(location) {
	var cellClass = 'cell-' + location.i + '-' + location.j;
	return cellClass;
}

function restart() {
	gCountBurger = 0;
	gCollectedBurger = 0;
	var elGameOver = document.querySelector('.gameOver');
	elGameOver.style.display = 'none';
	var elCandy = document.querySelector('.candy');
	elCandy.innerHTML = 'krabby pattys:' + gCollectedBurger;
	var elRestart = document.querySelector('button');
	elRestart.style.display = 'none';
	initGame();
}