var canvas;
var gl;

var width = 10;
var height = 20;



window.onload = function init() {
    initializeTetris();
};


function initializeTetris() {
    GameManager.initialize(width, height);
    GameManager.updateGameState();
}