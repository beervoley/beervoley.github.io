function get_cube_vertices() {
	var vertices = [vec3(-1.0, -1.0,  1.0),
			vec3(1.0, -1.0,  1.0),
				vec3(1.0,  1.0,  1.0),
					vec3(-1.0,  1.0,  1.0),
		
		// Задняя грань
		vec3(-1.0, -1.0, -1.0),
			vec3(-1.0,  1.0, -1.0),
				vec3( 1.0,  1.0, -1.0),
					vec3( 1.0, -1.0, -1.0),
		
		// Верхняя грань
		vec3(-1.0,  1.0, -1.0),
			vec3(-1.0,  1.0,  1.0),
				vec3( 1.0,  1.0,  1.0),
					vec3( 1.0,  1.0, -1.0),
		
		// Нижняя грань
		vec3(-1.0, -1.0, -1.0),
			vec3( 1.0, -1.0, -1.0),
				vec3( 1.0, -1.0,  1.0),
					vec3(-1.0, -1.0,  1.0),
		
		// Правая грань
		vec3( 1.0, -1.0, -1.0),
			vec3(1.0,  1.0, -1.0),
				vec3( 1.0,  1.0,  1.0),
					vec3(1.0, -1.0,  1.0),
		
		// Левая грань
		vec3(-1.0, -1.0, -1.0),
			vec3(-1.0, -1.0,  1.0),
		vec3(-1.0,  1.0,  1.0),
			vec3(-1.0,  1.0, -1.0)];
  
  var matrix = scalem(1, 1, 1);
	for(var i = 0; i < vertices.length; i++) {
    vertices[i] = vec3(vertices[i][0] / 2, vertices[i][1] / 2, vertices[i][2] / 2);
	}
	return vertices;
}

function get_cube_faces() {
	// wireframe
	var cubeVertexIndices = [
			vec3(0,  1,  2), vec3(3, 0, 0),    // front
				vec3(4,  5,  6),      vec3(7,  4,  4),    // back
					vec3(8,  9,  10),     vec3(11,  8, 8),   // top
						vec3(12, 13, 14),     vec3(15, 12, 12),   // bottom
							vec3(16, 17, 18),     vec3(19, 16, 16),   // right
								vec3(20, 21, 22),     vec3(23, 20, 20)    // left
		  ];
	  return cubeVertexIndices;
}

function getBaseVertices(segments) {
    y=0; //The origin
    theta = (Math.PI/180) * (360/segments); //Degrees = radians * (180 / Ï€)
    cylinderBotVertices = [];
    cylinderTopVertices = [];
    cylinderSideVertices = [];


 
 
    for (i = 0; i <= segments; i++){

        x =  Math.cos(theta*i); 
        z =  Math.sin(theta*i);
 
       cylinderBotVertices.push(vec3(x, y, z)); //Bottomvertices
       //cylinderBotVertices.push(rbt, gbt, bbt, al); //Color for bottom vertices
 
       cylinderSideVertices.push(vec3(x, y, z)); //Sidevertices along the bottom
       //cylinderSideVertices.push(r,g,b,al); //Vertex color
       cylinderSideVertices.push(vec3(x, y+2, z)); //Sidevertices along the top with y = 2
       //cylinderSideVertices.push(r,g,b,al); //Vertex color
 
       cylinderTopVertices.push(vec3(x, y+2, z)); //Topvertices with y = 2
      // cylinderTopVertices.push(rbt, gbt, bbt, al); //Color for top vertices
    }
    return [cylinderBotVertices, cylinderTopVertices, cylinderSideVertices];
 }


