"use strict";


/* SCRIPT CONTROL */
const SHOW_LOG = true;
const SHOW_WARNING_LOG = true;
const SHOW_ERROR_LOG = true;

/* GAME CONTROL CONSTANTS */
const GAME_NEXT_CYCLE_DELTA = 1000;
const MATRIX_CELL_SIZE = 20;
const MATRIX_CELL_INNER_OFFSET = 1;
const MATRIX_SQUARE_SIZE = MATRIX_CELL_SIZE - (MATRIX_CELL_INNER_OFFSET * 2);

const GAME_ID_NAME = "conway-game-life__canvas";
const GAME_CONTROL_BUTTONS_CLASSNAME = "game__button";
const GAME_CONTROL_BUTTON_START_CLASSNAME = "game-button--start";
const GAME_CONTROL_BUTTON_PAUSE_CLASSNAME = "game-button--pause";
const GAME_CONTROL_BUTTON_RESET_CLASSNAME = "game-button--reset";

const GAME_SQUARE_COLOR = "white";

/* GLOBAL VARS */
// canvas
let canvas;
let canvasWidth;
let canvasHeight;
let canvasCtx;

// matrix in canvas
let matrixMap;
let matrixCellSize;
let matrixNumCols;
let matrixNumRows;

/* GAME STATUS */
let gameHasStarted;
let gameHasPaused;


/* UTILS */
function resolveAfterTime(callback=(() => {}), time=1000) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
            callback();
        }, time);
    });
};

const asyncResolveAfterTime = (callback, time) => { // not used
    return setTimeout(() => {
        callback();
    }, time);
};

/* on screen log output (canvas and matrix values) */
function initScreenLogOutput() {

    if( SHOW_LOG ) console.log("| Starting initScreenLogOutput()");

    const outputElementCanvasSize = document.querySelector(".conway-game-life__log-output__container #conway-game-life__log-output__canvas--sizes");
    const outputElementMatrixCellSize = document.querySelector(".conway-game-life__log-output__container #conway-game-life__log-output__matrix--cell-size");
    const outputElementMatrixSize = document.querySelector(".conway-game-life__log-output__container #conway-game-life__log-output__matrix--size");

    outputElementCanvasSize.innerText = `Canvas size: (${canvasWidth}x${canvasHeight})`;
    outputElementMatrixCellSize.innerText = `Matrix single cell size: ${matrixCellSize}px`;
    outputElementMatrixSize.innerText = `Matrix size: (${matrixNumCols}x${matrixNumRows}) cells`;
};

function drawSquareAt(x, y, color=GAME_SQUARE_COLOR) {

    canvasCtx.fillStyle = color;

    canvasCtx.fillRect(
        x + MATRIX_CELL_INNER_OFFSET,
        y + MATRIX_CELL_INNER_OFFSET,
        MATRIX_SQUARE_SIZE,
        MATRIX_SQUARE_SIZE
    );
};

function clearSquareAt(x, y) {

    canvasCtx.clearRect(
        x + MATRIX_CELL_INNER_OFFSET,
        y + MATRIX_CELL_INNER_OFFSET,
        MATRIX_SQUARE_SIZE,
        MATRIX_SQUARE_SIZE
    );
};

/* GAME SCRIPT */
function initMatrixMap() {

    if( SHOW_LOG ) console.log("| First Matrix Map creation, filling with 0es");

    for( let i=0; i < matrixNumRows; i++ ) {     // for Each row
        
        matrixMap.push([]);

        for( let j=0; j < matrixNumCols; j++ ) {    // for Each col
            matrixMap[i].push(0);
        }
    }
};

/**
 * Reset Matrix to a random pop
 */
function matrixRandomPopulate() {

    if( SHOW_LOG ) console.log("| Starting matrixRandomPopulate()");

    canvasCtx.strokeStyle = "rgb(0, 0, 0)";

    for( let i=0; i < matrixNumRows; i++ ) {     // for Each row
        for( let j=0; j < matrixNumCols; j++ ) {    // for Each col

            if( Math.random() >= 0.5 ) {
                matrixMap[i][j] = 1;
                drawSquareAt(j * matrixCellSize, i * matrixCellSize);
                continue;
            }

            matrixMap[i][j] = 0;
        }
    }
};

/**
 * Simply draw grid on Matrix, generally called once
 */
function drawMatrixGrid() {

    if( SHOW_LOG ) console.log("| Starting drawGrid()");

    canvasCtx.strokeStyle = "rgb(0, 0, 0)";

    for( let i=0; i < matrixNumRows; i++ )      // for Each row
        for( let j=0; j < matrixNumCols; j++ ) {     // for Each col

            canvasCtx.strokeRect(
                j * matrixCellSize, i * matrixCellSize,
                matrixCellSize, matrixCellSize
            );
        }
};

function fillMatrixWithSquares() {

    if( SHOW_LOG ) console.log("| Starting fillMatrixWithSquares()");

    for( let i=0; i < matrixNumRows; i++ )      // for Each row
        for( let j=0; j < matrixNumCols; j++ ) {     // for Each col
            matrixMap[i][j] = 1;
            drawSquareAt(j * matrixCellSize, i * matrixCellSize);
        }
};

function clearMatrixOfSquares() {

    if( SHOW_LOG ) console.log("| Starting clearMatrixOfSquares()");

    for( let i=0; i < matrixNumRows; i++ )      // for Each row
        for( let j=0; j < matrixNumCols; j++ ) {     // for Each col
            matrixMap[i][j] = 0;
            clearSquareAt(j * matrixCellSize, i * matrixCellSize);
        }
};

/* Matrix first Init */
function initMatrixGrid() {

    if( SHOW_LOG ) console.log("| Starting initMatrixGrid()");    

    drawMatrixGrid();
};

function initMatrixFillWithSquares() {

    if( SHOW_LOG ) console.log("| Starting initMatrixFillWithSquares()");

    fillMatrixWithSquares();
};

function initMatrixClearSquares() {

    if( SHOW_LOG ) console.log("| Starting initMatrixClearSquares()");

    clearMatrixOfSquares();
};

/* GAME CYCLES */
function calculateGameNextCycle() {

    if( SHOW_LOG ) console.log("| Starting next game cycle!");

    let currNumberOfNeighboursAlive;
    let newMatrixMap = [];

    function numberOfNeighboursAlive(x, y) {

        let cellsAlive = 0;
        let prevY = y - 1;
        let nextY = y + 1;
        let prevX = x - 1;
        let nextX = x + 1;

        if( prevY < 0 ) prevY = matrixNumRows - 1;
        if( nextY > (matrixNumRows - 1)) nextY = 0;

        if( prevX < 0 ) prevX = matrixNumCols - 1;
        if( nextX > (matrixNumCols - 1)) nextX = 0;

        // top line
        if( matrixMap[prevY][prevX] === 1 ) ++cellsAlive;
        if( matrixMap[prevY][x] === 1) ++cellsAlive;
        if( matrixMap[prevY][nextX] === 1) ++cellsAlive;

        // mid
        if( matrixMap[y][prevX] === 1) ++cellsAlive;
        if( matrixMap[y][nextX] === 1) ++cellsAlive;

        // bottom line
        if( matrixMap[nextY][prevX] === 1) ++cellsAlive;
        if( matrixMap[nextY][x] === 1) ++cellsAlive;
        if( matrixMap[nextY][nextX] === 1) ++cellsAlive;

        return cellsAlive;
    };
    
    for( let i=0; i < matrixNumRows; i++ ) {     // for Each row

        newMatrixMap.push([]);

        for( let j=0; j < matrixNumCols; j++ ) {     // for Each col

            currNumberOfNeighboursAlive = numberOfNeighboursAlive(j, i);

            if( matrixMap[i][j] === 1 ) {
                if( currNumberOfNeighboursAlive < 2 ) {
                    newMatrixMap[i][j] = 0;
                    clearSquareAt(j * matrixCellSize, i * matrixCellSize);
                }
                if( currNumberOfNeighboursAlive > 3 ) {
                    newMatrixMap[i][j] = 0
                    clearSquareAt(j * matrixCellSize, i * matrixCellSize);
                };
                if( currNumberOfNeighboursAlive >= 2 && currNumberOfNeighboursAlive <= 3) newMatrixMap[i][j] = 1;
                continue;
            }

            if ( currNumberOfNeighboursAlive === 3 ) {
                newMatrixMap[i][j] = 1
                drawSquareAt(j * matrixCellSize, i * matrixCellSize);
            };
        }
    }

    matrixMap = newMatrixMap;
};

/* GAME CONTROL BUTTONS HANDLERS */
function disableAllButtons() {

    if( SHOW_LOG ) console.log("| Starting disableAllButtons()");

    const gameControlButtonElements = document.getElementsByClassName(GAME_CONTROL_BUTTONS_CLASSNAME);

    if( !gameControlButtonElements ) {
        if( SHOW_WARNING_LOG ) console.warn("Missing game control buttons");
        return;
    }

    for( let i=0; i < gameControlButtonElements.length; i++ )
        gameControlButtonElements[i].disabled = true;
};

function enableAllButtons() {

    if( SHOW_LOG ) console.log("| Starting enableAllButtons()");

    const gameControlButtonElements = document.getElementsByClassName(GAME_CONTROL_BUTTONS_CLASSNAME);

    if( !gameControlButtonElements ) {
        if( SHOW_WARNING_LOG ) console.warn("Missing game control buttons");
        return;
    }

    for( let i=0; i < gameControlButtonElements.length; i++ )
        gameControlButtonElements[i].disabled = false;
};

/**
 * START BUTTON HANDLER
 * handle game start cycles
 * @param {*} event 
 */
 function startButtonHandler(event) {

    if( SHOW_LOG ) console.log("");
    if( SHOW_LOG ) console.log("| One of (many?) start button is clicked");

    gameHasPaused = false;

    if( !gameHasStarted ) {        
        gameHasStarted = true;

        setInterval(() => {
            if( !gameHasPaused ) calculateGameNextCycle();
        }, GAME_NEXT_CYCLE_DELTA);
    }

    if( SHOW_LOG ) console.log("");
};

function bindHandlerToStartButton() {

    if( SHOW_LOG ) console.log("| Binding Start Handler to all start buttons");

    const startButtonElements = document.getElementsByClassName(GAME_CONTROL_BUTTON_START_CLASSNAME);

    if( !startButtonElements ) {
        if( SHOW_WARNING_LOG ) console.warn("Missing game control START button");
        return;
    }

    for( let i=0; i < startButtonElements.length; i++ )
        startButtonElements[i].addEventListener("click", startButtonHandler);
};

/**
 * PAUSE BUTTON HANDLER
 * handle game pause
 * @param {*} event 
 */
 function pauseButtonHandler(event) {

    if( SHOW_LOG ) console.log("");
    if( SHOW_LOG ) console.log("| One of (many?) pause button is clicked");

    gameHasPaused = !gameHasPaused;

    if( SHOW_LOG ) console.log("");
};

function bindHandlerToPauseButton() {

    if( SHOW_LOG ) console.log("| Binding Pause Handler to all pause buttons");

    const pauseButtonElements = document.getElementsByClassName(GAME_CONTROL_BUTTON_PAUSE_CLASSNAME);

    if( !pauseButtonElements ) {
        if( SHOW_WARNING_LOG ) console.warn("Missing game control PAUSE button");
        return;
    }

    for( let i=0; i < pauseButtonElements.length; i++ )
        pauseButtonElements[i].addEventListener("click", pauseButtonHandler);
};

/**
 * RESET BUTTON HANDLER
 * handle matrix clean and repopulate
 * @param {*} event 
 */
function resetButtonHandler(event) {

    if( SHOW_LOG ) console.log("");
    if( SHOW_LOG ) console.log("| One of (many?) reset button is clicked");

    initMatrixClearSquares();
    matrixRandomPopulate();

    if( SHOW_LOG ) console.log("");
};

function bindHandlerToResetButton() {

    if( SHOW_LOG ) console.log("| Binding Reset Handler to all reset buttons");

    const resetButtonElements = document.getElementsByClassName(GAME_CONTROL_BUTTON_RESET_CLASSNAME);

    if( !resetButtonElements ) {
        if( SHOW_WARNING_LOG ) console.warn("Missing game control RESET button");
        return;
    }

    for( let i=0; i < resetButtonElements.length; i++ )
        resetButtonElements[i].addEventListener("click", resetButtonHandler)
};

/**
 * First initialization of vars/states
 * 1. Get canvas from DOM
 * 2. Get canvas context
 * 3. init matrix size with konstants
 */
function init() {

    if( SHOW_LOG ) console.log("| Starting Init()");

    gameHasPaused = false;

    // get canvas html tag
    canvas = document.getElementById(GAME_ID_NAME);
    if( !canvas)  {
        if( SHOW_ERROR_LOG ) console.error("Missing Canvas Element");
        return false;
    }
    if( SHOW_LOG ) console.log("|-- Canvas Tag is:", canvas);

    // save canvas size
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;
    if( SHOW_LOG ) console.log("|-- Canvas size is: (", canvasWidth, "x", canvasHeight, ")");

    // get canvas 2d context
    canvasCtx = canvas.getContext("2d");
    if( !canvas.getContext ) {
        if( SHOW_ERROR_LOG ) console.error("Canvas is not supported in your browser");
        return false;
    }
    if( SHOW_LOG ) console.log("|-- Canvas CTX is:", canvasCtx);

    // matrix size
    matrixMap = [];
    matrixCellSize = MATRIX_CELL_SIZE;
    matrixNumCols = canvasWidth / matrixCellSize;
    matrixNumRows = canvasHeight / matrixCellSize;
    if( SHOW_LOG ) console.log("|-- Matrix cell size is:", matrixCellSize);
    if( SHOW_LOG ) console.log("|-- Matrix number of cols is:", matrixNumCols);
    if( SHOW_LOG ) console.log("|-- Matrix number of rows is:", matrixNumRows);

    return true;
};

async function main() {

    let initSuccess = false;

    if( SHOW_LOG ) console.log("---- JS Alive! ----");

    disableAllButtons();

    /* GAME INIT PHASE */
    initSuccess = init();

    if( !initSuccess ) {
        if( SHOW_ERROR_LOG ) console.error("Init Returned a falsy value!");
        return;
    }

    if( SHOW_LOG ) console.log("| Init successfully executed");
    if( SHOW_LOG ) console.log("");
    
    /* MATRIX INIT, with first time effect */
    initMatrixMap();
    
    initScreenLogOutput();
    await resolveAfterTime(initMatrixGrid, 500);
    await resolveAfterTime(initMatrixFillWithSquares, 500);
    await resolveAfterTime(initMatrixClearSquares, 500);

    if( SHOW_LOG ) console.log("");

    await resolveAfterTime(matrixRandomPopulate, 750);

    calculateGameNextCycle();

    enableAllButtons();
    bindHandlerToStartButton();
    bindHandlerToPauseButton();
    bindHandlerToResetButton();

    /* GAME START */
    if( SHOW_LOG ) console.log("| Waiting for user to press any button");
    if( SHOW_LOG ) console.log("");
};

main();
