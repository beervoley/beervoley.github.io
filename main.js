var gl;
var canvas;  
var prevX;
var prevY;
var translateX = 0;
var translateY = 0;
var translateZ = 0;
var wasRotatedX = 0;
var wasRotatedY = 0;
var rotateX = 0;
var rotateY = 0;
var ifTranslating = false;
var ifRotating = false;
var matrix = mat4();
var pointLightEnabled = true;
var spotLightEnabled = true;
var pointLightRotateY = 0;
var spotLightRotateY = 0;
var rotationSign = -1;
var savedRotationSign = rotationSign;
var rotationSignPoint = 1;
var cylinderSegments=2048;


var upperArmHeight = 0.7;
var upperHarmWidth = 0.2;

var lowerArmHeight = 1;
var lowerArmWidth = 0.2;

var baseHeight = 0.4;
var baseWidth = 1;

var rotateBase = 0;
var rotateLower = 0;
var rotateUpper = 0;



var modelViewMatrix;
var instance;
var theta = [];

 window.onload = function init() {   
    setUpSliders();
    
   canvas = document.getElementById( "gl-canvas" );

   
   //  canvas.width  = window.innerWidth;
   //  canvas.height = window.innerHeight;
    gl = WebGLUtils.setupWebGL( canvas );

    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );

    gl.useProgram(program);

    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    // Projection and modelView matrice

    eye = vec3(0, 0, 10);
    at = vec3(0, 0, 0);
    up = vec3(0, 1, 0);
    near = 1;
    far = 2000.0;
    fovy = 30;
    aspect = gl.canvas.width / gl.canvas.height;
    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = perspective(fovy, aspect, near, far);
 

   vertices = get_cube_vertices();
   faces = get_cube_faces();


    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
   gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

   fBuffer = gl.createBuffer();
   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, fBuffer);
   gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(flatten(faces)), gl.STATIC_DRAW);


    
    
    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    vColor = gl.getUniformLocation(program, "vColor");
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

    gl.uniform4fv(vColor, vec4(0.0, 1.0, 1.0, 1.0));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));



    


    render();

 };

 function setUpSliders() {
   baseSlider = document.getElementById("base");
   lowerSlider = document.getElementById("lower");
   upperSlider = document.getElementById("upper");
   baseSlider.oninput = function () {
      rotateBase = this.value;
   };
   lowerSlider.oninput = function () {
      rotateLower = this.value;
   };
   upperSlider.oninput = function () {
      rotateUpper = this.value;
   };
 }








 function upper_arm() {

   matrix = mult(
      translate(0.0, 0.5 * upperArmHeight, 0.0),
      scalem(upperHarmWidth, upperArmHeight, upperHarmWidth)
   );
   gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(mult(modelViewMatrix, matrix)));  
   gl.drawElements(gl.LINE_STRIP, faces.length * 3, gl.UNSIGNED_SHORT, 0);
   //gl.drawArrays(gl.TRIANGLES, 0, vertices.length);

}

function base() {
   matrix = mult(
      translate(0.0, 0.5*baseHeight, 0.0),
      scalem(baseWidth, baseHeight, baseWidth)
   );
   gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(mult(modelViewMatrix, matrix)));  
   gl.drawElements(gl.LINE_STRIP, faces.length * 3, gl.UNSIGNED_SHORT, 0);
   //gl.drawArrays(gl.TRIANGLES, 0, vertices.length);

}

function lower_arm() {
   matrix = mult(
      translate(0.0, 0.5 * lowerArmHeight, 0.0),
      scalem(lowerArmWidth, lowerArmHeight, lowerArmWidth)
      );
   gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(mult(modelViewMatrix, matrix)));
   gl.drawElements(gl.LINE_STRIP, faces.length * 3, gl.UNSIGNED_SHORT, 0)
   //gl.drawArrays(gl.TRIANGLE_FAN, 0, vertices.length);
}


function render() {
   requestAnimationFrame(render, canvas);
   gl.clear(gl.COLOR_BUFFER_BIT); 

  modelViewMatrix = mult(modelViewMatrix, rotate(rotateBase, vec3(0, 1, 0)));
  base();
  modelViewMatrix = mult(modelViewMatrix, translate(0.0, baseHeight, 0.0));
  modelViewMatrix = mult(modelViewMatrix, rotate(rotateLower, vec3(0, 0, 1)));
  lower_arm();
  modelViewMatrix = mult(modelViewMatrix, translate(0.0, lowerArmHeight, 0.0));
  modelViewMatrix = mult(modelViewMatrix, rotate(rotateUpper, vec3(0, 0, 1)));
  upper_arm();
   modelViewMatrix = lookAt(eye, at, up);

}
