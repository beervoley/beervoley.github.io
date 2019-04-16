
var grid = [];
var size = 10, gridSize = 32, totalSize = size * gridSize, halfsize = totalSize / 2;
var buffer1 = new Array(gridSize * gridSize).fill(0), buffer2 = new Array(gridSize * gridSize).fill(0);
var temp, plane;
var scene, camera, light, renderer;
var geometry, material;
var mouse, projector, ray, intersects = new Array(1);
var line = [];
var translateByX = 0;
var translateByY = 0;
var plane;
var planeNorm = vec3(0, 1, 0);
var planeOrigin = vec3(0, -0.5, 0);
var shadowDepthTextureSize = 1024;

window.onload = function init() {   
       canvas = document.getElementById( "gl-canvas" );
 
       
        gl = WebGLUtils.setupWebGL( canvas );
 
        if ( !gl ) { alert( "WebGL isn't available" ); }
 
        gl.viewport( 0, 0, canvas.width, canvas.height );
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LESS);
        gl.enable(gl.CULL_FACE);
 
        //
        //  Load shaders and initialize attribute buffers
        //
        program = initShaders( gl, "vertex-shader", "fragment-shader" );
 
        gl.useProgram(program);
 
        gl.clearColor(0.0, 0.0, 0.0, 0.);
 
        plane = new Plane(gridSize * size);
        plane.translate_x(halfsize + 10);
        plane.translate_z(halfsize + 10);


        eye = vec3(100 + totalSize, 200, 100 + totalSize);
        at = vec3(halfsize, -50, halfsize);
        up = vec3(0, 1, 0);
        near = 1;
        far = 2000.0;
        fovy = 75;
        aspect = gl.canvas.width / gl.canvas.height;
        modelViewMatrix = lookAt(eye, at , up);
        projectionMatrix = perspective(fovy, aspect, near, far);
        nMatrix = normalMatrix(modelViewMatrix, true);

        spotLight = vec3( -400, 900, 600 );
        spotLightAt = vec3(halfsize, 0, halfsize);
        spotLightCutOff = Math.cos(radians(30));

    
        for ( var i = 0, l = gridSize * gridSize; i < l; i ++ ) {

            cube = new Cube(size);
            cube.translate_x(size+ ( ( i % gridSize ) * 10 ));
            cube.translate_z(size + ( Math.floor( i / gridSize ) * 10));
            grid.push( cube );
        }
        
        vBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
       //gl.bufferData(gl.ARRAY_BUFFER, flatten(cube.get_vertices()), gl.STATIC_DRAW );

       vPosition = gl.getAttribLocation( program, "vPosition" );
       gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
       gl.enableVertexAttribArray( vPosition );


       normalsBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
        //gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);

        normalPosition = gl.getAttribLocation( program, "normal" );
        gl.vertexAttribPointer( normalPosition, 3, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray( normalPosition);

 
       fBuffer = gl.createBuffer();
       gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, fBuffer);
       gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(flatten(cube.get_draw_faces()))
       , gl.STATIC_DRAW);


    
       
       
        translationMatrixLoc = gl.getUniformLocation(program, "translationMatrix");
        modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
        projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
        normalMatrixLoc = gl.getUniformLocation(program, "normalMatrix");
        spotlightAtLoc = gl.getUniformLocation(program, "spotLightAt");
        cameraPositionLoc = gl.getUniformLocation(program, "cameraPosition");
        spotlightCutOffLoc = gl.getUniformLocation(program, "cutOff");
        

        gl.uniform1f(spotlightCutOffLoc, spotLightCutOff);
        gl.uniform3fv(spotlightAtLoc, spotLightAt);
        gl.uniform3fv(cameraPositionLoc, eye);
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
        gl.uniformMatrix4fv(translationMatrixLoc, false, flatten(mat4()));
        gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(nMatrix));



        var Ka = [1.0, 1.0];
        var Kd = [1.0, 1.0];
        var Ks = [1.0, 1.0];
        var shineness = [30, 25];
    
        var ambientColor = [vec3(1.0, 1.0, 1.0), vec3(0.5, 0.5, 0.5)]; 
        var diffuseColor = [vec3(1.0, 1.0, 1.0), vec3(1.0, 1.0, 1.0)];
        var specularColor = [vec3(1.0, 1.0, 1.0), vec3(1.0, 1.0, 1.0)];

        KaLocation = gl.getUniformLocation(program, "Ka");
        KdLocation = gl.getUniformLocation(program, "Kd");
        KsLocation = gl.getUniformLocation(program, "Ks");
        shinenessLocation = gl.getUniformLocation(program, "shineness");
    
        ambientColorLocation = gl.getUniformLocation(program, "ambientColor");
        diffuseColorLocation = gl.getUniformLocation(program, "diffuseColor");
        specularColorLocation = gl.getUniformLocation(program, "specularColor");
        lightPositionsLoc = gl.getUniformLocation(program, "lightPositions");



        gl.uniform1fv(KaLocation, flatten(Ka));
        gl.uniform1fv(KdLocation, flatten(Kd));
        gl.uniform1fv(KsLocation, flatten(Ks));
        gl.uniform1fv(shinenessLocation, flatten(shineness));

        gl.uniform3fv(lightPositionsLoc, spotLight);
        gl.uniform3fv(ambientColorLocation, flatten(ambientColor));
        gl.uniform3fv(diffuseColorLocation, flatten(diffuseColor));
        gl.uniform3fv(specularColorLocation, flatten(specularColor));
    





        mouse = vec3(0, 0, 1);
        canvas.addEventListener('mousemove', onCanvasMouseMove1, false);
 
       
 
 
        render();
 
     };

     onkeydown = function(ev) {
        if(ev.keyCode == 37) {
            translateByX -= 1;
        } else if(ev.keyCode == 39) {
            translateByX += 1;
        } else if(ev.keyCode == 38) {
            translateByY -= 1;
        } else if(ev.keyCode == 40) {
            translateByY += 1;
        }
        console.log(translateByX);
        gl.uniformMatrix4fv(translationMatrixLoc, false, flatten(rotate(translateByX, vec3(0, 1, 0))));
     };


     function onCanvasMouseMove1(event) {

        // Raycast

        var rect = canvas.getBoundingClientRect();
        mouse[0] = (event.clientX - rect.left) / gl.canvas.width * 2 - 1;
        mouse[1] = (event.clientY - rect.top) / gl.canvas.height * -2 + 1;


        var mat4World = mult(projectionMatrix, modelViewMatrix);
        mat4World = inverse(mat4World);

        var vec4Near = multVecByMatrix(vec4(mouse[0], mouse[1], -1.0, 1.0), flatten(mat4World));
    
        var vec4Far = multVecByMatrix(vec4(mouse[0], mouse[1], 1.0, 1.0), flatten(mat4World));

        for (var i = 0; i < 3; i++) {
            vec4Near[i] /= vec4Near[3];
            vec4Far[i] /= vec4Far[3]; 
        }

        var rayNear = vec3(vec4Near[0], vec4Near[1], vec4Near[2]);
        var rayFar = vec3(vec4Far[0], vec4Far[1], vec4Far[2]);


        line = [];
        line.push(vec3(0, -0.5, 0));
        line.push(vec3(eye[0], eye[1], eye[2]));
        line.push(vec3(0, -0.5, 0));
        line.push(vec3(0, 100, 0));

        line.push(rayNear);
        var end = getPointsOnAPlane(rayNear, rayFar);
        intersects[0] = end;

        line.push(end);
        // console.log(rayNear, rayFar);
     }

     function getPointsOnAPlane(rayStart, rayEnd) {
        var rayDelta = subtract(rayEnd, rayStart);
        var rayToPlaneDelta = subtract(planeOrigin, rayStart);

        var dotPlane = dot(rayToPlaneDelta, planeNorm);
        var dotRay = dot(rayDelta, planeNorm);
        var coeff = dotPlane / dotRay;
        var pos = add(scale(coeff, rayDelta), rayStart);
        return pos;

     }

     function drawCubes() {
         for ( var i = 0, l = gridSize * gridSize; i < l; i ++ ) {
            cube = grid[i];
                        
            gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(cube.get_vertices()), gl.STATIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(cube.get_normals()), gl.STATIC_DRAW);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, fBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(flatten(cube.get_draw_faces()))
            , gl.STATIC_DRAW);
            gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
        }


     }


     function futureRender() {

        // taken from 

        if ( intersects[0] ) {

            var point = intersects[ 0 ];
            var x = Math.floor( point[0] / size );
            var y = Math.floor( point[2] / size );

            buffer1[ x + y * gridSize ] = size;

        }


        // update buffers
        for ( var i = 0, l = gridSize * gridSize; i < l; i ++ ) {

            var x1, x2, y1, y2;

            if ( i % gridSize == 0 ) {

                // left edge

                x1 = 0;
                x2 = buffer1[ i + 1 ];

            } else if ( i % gridSize == gridSize - 1 ) {

                // right edge

                x1 = buffer1[ i - 1 ];
                x2 = 0;

            } else {

                x1 = buffer1[ i - 1 ];
                x2 = buffer1[ i + 1 ];

            }

            if ( i < gridSize ) {

                // top edge

                y1 = 0;
                y2 = buffer1[ i + gridSize ];

            } else if ( i > l - gridSize - 1 ) {

                // bottom edge

                y1 = buffer1[ i - gridSize ];
                y2 = 0;

            } else {

                y1 = buffer1[ i - gridSize ];
                y2 = buffer1[ i + gridSize ];

            }

            buffer2[ i ] = ( x1 + x2 + y1 + y2 ) / 1.9 - buffer2[ i ];
            buffer2[ i ] -= buffer2[ i ] / 10;

        }

        temp = buffer1;
        buffer1 = buffer2;
        buffer2 = temp;

        // update grid

        for ( var i = 0, l = gridSize * gridSize; i < l; i ++ ) {

            grid[ i ].scale.y += ( Math.max( 0.1, 0.1 + buffer2[ i ] ) - grid[ i ].scale.y ) * 0.3;
        }
 
        drawCubes();

    }

     function render() {
        gl.clear(gl.COLOR_BUFFER_BIT);
         requestAnimationFrame(render, canvas);
        
         futureRender();
        
     }