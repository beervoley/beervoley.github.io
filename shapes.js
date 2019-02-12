function Shape(centX, centY, blocks, type, color, colorID) {
    this.origin = [centX, centY];
    this.blocks = blocks;
    this.type = type;
    this.color = color;
    this.colorID = colorID;
}

Shape.colors = {
    RED: 0,
    YELLOW: 1,
    BLUE: 2,
    GREEN: 3,
    BLACK: 4,
    properties: {
        0 : {name: "red", value: vec4(1.0, 0.0, 0.0, 1.0)},
        1 : {name: "yellow", value: vec4(1.0, 0.5, 0.0, 1.0)},
        2 : {name: "blue", value: vec4(0.0, 0.0, 1.0, 1.0)},
        3 : {name: "green", value:  vec4(0.0, 1.0, 0.0, 1.0)},
        4 : {name: "black", value:  vec4(0.0, 0.0, 0.0, 1.0)}
    }
};

Shape.type =  { O : 0, I : 1, S : 2, Z : 3, L : 4, J : 5, T : 6 };
Shape.shapes = { 
    0: [ [ 0, 0, 0, 0 ], [ 0, 1, 1, 0 ], [ 0, 1, 1, 0 ], [ 0, 0, 0, 0 ] ],
    1: [ [ 0, 0, 1, 0 ], [ 0, 0, 1, 0 ], [ 0, 0, 1, 0 ], [ 0, 0, 1, 0 ] ],
    2: [ [ 0, 0, 1, 0 ], [ 0, 0, 1, 1 ], [ 0, 0, 0, 1 ], [ 0, 0, 0, 0 ] ],
    3: [ [ 0, 0, 0, 1 ], [ 0, 0, 1, 1 ], [ 0, 0, 1, 0 ], [ 0, 0, 0, 0 ] ],
    4: [ [ 0, 0, 1, 0 ], [ 0, 0, 1, 0 ], [ 0, 0, 1, 1 ], [ 0, 0, 0, 0 ] ],
    5: [ [ 0, 0, 1, 0 ], [ 0, 0, 1, 0 ], [ 0, 1, 1, 0 ], [ 0, 0, 0, 0 ] ],
    6: [ [ 0, 0, 1, 0 ], [ 0, 1, 1, 0 ], [ 0, 0, 1, 0 ], [ 0, 0, 0, 0 ] ],
};

// matrix to rotate 90 degrees clockwise

var rMatrix = [[0, -1],
            [1, 0]];
Shape.prototype.tryTranslate = function(byX, byY, width, height) {
    return this.translate(byX, byY, width, height);
};

Shape.prototype.tryRotate = function(width, height, grid) {
    this.rotate(width, height, grid);
};

Shape.copy2DArray = function(arr) {
    var copy = new Array(arr.length);
    for(var i = 0; i < arr.length; i++) {
        copy[i] = arr[i].slice();
    }
    return copy;
};


Shape.prototype.translate = function(byX, byY, width, grid) {
    var blockCopy = Shape.copy2DArray(this.blocks);
    for(var i = 0; i < this.blocks.length; i++) {
        x = blockCopy[i][0] + byX;
        y = blockCopy[i][1] + byY;
        if(x >= grid.length) {
            return false;
        }
        else if(grid[x][y] != Shape.colors.BLACK || y >= width || y < 0) {
            return false;
        } else {
            blockCopy[i][0] = x;
            blockCopy[i][1] = y;
        }
    }
    this.blocks = blockCopy;
    this.origin[0]+= byX;
    this.origin[1]+= byY;

    return true;
};

Shape.prototype.rotationMatrix = [[0, -1],
                                 [1, 0]];

    
Shape.prototype.multiplyMatrix = function(matrix, point) {
    var newX = matrix[0][0] * point[0] + matrix[0][1] * point[1];
    var newY = matrix[1][0] * point[0] + matrix[1][1] * point[1];
    return vec2(newX, newY);
};

Shape.prototype.rotate = function(width, height, grid) {
    if(this.type == Shape.type.O) {
        return this.blocks;
    }
    var blockCopy = Shape.copy2DArray(this.blocks);
    for(var i = 0; i < this.blocks.length; i++) {
        blockCopy[i][0]-= this.origin[0];
        blockCopy[i][1]-= this.origin[1];
        blockCopy[i] = this.multiplyMatrix(this.rotationMatrix, blockCopy[i]);
        blockCopy[i][0]+= this.origin[0];
        blockCopy[i][1]+= this.origin[1];
        x = blockCopy[i][0];
        y = blockCopy[i][1];
        if(x >= height || y >= width  || y < 0 || x < 0 || grid[x][y] != Shape.colors.BLACK) {
            return;
        }
    }
    this.blocks = blockCopy;
    return this.blocks;
};
Shape.prototype.getBlocks = function() {
    return this.blocks;
};

Shape.prototype.getColor = function() {
    return this.color;
};

Shape.createShape = function(type) {
        var shapeBlocks = Shape.shapes[type];
        var blocksCoordinates = [];
        var leftMostCorner = Math.floor(Math.random() * (6 - 0 + 1)) + 0;
        for( var i = 0; i < 4; ++i )
		{
			for( var j = 0; j < 4; ++j )
			{
				if( shapeBlocks[i][j] == 1 )
				{
                    blocksCoordinates.push(vec2(i, leftMostCorner + j));
				}
			}
        }
        colorID = Shape.getRandomColor();
        return new Shape(1, leftMostCorner + 2, blocksCoordinates, type,
             Shape.colors.properties[colorID].value, colorID);
        
};

Shape.getRandomShape = function() {
    return Shape.createShape(Math.floor(Math.random() * (6 - 0 + 1)) + 0);
};

Shape.getRandomColor = function() {
    var color = Math.floor(Math.random() * (3 - 0 + 1)) + 0;

    return color;
};
