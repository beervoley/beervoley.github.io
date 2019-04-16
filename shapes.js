function get_cube(size) {
    var vertices = [
  // Передняя грань
  vec3(-0.5, -0.5,  0.5),
  vec3(0.5, -0.5,  0.5),
  vec3(0.5,  0.5,  0.5),
  vec3(-0.5,  0.5,  0.5),
  
  // Задняя грань
  vec3(-0.5, -0.5, -0.5),
  vec3(-0.5,  0.5, -0.5),
  vec3(0.5,  0.5, -0.5),
  vec3(0.5, -0.5, -0.5),
  
  // Верхняя грань
  vec3(-0.5,  0.5, -0.5),
  vec3(-0.5,  0.5,  0.5),
  vec3( 0.5,  0.5,  0.5),
  vec3(0.5,  0.5, -0.5),
  
  // Нижняя грань
  vec3(-0.5, -0.5, -0.5),
  vec3(0.5, -0.5, -0.5),
  vec3(0.5, -0.5,  0.5),
  vec3(-0.5, -0.5,  0.5),
  
  // Правая грань
  vec3(0.5, -0.5, -0.5),
  vec3(0.5,  0.5, -0.5),
  vec3(0.5,  0.5,  0.5),
  vec3(0.5, -0.5,  0.5),
  
  // Левая грань
  vec3(-0.5, -0.5, -0.5),
  vec3(-0.5, -0.5,  0.5),
  vec3(-0.5,  0.5,  0.5),
  vec3(-0.5,  0.5, -0.5)
];
    for(var i = 0; i < vertices.length; i++) {
        vertices[i] = vec3(vertices[i][0] * size, vertices[i][1] * size,
             vertices[i][2] * size);
    }
    return vertices;
}

function get_faces() {
    var faces = [
    vec4(0, 1, 2, 3), // front
    vec4(4, 5, 7, 6), // back
    vec4(8, 9, 11, 10), // top
    vec4(12, 13, 15, 14), // bottom
    vec4(16, 17, 19, 18), // right
    vec4(20, 21, 23, 22) // left
    ]; 
    return faces;
};

function get_faces_for_draw() {
    var cubeVertexIndices = [
        vec3(0,  1,  2),      vec3(0,  2,  3),    // front
        vec3(4,  5,  6),      vec3(4,  6,  7),    // back
        vec3(8,  9,  10),     vec3(8,  10, 11),   // top
        vec3(12, 13, 14),     vec3(12, 14, 15),   // bottom
        vec3(16, 17, 18),     vec3(16, 18, 19),   // right
        vec3(20, 21, 22),     vec3(20, 22, 23)    // left
      ];
    return cubeVertexIndices;
}


function get_colors() {
    var colors = [
    [1.0,  1.0,  1.0,  1.0],    // Front face: white
    [1.0,  0.0,  0.0,  1.0],    // Back face: red
    [0.0,  1.0,  0.0,  1.0],    // Top face: green
    [0.0,  0.0,  1.0,  1.0],    // Bottom face: blue
    [1.0,  1.0,  0.0,  1.0],    // Right face: yellow
    [1.0,  0.0,  1.0,  1.0]     // Left face: purple
  ];
  
  var generatedColors = [];
  
  for (var j=0; j<6; j++) {
    var c = colors[j];
    
    for (var i=0; i<4; i++) {
      generatedColors.push(c);
    }
  }
    return generatedColors;
  }


function get_plane_vertices(size) {
    vertices = [
        vec3(-0.5, -0.5, -0.5),
        vec3(-0.5, -0.5, 0.5),
        vec3(0.5, -0.5, 0.5),
        vec3(0.5, -0.5, -0.5)
    ];
    for(var i = 0; i < vertices.length; i++) {
        vertices[i] = vec3(vertices[i][0] * size, vertices[i][1],
             vertices[i][2] * size);
    }
    return vertices;
}

function get_plane_faces() {
    vertices = [
        vec3(0, 1, 2),
        vec3(2, 3, 0)
    ];
    return vertices;
}



class ScaleContainer {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}



class Plane {
    constructor(size) {
        this.vertices = get_plane_vertices(size);
        this.faces = get_plane_faces();
        this.normal = vec3(0, 1, 0);
    }
    get_faces() {
        return this.faces;
    }
    get_vertices() {
        return this.vertices;
    }
    translate_z(delta) {
        this.normal[0] += delta;
        for(var i = 0; i < this.vertices.length; i++) {
            this.vertices[i] = vec3(this.vertices[i][0], this.vertices[i][1],
                this.vertices[i][2] + delta, this.vertices[i][3]);
        }
       

    }
    translate_y(delta) {
        for(var i = 0; i < this.vertices.length; i++) {
            this.vertices[i] = vec3(this.vertices[i][0], this.vertices[i][1] + delta,
                this.vertices[i][2], this.vertices[i][3]);
        }
    }
    translate_x(delta) {
        this.normal[0] += delta;
        for(var i = 0; i < this.vertices.length; i++) {
            this.vertices[i] = vec3(this.vertices[i][0] + delta, this.vertices[i][1],
                this.vertices[i][2], this.vertices[i][3]);
        }
    }
}


class Cube {
    constructor(size) {
        this.vertices = get_cube(size);
        this.faces = get_faces();
        this.draw_faces = get_faces_for_draw();
        this.colors = get_colors();
        this.scale = new ScaleContainer(1, 1, 1);
        this.calculateNormals();
        
    }
    get_draw_faces() {
        return this.draw_faces;
    }
    get_colors() {
        return this.colors;
    }
    
    

    calculateNormals() {
        var normals = new Array(this.vertices.length);
  
        for (var j = 0; j < normals.length; j++) {
           normals[j] = [];
        }
        for(var i = 0; i < this.faces.length; i++) {
           var temp = this.faces[i];    
           var v1 = this.vertices[temp[0]];
           var v2 = this.vertices[temp[1]];
           var v3 = this.vertices[temp[2]];
           var e1 = subtract(v2, v1);
           var e2 = subtract(v3, v1);
           var normal = cross(e1, e2);
           normals[temp[0]] = normal;
           normals[temp[1]] = normal;
           normals[temp[2]] = normal;
           normals[temp[3]] = normal;
        }
      
        this.normals = normals;
  }
  get_normals() {
      return this.normals;
  }
    translate_z(delta) {
        for(var i = 0; i < this.vertices.length; i++) {
            this.vertices[i] = vec3(this.vertices[i][0], this.vertices[i][1],
                this.vertices[i][2] + delta, this.vertices[i][3]);
        }
        this.calculateNormals();

    }
    translate_y(delta) {
        for(var i = 0; i < this.vertices.length; i++) {
            this.vertices[i] = vec3(this.vertices[i][0], this.vertices[i][1] + delta,
                this.vertices[i][2], this.vertices[i][3]);
        }
        this.calculateNormals();
    }
    translate_x(delta) {
        for(var i = 0; i < this.vertices.length; i++) {
            this.vertices[i] = vec3(this.vertices[i][0] + delta, this.vertices[i][1],
                this.vertices[i][2], this.vertices[i][3]);
        }
        this.calculateNormals();
    }

    get_array_copy(arr) {
        var newArray = new Array(arr.length);

        for (var i = 0; i < arr.length; i++)
            newArray[i] = arr[i].slice();
        return newArray;
    }
    scaleVertices() {
        var arr = this.get_array_copy(this.vertices);
        for(var i = 0; i < arr.length; i++) {
            if(arr[i][1] > 0) {
            arr[i] = vec3(arr[i][0] * this.scale.x, arr[i][1] * this.scale.y * 2,
                arr[i][2] * this.scale.z);
            }
        }
        return arr;
        
        
    }



    get_vertices() {
        var scaled = this.scaleVertices();
        
        // this.scale.y = 1 ;
        return flatten(scaled);
    }
}


function multVecByMatrix(v, m){
    result = new Array(v.length);
    result[0] = m[0] * v[0] + m[4] * v[1] + m[8]	* v[2] + m[12] * v[3];
    result[1] = m[1] * v[0] + m[5] * v[1] + m[9]	* v[2] + m[13] * v[3];
    result[2] = m[2] * v[0] + m[6] * v[1] + m[10]	* v[2] + m[14] * v[3];
    result[3] = m[3] * v[0] + m[7] * v[1] + m[11]	* v[2] + m[15] * v[3];
    return result;
}