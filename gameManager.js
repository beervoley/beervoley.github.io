    var Callbacks = {
    UP: 38,
    DOWN: 40,
    LEFT: 37,
    RIGHT: 39
};
function GameManager() {

}
GameManager.callbacks = {
    38: "Rotate",			
    39: "Move right",			
    37: "Move left",			
    40: "Move down"			    
};


GameManager.initialize = function(width, height) {
    GameManager.defaultTimeout = 250;
    GameManager.currentWindow = new GameWindow(width, height);
    GameManager.createProtoypeGrid(width, height);
    GameManager.gridCopy = Shape.copy2DArray(GameManager.currentGrid);
    GameManager.currentShape = Shape.getRandomShape();
    GameManager.saveState(GameManager.currentShape.getBlocks(), GameManager.currentShape.colorID);
    GameManager.currentWindow.render(GameManager.currentGrid);
};
GameManager.createProtoypeGrid = function(width, height) {
    GameManager.currentGrid = new Array(height);
    for(var i = 0; i < height; i++) {
        GameManager.currentGrid[i] = new Array(width).fill(Shape.colors.BLACK);
    }
};

GameManager.initializeNewPiece = function() {
    GameManager.currentShape = Shape.getRandomShape(GameManager.gridCopy);
};

GameManager.saveState = function(blocks, colorID) {
    GameManager.currentGrid = Shape.copy2DArray(GameManager.gridCopy);
    for(var i = 0; i < blocks.length; i++) {
        var x = blocks[i][0];
        var y = blocks[i][1];
        if(GameManager.currentGrid[x][y] == Shape.colors.BLACK) {
            GameManager.currentGrid[x][y] = colorID;
        } else {
            clearInterval(GameManager.timeoutID);
            if(confirm('Do you want to start a new game?')){
                document.location.reload();
            }
            throw Error('Stop execution.');
        }
    }
};

GameManager.clearLines = function(blocks) {
    var set = new Set();
    for(var i = 0; i < blocks.length; i++) {
        row = blocks[i][0]
        if(set.has(row)) continue;
        else set.add(row);
        isFilled = true;
        for(var j = 0; j < GameManager.gridCopy[row].length; j++) {
            if(GameManager.gridCopy[row][j] == Shape.colors.BLACK) {
                isFilled = false;
                break;
            }
        }
        if(isFilled) {
            GameManager.gridCopy.splice(row, 1);
            GameManager.gridCopy.unshift(new Array(width).fill(Shape.colors.BLACK));  
        }
    }
    GameManager.currentWindow.render(GameManager.gridCopy);
};


GameManager.translate = function(byX, byY) {
    ifTranslated = GameManager.currentShape.tryTranslate(byX, byY, GameManager.currentWindow.width, GameManager.gridCopy);
    return ifTranslated;
};

GameManager.updateGameState = function() {
     GameManager.timeoutID = setInterval(function () {
        GameManager.takeAction(Callbacks.DOWN);
     }, GameManager.defaultTimeout);
};


GameManager.takeAction = function(id) {
    if (id in GameManager.callbacks)
    {
        switch(id){
            case(Callbacks.UP):
                GameManager.currentShape.tryRotate(GameManager.currentWindow.width, GameManager.currentWindow.height, GameManager.gridCopy);
                break;

            case(Callbacks.DOWN):
                ifHaveSapce = GameManager.translate(1, 0);
                if(!ifHaveSapce) {
                    GameManager.gridCopy = Shape.copy2DArray(GameManager.currentGrid);
                    GameManager.clearLines(GameManager.currentShape.getBlocks());
                    GameManager.initializeNewPiece();
                }
                break;

            case(Callbacks.LEFT):
                GameManager.translate(0, -1);
                break;

            case(Callbacks.RIGHT):
                GameManager.translate(0, 1);
                break;

            default:
                break;
            
        }
        GameManager.saveState(GameManager.currentShape.getBlocks(), GameManager.currentShape.colorID);
        GameManager.currentWindow.render(GameManager.currentGrid);
    }
};