// Vertex shader program
var VSHADER_SOURCE =
 'attribute vec4 a_Position;\n' +
	'attribute vec4 a_Color;\n' +   
	'attribute vec4 a_Normal;\n' + 
	'attribute vec2 a_TexCoord;\n' +	
	'uniform mat4 u_MvpMatrix;\n' +
	'uniform bool u_Clicked;\n' + // Mouse is pressed
	'uniform vec3 u_LightColor;\n' +
	'uniform vec3 u_LightDirection;\n' +
	'varying vec4 v_Color;\n' +
	'varying vec2 v_TexCoord;\n' +
    'void main() {\n' +
	//'gl_Position =a_Position;\n' +
	'gl_Position = u_MvpMatrix * a_Position;\n' +
	 '  if (u_Clicked) {\n' + //  Draw in red if mouse is pressed
	'    v_Color = vec4(1.0, 0.0, 0.0, 1.0);\n' +
	'  } else {\n' +
	'    v_Color = a_Color;\n' +
	'}\n' +
    '  gl_PointSize = 5.0;\n' +
	'  v_TexCoord = a_TexCoord;\n' +
    '}\n';
// Fragment shader program
var FSHADER_SOURCE =
    '#ifdef GL_ES\n' +
	'precision mediump float;\n' +
  '#endif\n' +
  'uniform sampler2D u_Sampler;\n' +
 // 'varying vec4 v_Color;\n' +
   'varying vec2 v_TexCoord;\n' +
  'void main() {\n' +
  '  vec4 color = texture2D(u_Sampler, v_TexCoord);\n' +
'  gl_FragColor = color;\n' +
//'  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +
  '}\n';


var g_points = []; 
var polyLine = [];
var shape = [];
var line = []; 
var vertices = [];
var vertices2 = [];
var indexes = [];
var normals = [];
var flatColor = [];
var smoothColor = [];
var colorValues = [];
var normalsums = [];
var verticenormals = [];
var vectornormalsfinal=[];
var vectornormalscolor = [];
var zeroarray=[];
var colorValues2 = [];
var specsmooth = [];
var defaultline = [];
var nolight = [];
var pointlightColor = [];
var bothlightColor = [];
var temparray= [];
var texCoords = [];
var canvas;
var gl; 
var u_Clicked

var u_MvpMatrix; 
var mvpMatrix;
var texture;
var texProgram;
var cubeswitch = 1;
var lineswitch = 1;
var rightclicked = false; 
function main() {
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
	
	texProgram = createProgram(gl, VSHADER_SOURCE, FSHADER_SOURCE);
	if (!texProgram) {
    console.log('Failed to intialize shaders.');
    return;
  }
	
	
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // // Get the storage location of a_Position
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }
	var a_TexCoord = gl.getAttribLocation(texProgram, 'a_TexCoord');
	if (a_TexCoord < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }
	var u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
	 if (u_Sampler < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }
	
	// Get the storage location of u_MvpMatrix
	u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
	if (!u_MvpMatrix) {
    console.log('Failed to get the storage location of u_MvpMatrix');
    return;
	}
	
	
	
	// Set the eye point and the viewing volume
	mvpMatrix = new Matrix4();
	//mvpMatrix.setOrtho(-1.0, 1.0, -1.0, 1.0, -1.0, 1.0);
	mvpMatrix.setPerspective(20, 1, 1, 90);
	mvpMatrix.lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0);
	
	
	
	// Pass the model view projection matrix to u_MvpMatrix
	gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
	
	texture = initTextures(gl, texture, u_Sampler);
	if (!texture) {
    console.log('Failed to intialize the texture.');
		return;
	}
	
    // Register function (event handler) to be called on a mouse press
    canvas.onmousedown = function(ev) { click(ev, gl, canvas, a_Position);};
    canvas.onmousemove = function(ev) { noclick(ev, gl, canvas, a_Position);};
   
	canvas.addEventListener('contextmenu', function(e){
    if(e.button == 2){
		e.preventDefault();
		return false;
	}
	}, false);
      
    clearCanvas(gl, canvas); // Clear <canvas>
}


function setProj(button)
{
    if(button.value=="Perspective")
    {
        button.value="Orthographic";
		mvpMatrix.setOrtho(-1.0, 1.0, -1.0, 1.0, -1.0, 1.0);
		gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
		drawSOR(gl, vertices, indexes, texCoords, texture);
		
		//drawlightline(gl);
		//drawCube(gl);
		
		
    }
    else
    {
        button.value="Perspective";
		mvpMatrix.setPerspective(20, 1, 1, 90);
		mvpMatrix.lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0);
		gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
		drawSOR(gl, vertices, indexes, texCoords, texture);
		
		//drawlightline(gl);
		//drawCube(gl);
		
    }
}


function noclick(ev, gl, canvas, a_Position) {
	if (rightclicked == true) return;
	var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    //get the position of the <canvas> itself in client area
	var coordinate = canvascoords(ev, canvas, x, y);
	x = coordinate[0]; 
	y = coordinate[1];
	g_points.push(x); g_points.push(y);
  
  

  //gl.clear(gl.COLOR_BUFFER_BIT);
  

  var len = g_points.length;
  

  var vertices = new Float32Array(g_points); 

  var n = len/2; 
  

  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }

  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

  gl.enableVertexAttribArray(a_Position);

  gl.drawArrays(gl.LINE_STRIP, 0, n);
  gl.drawArrays(gl.POINTS, 0, n);  
  g_points.pop(x); g_points.pop(y);
	
} 

function click(ev, gl, canvas, a_Position) {
    gl.clear(gl.COLOR_BUFFER_BIT);
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    //get the position of the <canvas> itself in client area
	var coordinate = canvascoords(ev, canvas, x, y);
	x = coordinate[0]; 
	y = coordinate[1];
	g_points.push(x); g_points.push(y);
	console.log(x,y);
	polyLine.push(new coord(x,y,0.0));
	//line.push(new coord(x,y,0.0)); //line is an array of multiple coordinates
	//console.log(JSON.stringify(polyLine)); 
	
    //If  left click
    if (ev.which == 1) {
		
		
		console.log(JSON.stringify(polyLine));
		// Create a buffer object
        var vertexBuffer = gl.createBuffer();
        if (!vertexBuffer) {
            console.log('Failed to create the buffer object');
            return -1;
		}	
			
		// Bind the buffer object to target
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        // Write date into the buffer object, convert g_points into float32array
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(g_points), gl.STATIC_DRAW);

        var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
        if (a_Position < 0) {
            console.log('Failed to get the storage location of a_Position');
            return -1;
        }

        // Assign the buffer object to a_Position variable
        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

        // Enable the assignment to a_Position variable
        gl.enableVertexAttribArray(a_Position);
		
		var len = g_points.length;   //total length of g_points array
        for (var i = 0; i < len; i += 2) {
            // Pass the position of a point to a_Position variable
            gl.vertexAttrib3f(a_Position, g_points[i], g_points[i + 1], 0.0);
        }
		
		n = g_points.length / 2; 
        gl.drawArrays(gl.POINTS, 0, n);
		gl.drawArrays(gl.LINE_STRIP, 0, n);
	
	//if right click 
	} else if (ev.which == 3) {
		rightclicked=true;
	
		shape.push(polyLine); //shape is array of a bunch of polylines, polyline currently only contains initial vertex coordinates (before rotation)
		
		generateSOR(shape); 
		
		calcVerticessmooth(gl, shape); 
		
			
		
		for (i =0; i < colorValues.length; i++){
			colorsum = colorValues[i]+ pointlightColor[i];
			bothlightColor.push(colorsum);
		}
		for (i =0; i < colorValues.length; i++){
			nolight.push(1.0, 0.0, 0.0);
		}
		console.log(texture);
		calcvertexnormals(gl, shape);
		//drawSOR(gl, vertices, indexes, bothlightColor);
		drawSOR(gl, vertices, indexes, texCoords, texture);
		//drawSOR(gl, vertices, indexes, smoothColor);
		
		
		
		
		//canvas.onmousedown = function(ev) {  pickObject(ev, canvas) // Mouse is pressed
	
			
			
		//}
			
	}
}


function initTextures(gl, texture, u_Sampler) {
  var texture = gl.createTexture();   // Create a texture object
  if (!texture) {
    console.log('Failed to create the texture object');
    return null;
  }

  var image = new Image();  // Create a image object
  if (!image) {
    console.log('Failed to create the image object');
    return null;
  }
  // Tell the browser to load an Image
  
  // Register the event handler to be called when image loading is completed
  image.onload = function() {
	  console.log(image);
    // Write the image data to texture object
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);  // Flip the image Y coordinate
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    // Pass the texure unit 0 to u_Sampler
    //gl.useProgram(program);
    gl.uniform1i(u_Sampler, 0);

    gl.bindTexture(gl.TEXTURE_2D, null); // Unbind texture
  };

  image.src = 'sky.jpg';

  return texture;
}

function drawSOR(gl, vertices, indexes, texCoords, texture){
	
	

	
	var indexBuffer = gl.createBuffer();
		if (!indexBuffer) 
		return -1;

	
	// Write the vertex coordinates and color to the buffer object
	
	if (!initArrayBuffer(gl, new Float32Array(vertices), 3, gl.FLOAT, 'a_Position')) return -1;
	if (!initArrayBuffer(gl, new Float32Array(texCoords), 2, gl.FLOAT, 'a_TexCoord')) return -1;
	
	//if (!initArrayBuffer(gl, new Float32Array(normals), 3, gl.FLOAT, 'a_Normal')) return -1;
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexes), gl.STATIC_DRAW);
	
	var n = indexes.length; 
	//gl.clearColor(1.0, 1.0, 1.0, 1.0);
	gl.enable(gl.DEPTH_TEST);
		
	// Clear color and depth buffer
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	console.log(texture);
	 // Bind texture object to texture unit 0
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
	// Draw the cube
	gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0);
	
	
	
	
}

function initArrayBuffer(gl, data, num, type, attribute) {
	var buffer = gl.createBuffer();   // Create a buffer object
	if (!buffer) {
		console.log('Failed to create the buffer object');
		return false;
	}
	// Write date into the buffer object
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
	// Assign the buffer object to the attribute variable
	var a_attribute = gl.getAttribLocation(gl.program, attribute);
	if (a_attribute < 0) {
		console.log('Failed to get the storage location of ' + attribute);
		return false;
	}
	gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
	// Enable the assignment of the buffer object to the attribute variable
	gl.enableVertexAttribArray(a_attribute);

	return true;
}

function calcVerticessmooth(gl, shape){
//var gloss = 0;
numfaces = shape[0].length-1;
console.log(numfaces);
    for (var i = 0; i < shape[0].length - 1; i++) {
		
		
		
		
        for (j = 0; j < shape.length - 1; j++) {
			
			var index = (vertices.length / 3);

            var currentLine = shape[j];
            var nextLine = shape[j + 1];
			
			
            vertices.push(currentLine[i].x, currentLine[i].y, currentLine[i].z);
            vertices.push(currentLine[i + 1].x, currentLine[i + 1].y, currentLine[i + 1].z);
		
            vertices.push(nextLine[i + 1].x, nextLine[i + 1].y, nextLine[i + 1].z);
            vertices.push(nextLine[i].x, nextLine[i].y, nextLine[i].z);
			
			indexes.push(index, index + 1, index + 2);
            indexes.push(index, index + 2, index + 3);
			console.log(i);
		
			texCoords.push( 1-j/36 , (numfaces-i)/numfaces,
				(1-j/36),(numfaces-(i+1))/numfaces , 
				1-(j+1)/36, (numfaces-(i+1))/numfaces,
				1-(j+1)/36, (numfaces-i)/numfaces 
				);
			
			//var lightDirection = new Vector3([1,1,1]);
			var lightDirection = new Vector3([1,1,1]);
			lightDirection.normalize();
			
			nor = calculatenormals(currentLine[i], currentLine[i+1], nextLine[i]);
			
			dot = nor.elements[0] * lightDirection.elements[0] + nor.elements[1] * lightDirection.elements[1] + nor.elements[2] * lightDirection.elements[2];
			colorValues.push(dot * 1.0); colorValues.push(dot * 0.0); colorValues.push(dot * 0.0);
			colorValues.push(dot * 1.0); colorValues.push(dot * 0.0); colorValues.push(dot * 0.0);
			colorValues.push(dot * 1.0); colorValues.push(dot * 0.0); colorValues.push(dot * 0.0);
			colorValues.push(dot * 1.0); colorValues.push(dot * 0.0); colorValues.push(dot * 0.0);
			
			
			drawnormallines(currentLine[i], currentLine[i+1], nor);
			
			//normalrow.push(new coord (nor.elements[0], nor.elements[1], nor.elements[2]));
		
		}		
	}		
	
}






function calcvertexnormals(gl, shape){
    for (var i = 0; i < shape[0].length - 1; i++) {
		for (j = 0; j < shape.length - 1; j++) {
			
			if (j-1 >= 0 ){
				var previousLine = shape[j -1];
				
			}else{
				var previousLine = shape[j +35];
			}
			
			var currentLine = shape[j];
			
			var nextLine = shape[j + 1];
			
			if (j+2 > shape.length - 1){
				var thirdLine = shape[j - 34];
			}else{
				var thirdLine = shape[j + 2];
			}
			
			
		
			if (i-1 >= 0){
				nor1 = calculatenormals(previousLine[i-1], previousLine[i], currentLine[i-1]);
			}else{
				nor1 = calculatenormals(0.0 , 0.0, 0.0);
			}
			
			nor2 = calculatenormals(previousLine[i], previousLine[i+1], currentLine[i]);
			
			if (i+2 <= shape[0].length - 1){
				nor3 = calculatenormals(previousLine[i+1], previousLine[i+2], currentLine[i+1]);
			}else{
				nor3 = calculatenormals(0.0 , 0.0, 0.0);
			}
			
			if (i-1 >= 0){
				nor4 = calculatenormals(currentLine[i-1], currentLine[i], nextLine[i-1]);
			}else{
				nor4 = calculatenormals(0.0 , 0.0, 0.0);
			}
			
			nor5 = calculatenormals(currentLine[i], currentLine[i+1], nextLine[i]);
			
			if (i+2 <= shape[0].length - 1){
				nor6 = calculatenormals(currentLine[i+1], currentLine[i+2], nextLine[i+1]);
			}else{
				nor6 = calculatenormals(0.0 , 0.0, 0.0);
			}
			
			if (i-1 >= 0){
				nor7 = calculatenormals(nextLine[i-1], nextLine[i], thirdLine[i-1]);
			}else{
				nor7 = calculatenormals(0.0 , 0.0, 0.0);
			}
			
			nor8 = calculatenormals(nextLine[i], nextLine[i+1], thirdLine[i]);
			
			
			if (i+2 <= shape[0].length - 1){
				nor9 = calculatenormals(nextLine[i+1], nextLine[i+2], nextLine[i+1]);
			}else{
				nor9 = calculatenormals(0.0 , 0.0, 0.0);
			}
			
			norsum1 = new Vector3([nor1.elements[0] + nor2.elements[0] + nor4.elements[0]+ nor5.elements[0], nor1.elements[1] + nor2.elements[1] + nor4.elements[1]+ nor5.elements[1], nor1.elements[2] + nor2.elements[2] + nor4.elements[2]+ nor5.elements[2]]);
			norsum1.normalize();
			norsum2 = new Vector3([nor2.elements[0] + nor3.elements[0] + nor5.elements[0]+ nor6.elements[0], nor2.elements[1] + nor3.elements[1] + nor5.elements[1]+ nor6.elements[1], nor2.elements[2] + nor3.elements[2] + nor5.elements[2]+ nor6.elements[2]]);
			norsum2.normalize();
			norsum3 = new Vector3([nor4.elements[0] + nor5.elements[0] + nor7.elements[0]+ nor8.elements[0], nor4.elements[1] + nor5.elements[1] + nor7.elements[1]+ nor8.elements[1], nor4.elements[2] + nor5.elements[2] + nor7.elements[2]+ nor8.elements[2]]);
			norsum3.normalize();
			norsum4 = new Vector3([nor5.elements[0] + nor6.elements[0] + nor8.elements[0]+ nor9.elements[0], nor5.elements[1] + nor6.elements[1] + nor8.elements[1]+ nor9.elements[1], nor5.elements[2] + nor6.elements[2] + nor8.elements[2]+ nor9.elements[2]]);
			norsum4.normalize();
			
			var lightDirection = new Vector3([1.0, 1.0, 1.0]);
			lightDirection.normalize();
			
			dot1 = norsum1.elements[0] * lightDirection.elements[0] + norsum1.elements[1] * lightDirection.elements[1] + norsum1.elements[2] * lightDirection.elements[2];
			smoothColor.push(dot1 * 1.0, dot1 * 0.0, dot1 * 0.0);
			dot2 = norsum2.elements[0] * lightDirection.elements[0] + norsum2.elements[1] * lightDirection.elements[1] + norsum2.elements[2] * lightDirection.elements[2];
			smoothColor.push(dot2 * 1.0, dot2 * 0.0, dot2 * 0.0);
			dot4 = norsum4.elements[0] * lightDirection.elements[0] + norsum4.elements[1] * lightDirection.elements[1] + norsum4.elements[2] * lightDirection.elements[2];
			smoothColor.push(dot4 * 1.0, dot4 * 0.0, dot4 * 0.0);
			dot3 = norsum3.elements[0] * lightDirection.elements[0] + norsum3.elements[1] * lightDirection.elements[1] + norsum3.elements[2] * lightDirection.elements[2];
			smoothColor.push(dot3 * 1.0, dot3 * 0.0, dot3 * 0.0);
			
		}
	}	
		
}		
	





function calculatenormals(p0, p1, p2){
	var a = new coord(p2.x - p0.x, p2.y - p0.y, p2.z - p0.z); 
	var b = new coord(p1.x - p0.x, p1.y - p0.y, p1.z - p0.z);
	
	var c = new coord(a.y*b.z - a.z*b.y,a.z*b.x - a.x*b.z, a.x*b.y - a.y*b.x )	;	
	//normalrow.push(a.y*b.z - a.z*b.y,a.z*b.x - a.x*b.z, a.x*b.y - a.y*b.x);
	var n = new Vector3([c.x, c.y, c.z]);
	
	n.normalize();

	return n; 
	
	
}
function normalSums(normals){
	for (i = 0; i < normals[0].length; i ++ ) {
			zeroarray.push(new coord(0.0, 0.0, 0.0));
		}
	normals.unshift(zeroarray);
	normals.push(zeroarray);
	
	vectornormals=[];
	for (j=0; j<normals.length-1; j++){
	
		vectornormalz=[];
		for (i =0; i < normals[0].length-1; i++){
			var currentrow = normals[j];
			
			var nextrow = normals[j+1];
			
			sum = new coord(currentrow[i].x + currentrow[i+1].x + nextrow[i+1].x + nextrow[i].x, currentrow[i].y + currentrow[i+1].y + nextrow[i+1].y + nextrow[i].y, currentrow[i].z + currentrow[i+1].z + nextrow[i+1].z + nextrow[i].z)
			
			var vnor = new Vector3([sum.x, sum.y, sum.z]);
			
			
			vnor.normalize();
			
			
		
			
			//console.log(vnor);
			vectornormalz.push(new coord(vnor.elements[0], vnor.elements[1], vnor.elements[2]));
			
		}
		vectornormals.push(vectornormalz);
	}
	console.log(normals);
	console.log(vectornormals);
	return vectornormals;
	
}

function drawnormallines(p1, p2, nor){
	x1 = (p1.x + p2.x)/2; 
	y1 = (p1.y + p2.y)/2; 
	z1 = (p1.z + p2.z)/2; 
	vectornormalsfinal.push(x1, y1, z1);
			
	vectornormalsfinal.push(x1 + nor.elements[0], y1 + nor.elements[1], z1 + nor.elements[2])  
			
}

function calcVertices(gl, shape){
    for (var i = 0; i < shape[0].length - 1; i++) {
        for (j = 0; j < shape.length - 1; j++) {
         
			var index = (vertices.length / 3);

            var currentLine = shape[j];
            var nextLine = shape[j + 1];
			
            vertices.push(currentLine[i].x, currentLine[i].y, currentLine[i].z);
            vertices.push(currentLine[i + 1].x, currentLine[i + 1].y, currentLine[i + 1].z);
			
            vertices.push(nextLine[i + 1].x, nextLine[i + 1].y, nextLine[i + 1].z);
            vertices.push(nextLine[i].x, nextLine[i].y, nextLine[i].z);
			
			indexes.push(index, index + 1, index + 2);
            indexes.push(index, index + 2, index + 3);
			
			var lightDirection = new Vector3([1.0, 1.0, -1.0]);
			lightDirection.normalize();
			
			nor = calculatenormals(currentLine[i], currentLine[i+1], nextLine[i]);
			
			spec = addspecular(nor);
			dot = nor.elements[0] * lightDirection.elements[0] + nor.elements[1] * lightDirection.elements[1] + nor.elements[2] * lightDirection.elements[2];
			
			colorValues.push(dot * 0.0); colorValues.push(dot * 1.0); colorValues.push(dot * 0.0);
			colorValues.push(dot * 0.0); colorValues.push(dot * 1.0); colorValues.push(dot * 0.0);
			colorValues.push(dot * 0.0); colorValues.push(dot * 1.0); colorValues.push(dot * 0.0);
			colorValues.push(dot * 0.0); colorValues.push(dot * 1.0); colorValues.push(dot * 0.0);
			
			colorValues2.push(dot * spec*0.00001 ); colorValues2.push(dot * 1.0+ spec); colorValues2.push(dot * spec*0.00001);
			colorValues2.push(dot * spec*0.00001 ); colorValues2.push(dot * 1.0+ spec); colorValues2.push(dot * spec*0.00001 );
			colorValues2.push(dot * spec*0.00001 ); colorValues2.push(dot * 1.0+ spec); colorValues2.push(dot * spec*0.00001 );
			colorValues2.push(dot * spec*0.00001); colorValues2.push(dot * 1.0+ spec); colorValues2.push(dot * spec*0.00001 );
			}
			
	}
	
	
	
	console.log(colorValues);
	console.log(colorValues2);
}







function generateSOR(shape) {

    var x, y, z;
    var radians;
    var currentLine;
	//console.log(JSON.stringify(shape[0]));
	
    for (var angle = 10; angle <= 360; angle += 10) {
        radians = ((angle * Math.PI) / 180);
        polyLine = [];
        currentLine = shape[0];
		
        for (var i = 0; i < currentLine.length; i++) {
            var coordIterator = currentLine[i]; 
            x = (Math.cos(radians) * coordIterator.x) - (Math.sin(radians) * coordIterator.z);
            y = coordIterator.y;
            z = (Math.cos(radians) * coordIterator.z) + (Math.sin(radians) * coordIterator.x);
            polyLine.push(new coord(x, y, z));
			
			
        }
        shape.push(polyLine);
    }	
}		

function calcglossiness(){
for (i=0; i<verticenormals.length ; i+=3){
		
	dot = verticenormals[i] * lightDirection.elements[0] + verticenormals[i+1] * lightDirection.elements[1] + verticenormals[i+2] * lightDirection.elements[2];
		
	smoothColor.push(dot * 0.0); smoothColor.push(dot * 1.0); smoothColor.push(dot * 0.0);
		
	norv = new Vector3([verticenormals[i], verticenormals[i+1], verticenormals[i+2]]);
		console.log(norv);
		spec = addspecular(norv, gloss); 
		console.log(spec);
		colorValues2.push(dot * 0.0 + spec*0.1); colorValues2.push(dot * 1.0 + spec); colorValues2.push(dot * 0.0 + spec*0.1);
}
}

function addspecular(verticenormals, smoothcolor,  gloss){
	specarray = [];
	console.log(gloss); 
	var half = new Vector3([0,0,1]);
	half.normalize();
	halfway = [half.elements[0], half.elements[1], half.elements[2]]
	console.log(half);
	//console.log(nor);
	for (i=0; i<verticenormals.length ; i += 3 ){
		
		ndoth = verticenormals[i] * halfway[0] + verticenormals[i+1] * halfway[1] + verticenormals[i+2]* halfway[2]; 
		
		spec = Math.pow(Math.max(ndoth, 0.0), gloss);
		
		specarray.push(spec*0+0);
		specarray.push(spec*1+0);
		specarray.push(spec*0+0.2);
	}
	
	for (i=0; i<smoothColor.length; i++  ){
			a = ( specarray[i]) + smoothColor[i];
			
			colorValues2.push(a);
		
	}
	
	
}
	


function drawlightline(gl){
	
	var vertices = new Float32Array([
    0.0, 0.0, 0.0,   500.0, 500.0, 500.0
  ]);
  var n = 2; // The number of vertices
	var indexBuffer = gl.createBuffer();
		if (!indexBuffer) 
		return -1;

	
	
	// Write the vertex coordinates and color to the buffer object
	
	if (!initArrayBuffer(gl, new Float32Array(vertices), 3, gl.FLOAT, 'a_Position')) return -1;
	//if (!initArrayBuffer(gl, new Float32Array(defaultline), 3, gl.FLOAT, 'a_Color')) return -1;
	
	//if (!initArrayBuffer(gl, new Float32Array(normals), 3, gl.FLOAT, 'a_Normal')) return -1;
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexes), gl.STATIC_DRAW);
	
	var n = indexes.length; 

	gl.enable(gl.DEPTH_TEST);
	
	

	if (!initArrayBuffer(gl, new Float32Array(vectornormalsfinal), 3, gl.FLOAT, 'a_Position')) return -1;
	//if (!initArrayBuffer(gl, new Float32Array(vectornormalscolor), 3, gl.FLOAT, 'a_Color')) return -1;
	gl.drawArrays(gl.LINES, 0, vertices.length/3);
}


function drawCube(gl) {
	//    v6----- v5
	//   /|      /|
	//  v1------v0|
	//  | |     | |
	//  | |v7---|-|v4
	//  |/      |/
	//  v2------v3
  var vertices = new Float32Array([   // Coordinates
	0.1, 1.0, 0.1,  -0.1, 0.8, 0.1,  -0.1,0.8, 0,   0.1,0.8, 0, // v0-v1-v2-v3 front
     0.1, 1.0, 0.1,   0.1,0.8, 0.1,   0.1,0.8,-0.1,   0.1, 1.0,-0.1, // v0-v3-v4-v5 right
     0.1, 1.0, 0.1,   0.1, 1.0,-0.1,  -0.1, 1.0,-0.1,  -0.1, 1.0, 0.1, // v0-v5-v6-v1 up
    -0.1, 1.0, 0.1,  -0.1, 1.0,-0.1,  -0.1, 0.8 ,-0.1,  -0.1,0.8, 0.1, // v1-v6-v7-v2 left
    -0.1, 0.8,-0.1,   0.1, 0.8,-0.1,   0.1, 0.8, 0.1,  -0.1, 0.8, 0.1, // v7-v4-v3-v2 down
     0.1, 0.8,-0.1,  -0.1,0.8 ,-0.1,  -0.1, 1.0,-0.1,   0.1, 1.0,-0.1  // v4-v7-v6-v5 back
	 /*
    50.0, 500.0, 50.0,  0.0, 500.0, 50.0,  0.0, 450.0, 50.0,  50.0, 450.0, 50.0, // v0-v1-v2-v3 front
    50.0, 500.0, 50.0,  50.0, 450.0, 50.0,  50.0, 450.0, 0.0,  50.0, 500.0, 0.0,   // v0-v3-v4-v5 right
    0.0, 500.0, 50.0,  50.0, 500.0, 0.0,  0.0, 500.0, 0.0,  0.0, 500.0, 50.0, // v0-v5-v6-v1 up
    0.0, 500.0, 50.0,  0.0, 500.0, 0.0,  0.0, 450.0, 0.0,  0.0, 450.0, 50.0,  // v1-v6-v7-v2 left
    0.0, 450.0, 0.0,  50.0, 450.0, 0.0,  50.0, 450.0, 50.0,  0.0, 450.0, 50.0,  // v7-v4-v3-v2 down
    50.0, 450.0, 0.0,  0.0, 450.0, 0.0,  0.0, 500.0, 0.0,  50.0, 500.0, 0.0 // v4-v7-v6-v5 back
	*/
  ]);


  var colors = new Float32Array([    // Colors
    1, 1, 0,   1, 1, 0,   1, 1, 0,  1, 1, 0,     // v0-v1-v2-v3 front
    1, 1, 0,   1, 1, 0,   1, 1, 0,  1, 1, 0,        // v0-v3-v4-v5 right
   1, 1, 0,   1, 1, 0,   1, 1, 0,  1, 1, 0,       // v0-v5-v6-v1 up
   1, 1, 0,   1, 1, 0,   1, 1, 0,  1, 1, 0,        // v1-v6-v7-v2 left
   1, 1, 0,   1, 1, 0,   1, 1, 0,  1, 1, 0,       // v7-v4-v3-v2 down
    1, 1, 0,   1, 1, 0,   1, 1, 0,  1, 1, 0,      // v4-v7-v6-v5 back
 ]);


  var normals = new Float32Array([    // Normal
    0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
    1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
    0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
   -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
    0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
    0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 back
  ]);


  // Indices of the vertices
  var indices = new Uint8Array([
     0, 1, 2,   0, 2, 3,    // front
     4, 5, 6,   4, 6, 7,    // right
     8, 9,10,   8,10,11,    // up
    12,13,14,  12,14,15,    // left
    16,17,18,  16,18,19,    // down
    20,21,22,  20,22,23     // back
 ]);


  // Write the vertex property to buffers (coordinates, colors and normals)
  if (!initArrayBuffer(gl,  vertices, 3, gl.FLOAT, 'a_Position')) return -1;
  if (!initArrayBuffer(gl,  colors, 3, gl.FLOAT, 'a_Color')) return -1;
 // if (!initArrayBuffer(gl, normals, 3, gl.FLOAT, 'a_Normal')) return -1;

  // Write the indices to the buffer object
  var indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
    console.log('Failed to create the buffer object');
    return false;
  }

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  n =  indices.length;
  
  gl.enable(gl.DEPTH_TEST);
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}

	
function drawnormalsSOR(gl, vertices, indexes, color, vectornormalsfinal, vectornormalscolor){

	
	var indexBuffer = gl.createBuffer();
		if (!indexBuffer) 
		return -1;

	
	
	// Write the vertex coordinates and color to the buffer object
	
	if (!initArrayBuffer(gl, new Float32Array(vertices), 3, gl.FLOAT, 'a_Position')) return -1;
	if (!initArrayBuffer(gl, new Float32Array(color), 3, gl.FLOAT, 'a_Color')) return -1;
	
	//if (!initArrayBuffer(gl, new Float32Array(normals), 3, gl.FLOAT, 'a_Normal')) return -1;
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexes), gl.STATIC_DRAW);
	
	var n = indexes.length; 
	//gl.clearColor(1.0, 1.0, 1.0, 1.0);
	gl.enable(gl.DEPTH_TEST);
		
	// Clear color and depth buffer
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// Draw the cube
	gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0);
	//gl.drawArrays(gl.LINE_STRIP, 0, vertices.length/3);
	
	
	
	for (i = 0; i < vectornormalsfinal.length; i ++){ 
		vectornormalscolor.push(1.0, 0.0, 0.0);
	}
	if (!initArrayBuffer(gl, new Float32Array(vectornormalsfinal), 3, gl.FLOAT, 'a_Position')) return -1;
	if (!initArrayBuffer(gl, new Float32Array(vectornormalscolor), 3, gl.FLOAT, 'a_Color')) return -1;
	gl.drawArrays(gl.LINES, 0, vectornormalsfinal.length/3);
	
	
}





function coord(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
}

//return canvas coordinates 
function canvascoords(ev, canvas, xVal, yVal) {
    var rect = ev.target.getBoundingClientRect();
    var xyposition = [(((xVal - rect.left) - canvas.width / 2) / (canvas.width / 2)), ((canvas.height / 2 - (yVal - rect.top)) / (canvas.height / 2))];
	return xyposition; 
}
  

// function that clears the canvas
function clearCanvas(gl, canvas) {
    gl = getWebGLContext(canvas);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
}


function toggle(button){
    if(button.value=="ON")
    {
        button.value="OFF";
		
		drawSOR(gl, vertices, indexes, smoothColor);
		
		
    }
    else{
		button.value="ON";

		drawSOR(gl, vertices, indexes, colorValues);
		
		
		return;
    }
}

function Glossiness(shininessVal){
	colorValues2 = [];
	gloss = shininessVal.value;	
	console.log(gloss);
	
	addspecular(verticenormals, smoothColor,  gloss);
	drawSOR(gl, vertices, indexes, colorValues2);
}


function shownormals(button){
    if(button.value=="OFF")
    {
        button.value="ON";
		drawnormalsSOR(gl, vertices, indexes, colorValues, vectornormalsfinal, vectornormalscolor)
		
    }
    else{
		button.value="OFF";
		
		
		
		drawSOR(gl, vertices, indexes, colorValues);
		
		
		return;
    }
}

