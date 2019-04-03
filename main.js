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
var upperHarmWidth = 0.08;

var lowerArmHeight = 1;
var lowerArmWidth = 0.1;

var baseHeight = 0.3;
var baseWidth = 0.65;

var rotateBase = 0;
var rotateLower = 0;
var rotateUpper = 0;
var rotateLowerLimit = 0;
var rotateUpperLimit = 0;
var countUpper = 1;
var countLower = 1;
var x = 0;
var y = 0;
var psi = 0;
var theta = 0;

var q1 = 0;
var q2 = 0;

var CONVERSION_RATE = 113;



var modelViewMatrix;
var instance;
var theta = [];

 window.onload = function init() {   
    
   canvas = document.getElementById( "gl-canvas" );
   canvas.addEventListener('mousedown', function(evt) {
            var rect = canvas.getBoundingClientRect();
       webglX = (event.clientX - rect.left) / gl.canvas.width * 2 - 1;
       webglY = (event.clientY - rect.top) / gl.canvas.height * -2 + 1;
      x = event.clientX - rect.left;
      y = event.clientY - rect.top;
      x = x - gl.canvas.width / 2;
      if(y >= gl.canvas.height / 2) {
         y = gl.canvas.height/2 - y;
      } else {
         y = gl.canvas.height / 2 - y;
      }
      // x = webglX;
      // y = webglY;
      console.log(x, y);
      console.log(webglX, webglY);
      // if(!(y < baseHeight * CONVERSION_RATE)) {
         rotateLower = 0;
         rotateUpper = 0;
         calculateReverseKinematics();
     
   }, false);

   
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

    gl.clearColor(0.0, 0.0, 0.0, 0.5);

    // Projection and modelView matrice
    

    eye = vec3(0, 0, 10);
    at = vec3(0, 0, 0);
    up = vec3(0, 1, 0);
    near = 1;
    far = 2000.0;
    fovy = 25;
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
    ifDot = gl.getUniformLocation(program, "ifDot");

    gl.uniform4fv(vColor, vec4(0.0, 1.0, 1.0, 1.0));
    gl.uniform1i(ifDot, 0);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));



    


    render();

 };




function drawPoint() {
   if(x != 0 && y != 0) {
      gl.uniform1i(ifDot, 1);
      gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, flatten([vec3(webglX, webglY, 0)]), gl.STATIC_DRAW);
      gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix)); 
      gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix)); 
      gl.uniform4fv(vColor, vec4(1.0, 0.0, 1.0, 1.0)); 
      gl.drawArrays(gl.POINTS, 0, 1);

   }

}


 function upper_arm() {

   matrix = mult(
      translate(0.0, 0.5 * upperArmHeight, 0.0),
      scalem(upperHarmWidth, upperArmHeight, upperHarmWidth)
   );
   gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(mult(modelViewMatrix, matrix)));  
   // gl.drawElements(gl.LINE_STRIP, faces.length * 3, gl.UNSIGNED_SHORT, 0);
   gl.drawArrays(gl.TRIANGLE_FAN, 0, vertices.length);

}

function base() {
   matrix = mult(
      translate(0.0,0.5 * baseHeight, 0.0),
      scalem(baseWidth, baseHeight, baseWidth)
   );
   gl.uniform1i(ifDot, 0);
   gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
   gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
   gl.uniform4fv(vColor, vec4(0.0, 1.0, 1.0, 1.0)); 
   gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(mult(modelViewMatrix, matrix)));
   // gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
   gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));  
   // gl.drawElements(gl.LINE_STRIP, faces.length * 3, gl.UNSIGNED_SHORT, 0);
   gl.drawArrays(gl.TRIANGLE_FAN, 0, vertices.length);

}

function lower_arm() {
   matrix = mult(
      translate(0.0, 0.5 * lowerArmHeight, 0.0),
      scalem(lowerArmWidth, lowerArmHeight, lowerArmWidth)
      );
   gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(mult(modelViewMatrix, matrix)));
   // gl.drawElements(gl.LINE_STRIP, faces.length * 3, gl.UNSIGNED_SHORT, 0);
   gl.drawArrays(gl.TRIANGLE_FAN, 0, vertices.length);
}

function toDegrees (angle) {
   return angle * (180 / Math.PI);
}

function calculateReverseKinematics() {
   y -= baseHeight  * CONVERSION_RATE;
   L2 = (upperArmHeight) * CONVERSION_RATE;
   L1 = (lowerArmHeight) * CONVERSION_RATE;

   temp = (Math.pow(x,2) + Math.pow(y, 2) - Math.pow(L1, 2) - Math.pow(L2, 2)) / (2 * L1 * L2);
   theta2 = Math.atan2(Math.sqrt(1 - Math.pow(temp, 2)), temp);

   k1 = L1 + L2 * Math.cos(theta2);
   k2 = L2 * Math.sin(theta2);

   theta1 = Math.atan2(y, x) - Math.atan2(k2, k1);

   theta1Degrees = toDegrees(theta1);
   theta2Degrees = toDegrees(theta2);
      rotateLowerLimit = -90 + theta1Degrees;
      rotateUpperLimit = theta2Degrees;
      
      if(rotateLowerLimit < 0) {
         countLower = -1;
      } else {
         countLower = 1;
      }

       
      if(rotateUpperLimit < 0) {
         countUpper = -1;
      } else {
         countUpper = 1;
      }

   console.log(rotateLowerLimit, rotateUpperLimit);
}


function render() {
   requestAnimationFrame(render, canvas);
   gl.clear(gl.COLOR_BUFFER_BIT); 

  drawPoint();
  modelViewMatrix = lookAt(eye, at, up);
  projectionMatrix = perspective(fovy, aspect, near, far);
  modelViewMatrix = mult(modelViewMatrix, rotate(rotateBase, vec3(0, 1, 0)));
  base();
  if(Math.abs(rotateUpper) >= Math.abs(rotateUpperLimit)) {
     rotateUpper = rotateUpperLimit;
     countUpper = 1;
  } else {
   rotateUpper += countUpper * 1;


  }

  if(Math.abs(rotateLower) >= Math.abs(rotateLowerLimit)) {
   rotateLower = rotateLowerLimit;
   countLower = 1;
  } else {
   rotateLower += countLower * 1;
  }


  modelViewMatrix = mult(modelViewMatrix, translate(0.0, baseHeight, 0.0));
  modelViewMatrix = mult(modelViewMatrix, rotate(rotateLower, vec3(0, 0, 1)));
  lower_arm();
  modelViewMatrix = mult(modelViewMatrix, translate(0.0, lowerArmHeight, 0.0));
  modelViewMatrix = mult(modelViewMatrix, rotate(rotateUpper, vec3(0, 0, 1)));
  upper_arm();
  modelViewMatrix = mat4();
  projectionMatrix = mat4();

}
