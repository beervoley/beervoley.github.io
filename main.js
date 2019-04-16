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


onmousemove = function(e){


   console.log("mouse location:", e.clientX, e.clientY)
};

 window.onload = function init() {   
    canvas = document.getElementById( "gl-canvas" );
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    gl = WebGLUtils.setupWebGL( canvas );

    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );

    gl.useProgram(program);

    gl.clearColor(0.0, 0.0, 0.0, 0.5);

    // Projection and modelView matrices
    eye = vec3(0, 0, 10);
    at = vec3(0, 0, 0);
    up = vec3(0, 1, 0);
    near = 1;
    far = 2000.0;
    fovy = 50;
    aspect = gl.canvas.width / gl.canvas.height;

    light = vec3(-15, 15, 10);
    pointLight = vec3(5, 5, 0);
    spotLight = vec3(0, 4 , 2);
    spotLightAt = vec3(0, 0, 0);
    spotLightCutOff = Math.cos(radians(30));

    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = perspective(fovy, aspect, near, far);
    nMatrix = normalMatrix(modelViewMatrix, true);
    pointLightRotationMatrix = mat4();
    spotLightRotationMatrix = mat4();


    vertices = get_vertices();
    bunnyLoc = vec3(0, 0, 0);

    faces = adjustFacesIndexes(get_faces());
   //  normals = calculateNormals(vertices, faces);
   
   cubeVertices = get_cube_vertices();
   cubeFaces = get_cube_faces();
   cubeLocation = vec3(5, 5, 0);

   coneVertices = get_cone_vertices();
   coneFaces = get_cone_faces();
   coneLocation = vec3(0, 4, 2);



   normals = calculateNormals(vertices, faces);

    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );
    
    
    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    fBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, fBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(flatten(faces)), gl.STATIC_DRAW);

    normalsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);

    normalPosition = gl.getAttribLocation( program, "normal" );
    gl.vertexAttribPointer( normalPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( normalPosition);
    
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    transformationMatrixLoc = gl.getUniformLocation(program, "transformationMatrix");
    normalMatrixLoc = gl.getUniformLocation(program, "normalMatrix");
    lightLoc = gl.getUniformLocation(program, "light");
    cameraPositionLoc = gl.getUniformLocation(program, "cameraPosition");
    pointLightRotationMatrixLoc = gl.getUniformLocation(program, "pointLightMatrix");
    spotLightRotationMatrixLoc = gl.getUniformLocation(program, "spotLightRotationMatrix");
    spotlightAtLoc = gl.getUniformLocation(program, "spotLightAt");
    spotlightCutOffLoc = gl.getUniformLocation(program, "cutOff");
    
    gl.uniform1f(spotlightCutOffLoc, spotLightCutOff);
    gl.uniform3fv(lightLoc, light);
    gl.uniform3fv(spotlightAtLoc, spotLightAt);
    gl.uniformMatrix3fv( normalMatrixLoc, false, flatten(nMatrix));
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix));
    gl.uniformMatrix4fv( transformationMatrixLoc, false, flatten(mat4()));
    gl.uniformMatrix4fv( pointLightRotationMatrixLoc, false, flatten(mat4()));
    gl.uniformMatrix4fv( spotLightRotationMatrixLoc, false, flatten(mat4()));

    KaLocation = gl.getUniformLocation(program, "Ka");
    KdLocation = gl.getUniformLocation(program, "Kd");
    KsLocation = gl.getUniformLocation(program, "Ks");
    shinenessLocation = gl.getUniformLocation(program, "shineness");

    ambientColorLocation = gl.getUniformLocation(program, "ambientColor");
    diffuseColorLocation = gl.getUniformLocation(program, "diffuseColor");
    specularColorLocation = gl.getUniformLocation(program, "specularColor");
    lightPositionsLoc = gl.getUniformLocation(program, "lightPositions");

    modeLocation = gl.getUniformLocation(program, "mode");

    var Ka = [1.0, 1.0];
    var Kd = [1.0, 1.0];
    var Ks = [1.0, 1.0];
    var shineness = [30, 25];

    var ambientColor = [vec3(0.929524, 0.796542, 0.178823), vec3(0.0, 0.0, 0.0)]; 
    var diffuseColor = [vec3(0.929524, 0.796542, 0.178823), vec3(1.0, 1.0, 1.0)];
    var specularColor = [vec3(1.00000, 0.980392, 0.549020), vec3(1.0, 1.0, 1.0)]; 

    gl.uniform1fv(KaLocation, flatten(Ka));
    gl.uniform1fv(KdLocation, flatten(Kd));
    gl.uniform1fv(KsLocation, flatten(Ks));
    gl.uniform1fv(shinenessLocation, flatten(shineness));
    gl.uniform1i(modeLocation, 1);
    
    gl.uniform3fv(lightPositionsLoc, setLightPositions());
    gl.uniform3fv(cameraPositionLoc, eye);
    gl.uniform3fv(ambientColorLocation, flatten(ambientColor));
    gl.uniform3fv(diffuseColorLocation, flatten(diffuseColor));
    gl.uniform3fv(specularColorLocation, flatten(specularColor));

    render();

 };


 function adjustFacesIndexes(faces) {
   for (var i = 0; i < faces.length; i++) {
      for (var j = 0; j < 3; j++) {
         faces[i][j] = faces[i][j] - 1;
        }
  }
  return faces;
 }


function calculateNormals(vertices, indexes) {
      normals = new Array(vertices.length);

      for (var j = 0; j < normals.length; j++) {
         normals[j] = [];
      }
      for(var i = 0; i < indexes.length; i++) {
         temp = indexes[i];
         v1 = vertices[temp[0]];
         v2 = vertices[temp[1]];
         v3 = vertices[temp[2]];
         e1 = subtract(v2, v1);
         e2 = subtract(v3, v1);
         normal = cross(e1, e2);
         normals[temp[0]].push(normal);
         normals[temp[1]].push(normal);
         normals[temp[2]].push(normal);
      }
      for(var k = 0; k < normals.length; k++) {
         var sum = vec3(0, 0, 0);
         for(var l = 0; l < normals[k].length; l++) {
            sum = add(sum, normals[k][l]);
         }
         normals[k] = normalize(sum);
      }

      return normals;
}



onmousedown = function(e) {
   if(e.which == 1) {
      ifTranslating = true;
      prevX = e.clientX;
      prevY = e.clientY;
   } else if (e.which == 3) {
      prevX = e.clientX;
      prevY = e.clientY;
      ifRotating = true;
   }
};
 onmouseup = function (e) {
    if(e.which == 1) {
       ifTranslating = false;
       console.log(translateX, translateY);
      bunnyLoc = add(bunnyLoc, vec3(translateX / 80, -translateY / 80, 0));
      translateX = 0;
      translateY = 0;
      gl.uniformMatrix4fv(transformationMatrixLoc, false, flatten(translate(bunnyLoc)));
   } else if (e.which == 3) {
       ifRotating = false;
       wasRotatedX = rotateX;
       wasRotatedY = rotateY;
       //  rotateX = 0;
       //  rotateY = 0;
    }
 };
 
 onmousemove = function(e){
    if(ifTranslating) {
       translateX = e.clientX - prevX;
       translateY = e.clientY - prevY;
      } else if(ifRotating) {
      rotateX = wasRotatedX + e.clientY - prevY;
      rotateY = wasRotatedY + e.clientX - prevX;
   }
};

onkeydown = function(e) {
   if(e.keyCode == 82) { // r/R
      bunnyLoc = vec3(0, 0, 0);
      wasRotatedX = 0;
      wasRotatedY = 0;
      rotateX = 0;
      rotateY = 0;
      gl.uniformMatrix4fv(transformationMatrixLoc, false, flatten(translate(bunnyLoc)));
   } else if(e.keyCode == 38) { // arrow UP
      e.preventDefault();
      translateZ += 0.5;
   } else if(e.keyCode == 40) {
      e.preventDefault();
      translateZ -= 0.5;
   } else if(e.keyCode == 80) {
      if(rotationSignPoint != 0) {
         rotationSignPoint = 0;
      } else {
         rotationSignPoint = 1;
      }
      
   } else if(e.keyCode == 83) {
      if(rotationSign != 0) {
         savedRotationSign = rotationSign;
         rotationSign = 0;
      } else {
         rotationSign = savedRotationSign;
      }
   }
};

onkeyup = function(e) {
   if(e.keyCode == 38 || e.keyCode == 40) { // arrow UP
      bunnyLoc = add(bunnyLoc, vec3(0, 0, translateZ));
      translateZ = 0;
   }
};

function updateTransformationMatrixForBunny() {

   matrix = mult(
      rotate(rotateX, vec3(1, 0, 0)),
      rotate(rotateY, vec3(0, 1, 0))
   );

   matrix = mult(
      matrix,
      translate(add(bunnyLoc, vec3(translateX / 80, -translateY / 80, translateZ)))
   );

   nMatrix = normalMatrix(mult(matrix, modelViewMatrix), true);
}

function updateTransformationMatrixForSpotLight() {
   gl.uniform3fv(spotlightAtLoc, vec3(spotLightRotateY * 0.15, 0, 0));
   
   matrix = mult(
      translate(coneLocation),
      rotate(spotLightRotateY, vec3(0, 0, 1))
   );
}


function updateTransformationMatrixForPointight() {

pointLightRotationMatrix = rotate(pointLightRotateY, vec3(0, 1, 0));
   matrix = mult(
      rotate(pointLightRotateY, vec3(0, 1, 0)),
      translate(cubeLocation)
   );
}

function drawBunny() {
   mode = 1;
   updateTransformationMatrixForBunny();
   gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
   gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, fBuffer);
   gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(flatten(faces)), gl.STATIC_DRAW);
   gl.uniformMatrix4fv(transformationMatrixLoc, false, flatten(matrix));
   gl.uniformMatrix3fv( normalMatrixLoc, false, flatten(nMatrix));
   gl.uniform3fv(lightLoc, light);
   gl.uniformMatrix4fv(pointLightRotationMatrixLoc, false, flatten(pointLightRotationMatrix));
   gl.uniformMatrix4fv(spotLightRotationMatrixLoc, false, flatten(spotLightRotationMatrix));
   gl.uniform1i(modeLocation, 1);
   gl.drawElements(gl.TRIANGLES, faces.length * 3, gl.UNSIGNED_SHORT, 0);
}

function drawCube() {
   mode = 0;
   updateTransformationMatrixForPointight();
   gl.uniformMatrix4fv(transformationMatrixLoc, false, flatten(matrix));
   gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
   gl.bufferData(gl.ARRAY_BUFFER, flatten(cubeVertices), gl.STATIC_DRAW );

   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, fBuffer);
   gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(flatten(cubeFaces)), gl.STATIC_DRAW);
   gl.uniform1i(modeLocation, 0);
   gl.drawElements(gl.LINE_STRIP, cubeFaces.length * 3, gl.UNSIGNED_SHORT, 0);
}

function drawCone() {
   mode = 0;
   updateTransformationMatrixForSpotLight();
   gl.uniformMatrix4fv(transformationMatrixLoc, false, flatten(matrix));
   gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
   gl.bufferData(gl.ARRAY_BUFFER, flatten(coneVertices), gl.STATIC_DRAW );

   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, fBuffer);
   gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(flatten(coneFaces)), gl.STATIC_DRAW);
   gl.uniform1i(modeLocation, 0);
   gl.drawElements(gl.LINE_STRIP, coneFaces.length * 3, gl.UNSIGNED_SHORT, 0);
}


function setLightPositions() {
   lightArr = new Array(2);
   lightArr[0] = pointLight;
   lightArr[1] = spotLight;
   return flatten(lightArr);
}

 function render() {
    
     requestAnimationFrame(render, canvas);
     gl.clear(gl.COLOR_BUFFER_BIT); 
     if(spotLightRotateY == 30 || spotLightRotateY == -30) {
         rotationSign *= -1;
     }
     spotLightRotateY += rotationSign * 0.25;
    pointLightRotateY += rotationSignPoint * 2;

    drawCube();
    drawCone();
    drawBunny();
    }
