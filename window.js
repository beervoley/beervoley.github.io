function GameWindow(width, height) {

    this.width = width;
    this.height = height;
    this.initializeCallbacks();
    this.initializeWebGL();

}


GameWindow.prototype.initializeWebGL = function() {


    this.canvas = document.getElementById( "gl-canvas" );
    this.gl = WebGLUtils.setupWebGL( this.canvas );

    if ( !this.gl ) { alert( "WebGL isn't available" ); }

    this.gl.viewport( 0, 0, this.canvas.width, this.canvas.height );

    //
    //  Load shaders and initialize attribute buffers
    //
    this.program = initShaders( this.gl, "vertex-shader", "fragment-shader" );

    this.gl.useProgram( this.program );

    this.gl.clearColor(1, 1, 1, 1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.vBuffer = this.gl.createBuffer();

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vBuffer);


    // Create Grid and set initial colors
    this.grid = this.createGrid(width, height);
    this.colors = Array(width*height).fill(Shape.colors.properties[Shape.colors.BLACK].value); // Black
    this.floatArray = [].concat.apply([], this.grid); // Convert 2d array into 1d

    this.gl.bufferData( this.gl.ARRAY_BUFFER, flatten(this.floatArray), this.gl.STATIC_DRAW );



    this.vPosition = this.gl.getAttribLocation( this.program, "vPosition" );
    this.gl.vertexAttribPointer( this.vPosition, 4, this.gl.FLOAT, false, 0, 0 );
    this.gl.enableVertexAttribArray( this.vPosition );
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null); 


    this.colorBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, flatten(this.colors), this.gl.STATIC_DRAW);

    this.vColor = this.gl.getAttribLocation( this.program, "vColor" );
    this.gl.vertexAttribPointer(this.vColor, 4, this.gl.FLOAT, false, 0, 0 );
    this.gl.enableVertexAttribArray(this.vColor);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null); 

    this.gl.drawArrays(this.gl.POINTS, 0, this.floatArray.length);
};


GameWindow.prototype.updateBoard = function(grid) {
    colors = Shape.copy2DArray(grid);
    for(var i = 0; i < this.height; i++) {
        for (var j = 0; j < this.width; j++) {
            colors[i][j] = Shape.colors.properties[colors[i][j]].value;
        }
    }
    this.colors = [].concat.apply([], colors);  
};

GameWindow.prototype.render = function(grid) {
    this.updateBoard(grid);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, flatten(this.colors), this.gl.STATIC_DRAW);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    this.gl.drawArrays(this.gl.POINTS, 0, this.floatArray.length);
};



GameWindow.prototype.createGrid = function(width, height) {
    this.vertices = new Array(height);
    size = 1.8;
    stepH = size / width;
    stepV = size / height;
    half = size / 2;
    for(var i = 0; i < height; i++) {
        this.vertices[i] = new Array(width);
        for(var j = 0; j < width; j++) {
            if(j == 4) {
                this.vertices[i][j] = vec4(-half + (j * stepH), half - i * stepV, 0, 1);
            }
            else {
                this.vertices[i][j] = vec4(-half + (j * stepH), half - i * stepV, 0, 1);
            }
        }
    }
    return this.vertices;
};

GameWindow.prototype.initializeCallbacks = function() {
    document.addEventListener("keydown", function(event) {
        GameManager.takeAction(event.keyCode);
    });
};


