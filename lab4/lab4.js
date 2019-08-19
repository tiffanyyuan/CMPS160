// Vertex shader program
var VSHADER_SOURCE =
 'attribute vec4 a_Position;\n' +
	'attribute vec4 a_Color;\n' +   
	'attribute vec4 a_Normal;\n' +   
	'uniform mat4 u_MvpMatrix;\n' +
	'uniform mat4 u_modelMatrix;\n' +
	'uniform mat4 u_ProjMatrix;\n' +
	'uniform bool u_Clicked;\n' + // Mouse is pressed
	'uniform vec3 u_LightColor;\n' +
	'uniform vec3 u_LightDirection;\n' +
	'varying vec4 v_Color;\n' +
    'void main() {\n' +
	//'gl_Position =a_Position;\n' +
	'gl_Position =  u_MvpMatrix * a_Position * u_modelMatrix;\n' +
	 '  if (u_Clicked) {\n' + //  Draw in red if mouse is pressed
	'    v_Color = vec4(1.0, 0.0, 0.0, 1.0);\n' +
	'  } else {\n' +
	'    v_Color = a_Color;\n' +
	'}\n' +
    '  gl_PointSize = 5.0;\n' +
	'  v_Color = a_Color;\n' +
    '}\n';
// Fragment shader program
var FSHADER_SOURCE =
    '#ifdef GL_ES\n' +
	'precision mediump float;\n' +
  '#endif\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
'  gl_FragColor = v_Color;\n' +
//'  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +
  '}\n';

var currentPolygons=[];
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
var canvas;
var gl; 
var u_Clicked

var u_MvpMatrix; 
var mvpMatrix;
var projMatrix;
var cubeswitch = 1;
var lineswitch = 1;
var perspective = 1;
var picked = 0;
polygonCount=0;
polygonColors = [[1,0,0], [0,1,0], [0,0,1], [0.5,0,0], [0, 0.5, 0], [0, 0, 0.5], [0.5, 0, 0.5],[1,1,0], [0,1,1], [1,0,1]];

var gray = [0.5, 0.5, 0.5];
var red = [1.0, 0.0, 0.0]
var initialfov = 30;
var mousedown = false;
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
	
	// Get the storage locations
	var u_Clicked = gl.getUniformLocation(gl.program, 'u_Clicked');
	  if (!u_Clicked) { 
    console.log('Failed to get the storage location of uniform variable');
    return;
	}
	u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
	if (!u_MvpMatrix) {
    console.log('Failed to get the storage location of u_MvpMatrix');
    return;
	}
	u_modelMatrix = gl.getUniformLocation(gl.program, 'u_modelMatrix');
	if (!u_modelMatrix) {
    console.log('Failed to get the storage location of u_MvpMatrix');
    return;
	}
	
	// Set the eye point and the viewing volume
	mvpMatrix = new Matrix4();
	modelMatrix= new Matrix4();
	//modelMatrix.setRotate(-10, 0, 0, 1)
	//mvpMatrix.setOrtho(-500.0, 500.0, -500.0, 500.0, -500.0, 500.0);
	mvpMatrix.setPerspective(30, 1, 1, 10000);

	mvpMatrix.lookAt(1000, 1000, 2000, 0, 0, 0, 0, 1000, 0);
	
	
	gl.uniform1i(u_Clicked, 0); // Pass false to u_Clicked
	gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
	gl.uniformMatrix4fv(u_modelMatrix, false, modelMatrix.elements);	
	
    // Register function (event handler) to be called on a mouse press
    canvas.onmousedown = function(ev) { click(ev, gl, canvas, a_Position);};
	canvas.onmousemove = function(ev){ noclick(ev, gl, canvas, a_Position); }; 
	
	
    setupIOSOR("fileinput");
   
	canvas.addEventListener('contextmenu', function(e){
    if(e.button == 2){
		e.preventDefault();
		return false;
	}
	}, false);
      
    //clearCanvas(gl, canvas); // Clear <canvas>
}


function setProj(button)
{
    if(button.value=="Perspective")
    {
        button.value="Orthographic";
		
		mvpMatrix.setOrtho(-500.0, 500.0, -500.0, 500.0, -500.0, 500.0);
		gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
		for (i = 0; i < currentPolygons.length; i ++){ 
			drawSOR(gl, currentPolygons[i].vertices, currentPolygons[i].indexes, currentPolygons[i].colors);
		}
		drawlightline(gl);
		drawCube(gl);
		perspective = 0;
		
		
    }
    else
    {
        button.value="Perspective";
		
		mvpMatrix.setPerspective(30, 1, 1, 10000);
		mvpMatrix.lookAt(1000, 1000, 2000, 0, 0, 0, 0, 1000, 0);
		gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
		for (i = 0; i < currentPolygons.length; i ++){ 
			drawSOR(gl, currentPolygons[i].vertices, currentPolygons[i].indexes, currentPolygons[i].colors);
		}
		drawlightline(gl);
		drawCube(gl);
		perspective = 1;
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
		rightclicked = true;
		console.log("points" + JSON.stringify(polyLine));
		shape.push(polyLine); //shape is array of a bunch of polylines, polyline currently only contains initial vertex coordinates (before rotation)
		drawlightline(gl);
		generateSOR(shape); 
		console.log(shape);
		console.log(shape.length-1);
		calcVerticessmooth(gl, shape, red); 
		calcPointLight(gl, shape);
		
		for (i =0; i < colorValues.length; i++){
			colorsum = colorValues[i]+ pointlightColor[i];
			bothlightColor.push(colorsum);
		}
		var pickedgrey = [];
		for (i =0; i < colorValues.length; i++){
			nolight.push(1.0, 0.0, 0.0);
			pickedgrey.push(0.5, 0.5, 0.5);
		}
		calcvertexnormals(gl, shape);
		drawSOR(gl, vertices, indexes, bothlightColor);
		//drawSOR(gl, vertices, indexes, colorValues);
		//drawSOR(gl, vertices, indexes, smoothColor);
		a = new Polygon(vertices, indexes, colorValues, nolight, pickedgrey);
		currentPolygons.push(a);
		
		
		drawCube(gl);
		
		canvas.onmousedown = function(ev) {pickSOR(ev, canvas);   // Mouse is pressed
		
			
		}
			
	}
}
var pickedPolygon;
function pickSOR(ev, canvas){
			var x = ev.clientX, y = ev.clientY;
			var rect = ev.target.getBoundingClientRect();
			if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
				// If pressed position is inside <canvas>, check if it is above object
				var x_in_canvas = x - rect.left, y_in_canvas = rect.bottom - y;
				
				var pickedline = check(gl, n, x_in_canvas, y_in_canvas, u_Clicked, mvpMatrix, u_MvpMatrix, drawlightline(gl));
				var pickedcube = check(gl, n, x_in_canvas, y_in_canvas, u_Clicked, mvpMatrix, u_MvpMatrix, drawCube(gl));
				var pickedSOR; 
				
				for (i = 0; i < currentPolygons.length; i++){ 
					a = drawSOR(gl, currentPolygons[i].vertices, currentPolygons[i].indexes, currentPolygons[i].nolight);
					pickedSOR = check(gl, n, x_in_canvas, y_in_canvas, u_Clicked, mvpMatrix, u_MvpMatrix, a);
					console.log(currentPolygons[i]);
					if (pickedSOR){
						pickedPolygon= currentPolygons[i];
					}
				}
				
				
				if (pickedSOR){
					
					console.log(pickedPolygon);
					drawSOR(gl, pickedPolygon.vertices, pickedPolygon.indexes, pickedPolygon.pickedgrey);
					pickedShape(ev);
				}
				
				if (pickedline){
					
					if (lineswitch % 2 == 0){
					console.log("line on");
						for (i =0; i < bothlightColor.length; i++){
							newcolor = bothlightColor[i]+ colorValues[i];
							temparray.push(newcolor);
						}
						bothlightColor = [];
						for (i =0; i <temparray.length; i++){
							bothlightColor.push(temparray[i]);
						}
						temparray = [];
						gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
						drawSOR(gl, vertices, indexes, bothlightColor);
					
						
					}else{
						console.log("line off");
						
						
						for (i =0; i < bothlightColor.length; i++){
							newcolor = bothlightColor[i]- colorValues[i];
							temparray.push(newcolor);
						}
						bothlightColor = [];
						for (i =0; i <temparray.length; i++){
							bothlightColor.push(temparray[i]);
						}
						temparray = [];
						gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
						drawSOR(gl, vertices, indexes, bothlightColor);
						
					}
					drawCube(gl);
					drawlightline(gl);
					lineswitch++;
				}else{
					drawSOR(gl, vertices, indexes, colorValues);
					drawlightline(gl);
					drawCube(gl);
		
				}
				
				if (pickedcube){
					console.log("picked cube");
					
					if (cubeswitch % 2 == 0){
						console.log("cube on");
						for (i =0; i < bothlightColor.length; i++){
							newcolor = bothlightColor[i]+ pointlightColor[i];
							temparray.push(newcolor);
						}
						bothlightColor = [];
						for (i =0; i <temparray.length; i++){
							bothlightColor.push(temparray[i]);
						}
						temparray = [];
						gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
						drawSOR(gl, vertices, indexes, bothlightColor);
						
						
					}else{
						console.log("cube off");
						
						
						for (i =0; i < bothlightColor.length; i++){
							newcolor = bothlightColor[i]- pointlightColor[i];
							temparray.push(newcolor);
						}
						bothlightColor = [];
						for (i =0; i <temparray.length; i++){
							bothlightColor.push(temparray[i]);
						}
						temparray = [];
						gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
						drawSOR(gl, vertices, indexes, bothlightColor);
						
					}
					drawCube(gl);
					drawlightline(gl);
					cubeswitch++; 
				}else if (!pickedSOR && !pickedcube && !pickedline){
					notpickedShape(ev);
					picked = 0;
					console.log("nothing picked");
					for (i = 0; i < currentPolygons.length; i ++){ 
					drawSOR(gl, currentPolygons[i].vertices, currentPolygons[i].indexes, currentPolygons[i].colors);
					}
				}
		
			}
}
function pickedShape(ev){
	
	console.log("picked SOR");  
	
	for (i = 0; i < currentPolygons.length; i ++){ 
		drawSOR(gl, currentPolygons[i].vertices, currentPolygons[i].indexes, currentPolygons[i].colors);
	}
	
	//drawSOR(gl, currentPolygons[0].vertices, currentPolygons[0].indexes, currentPolygons[0].colors);
	//drawSOR(gl, currentPolygons[1].vertices, currentPolygons[1].indexes, currentPolygons[1].colors);
	
	//colorValues = []; vertices=[]; indexes = [];
	
	//calcVerticessmooth(gl, shape, gray);

	//drawSOR(gl, vertices, indexes, colorValues);
	//picked =1; 
	//canvas.onmousedown = function(ev) { scaleSOR(ev);};
	canvas.addEventListener("mousewheel", MouseWheelHandler, false);
		function MouseWheelHandler(ev) {
		scaleSOR(ev);				
		}

					
				
	canvas.onmousemove= function(ev){rotatetranslateSOR(ev);} ;
	canvas.onmousedown= function(ev){mouseDown(ev);} ;
	return;
}

var mousedown = false;
var rotationAmount=1; 
function rotatetranslateSOR(ev){
	if (mousedown = false) return;
	if (ev.which ==3){
	rotationAmount = rotationAmount+2; 
	console.log(rotationAmount);
	modelMatrix = new Matrix4();
	modelMatrix.setRotate(rotationAmount, 0, 0, 0.1);
	
		gl.uniformMatrix4fv(u_modelMatrix, false, modelMatrix.elements);
		drawSOR(gl, pickedPolygon.vertices, pickedPolygon.indexes, pickedPolygon.pickedgrey);
	}else if(ev.which ==1){
		
		 var x = ev.clientX; // x coordinate of a mouse pointer
		var y = ev.clientY; // y coordinate of a mouse pointer
		//get the position of the <canvas> itself in client area
		var coordinate = canvascoords(ev, canvas, x, y);
		x = coordinate[0]; 
		y = coordinate[1];
		
		modelMatrix.setTranslate(0.01*x, 0.01*y,0);
		mvpMatrix.multiply(modelMatrix);
		gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
		drawSOR(gl, pickedPolygon.vertices, pickedPolygon.indexes, pickedPolygon.pickedgrey);
		return;
	}	
	
}

function mouseDown(ev){
	var x = ev.clientX, y = ev.clientY;
	var rect = ev.target.getBoundingClientRect();
	if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
		// If pressed position is inside <canvas>, check if it is above object
		var x_in_canvas = x - rect.left, y_in_canvas = rect.bottom - y;	
		pickedSOR = check(gl, n, x_in_canvas, y_in_canvas, u_Clicked, mvpMatrix, u_MvpMatrix, drawSOR(gl, pickedPolygon.vertices, pickedPolygon.indexes, pickedPolygon.nolight));
		if (pickedSOR){
			mousedown = true;
		}else{
			pickSOR(ev, canvas);
		}
	}	
}

function scaleSOR(ev){
	console.log("scale");
	var e = window.event || e; // old IE support
	var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));

	if (delta == 1) {
		modelMatrix.scale(1.01, 1.01, 1.01);
		gl.uniformMatrix4fv(u_modelMatrix, false, modelMatrix.elements);
		drawSOR(gl, pickedPolygon.vertices, pickedPolygon.indexes, pickedPolygon.pickedgrey);
	}else if (delta == -1) {
		modelMatrix.scale(0.95, 0.95, 0.95);
		gl.uniformMatrix4fv(u_modelMatrix, false, modelMatrix.elements);
		drawSOR(gl, pickedPolygon.vertices, pickedPolygon.indexes, pickedPolygon.pickedgrey);
	}
	
	
}


function notpickedShape(ev){
	if (picked ==1) return;
	canvas.addEventListener("mousewheel", MouseWheelHandler, false);
					function MouseWheelHandler(ev) {
						zoom(ev);
						
					}
					canvas.onmouseup= function(ev){notselectedmouseUp(ev);} ;
					canvas.onmousemove= function(ev){panCamera(ev);} ;
					return;
	
}


function notselectedmouseUp(ev){ 
  mousedown = true;
  console.log("mouseup");
  pickSOR(ev, canvas);
}

function panCamera(ev, displacement){
	if (ev.which == 1) {
		if(!mousedown) return;

		var x = ev.clientX;
		var y = ev.clientY;
		var coordinate = canvascoords(ev, canvas, x, y );
		//console.log(coordinate[0], coordinate[1]);
		modelMatrix.setTranslate(coordinate[0]*(-0.03), coordinate[1]*(-0.03), 0);
		mvpMatrix.multiply(modelMatrix);
		gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
		for (i = 0; i < currentPolygons.length; i ++){ 
			drawSOR(gl, currentPolygons[i].vertices, currentPolygons[i].indexes, currentPolygons[i].colors);
		}
		drawlightline(gl);  drawCube(gl);
		return;
	}else if (ev.which == 2){
	
		cameraZaxis(ev);					
					
	}
}

var persmovement = 0;
var orthomovement = 0;
function cameraZaxis(ev){
	
	
	if (perspective == 1){
		
		mvpMatrix.setPerspective(30, 1, 1, 10000);
	
		mvpMatrix.lookAt(1000-persmovement, 1000-persmovement, 2000-persmovement, 0, 0, 0, 0, 1000, 0);
		
		//mvpMatrix.setPerspective(initialfov, 1, 1, 90);
	//mvpMatrix.lookAt(3-persmovement, 3-persmovement, 7-persmovement, 0, 0, 0, 0, 1, 0);
	gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
		for (i = 0; i < currentPolygons.length; i ++){ 
			drawSOR(gl, currentPolygons[i].vertices, currentPolygons[i].indexes, currentPolygons[i].colors);
		}
		drawlightline(gl);
		drawCube(gl);
		persmovement= persmovement+1;
	}else if (perspective == 0){
		
		mvpMatrix.setOrtho(-500.0, 500.0, -500.0, 500.0, -500.0 + orthomovement , 500.0 + orthomovement );
	gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
		for (i = 0; i < currentPolygons.length; i ++){ 
			drawSOR(gl, currentPolygons[i].vertices, currentPolygons[i].indexes, currentPolygons[i].colors);
		}
		drawlightline(gl);
		drawCube(gl);
		orthomovement = orthomovement +0.000001;
	
	}
}

function zoom(ev){
	
	var e = window.event || e; // old IE support
	var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));

	if (delta == 1) {
		console.log("zoom in");
		mvpMatrix.setPerspective(initialfov, 1, 1, 10000);
		mvpMatrix.lookAt(1000, 1000, 2000, 0, 0, 0, 0, 1000, 0);
		gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		for (i = 0; i < currentPolygons.length; i ++){ 
			drawSOR(gl, currentPolygons[i].vertices, currentPolygons[i].indexes, currentPolygons[i].colors);
		}
		drawlightline(gl);
		drawCube(gl);;
		
		
		if (initialfov <= 1){
			initialfov == 1;
		} else{
			initialfov = initialfov - 1;
		}
	
	}else if (delta == -1) {
		console.log("zoom out");
		mvpMatrix.setPerspective(initialfov, 1, 1, 10000);
		mvpMatrix.lookAt(1000, 1000, 2000, 0, 0, 0, 0, 1000, 0);
		gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		for (i = 0; i < currentPolygons.length; i ++){ 
			drawSOR(gl, currentPolygons[i].vertices, currentPolygons[i].indexes, currentPolygons[i].colors);
		}
		drawlightline(gl);
		drawCube(gl);
		
		if (initialfov >= 160){
			initialfov == 160;
		} else{
			initialfov = initialfov + 1;
		}
		
	}
}
function check(gl, n, x, y, u_Clicked, MvpMatrix, u_MvpMatrix, drawthing) {
  var picked = false;
  gl.uniform1i(u_Clicked, 1);  // Pass true to u_Clicked
  //drawthing; 
  //draw(gl, n, currentAngle, MvpProjMatrix, u_MvpMatrix); // Draw cube with red
  // Read pixel at the clicked position
  var pixels = new Uint8Array(4); // Array for storing the pixel value
  gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
	console.log(pixels);
  if (pixels[0] == 255){ // The mouse in on cube if R(pixels[0]) is 255
    picked = true;
  }
 
  gl.uniform1i(u_Clicked, 0);  // Pass false to u_Clicked(rewrite the cube)
  //draw(gl, n, MvpProjMatrix, u_vpMatrix); // Draw the cube
drawthing;
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  return picked;
}

function Polygon(vertices, indexes, colors, nolight, pickedgrey){
	this.vertices = vertices;
	this.indexes = indexes;
	this.colors = colors;
	this.nolight = nolight;
	this.pickedgrey = pickedgrey;
}

function calcVerticessmooth(gl, shape, objectcolor){

    for (var i = 0; i < shape[0].length - 1; i++) {
		
		var normalrow = [];
		
		
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
			//var lightDirection = new Vector3([1,1,1]);
			var lightDirection = new Vector3([1,1,1]);
			lightDirection.normalize();
			
			nor = calculatenormals(currentLine[i], currentLine[i+1], nextLine[i]);
			
			dot = nor.elements[0] * lightDirection.elements[0] + nor.elements[1] * lightDirection.elements[1] + nor.elements[2] * lightDirection.elements[2];
			colorValues.push(dot * objectcolor[0]); colorValues.push(dot * objectcolor[1]); colorValues.push(dot * objectcolor[2]);
			colorValues.push(dot * objectcolor[0]); colorValues.push(dot * objectcolor[1]); colorValues.push(dot * objectcolor[2]);
			colorValues.push(dot * objectcolor[0]); colorValues.push(dot * objectcolor[1]); colorValues.push(dot * objectcolor[2]);
			colorValues.push(dot * objectcolor[0]); colorValues.push(dot * objectcolor[1]); colorValues.push(dot * objectcolor[2]);
			
			
			drawnormallines(currentLine[i], currentLine[i+1], nor);
			
			//normalrow.push(new coord (nor.elements[0], nor.elements[1], nor.elements[2]));
		
		}		
	}		
	
}

function calcPointLight(gl, shape){
//var gloss = 0;
    for (var i = 0; i < shape[0].length - 1; i++) {
		
		var normalrow = [];
		
		
        for (j = 0; j < shape.length - 1; j++) {
         
	

            var currentLine = shape[j];
            var nextLine = shape[j + 1];
			
			
			
			//var lightDirection = new Vector3([1,1,1]);
			var lightDirection = new Vector3([ 0, 2- currentLine[i].y , 0]);
			lightDirection.normalize();
			
			nor = calculatenormals(currentLine[i], currentLine[i+1], nextLine[i]);
			
			dot = nor.elements[0] * lightDirection.elements[0] + nor.elements[1] * lightDirection.elements[1] + nor.elements[2] * lightDirection.elements[2];
			pointlightColor.push(dot * 1.0 * 1.0);  pointlightColor.push(dot * 0.0 * 1.0);  pointlightColor.push(dot * 0.0); 
			pointlightColor.push(dot * 1.0 * 1.0); pointlightColor.push(dot * 0.0 * 1.0);   pointlightColor.push(dot * 0.0); 
			pointlightColor.push(dot * 1.0 * 1.0);  pointlightColor.push(dot * 0.0 * 1.0);   pointlightColor.push(dot * 0.0);  
			pointlightColor.push(dot * 1.0 * 1.0);  pointlightColor.push(dot * 0.0 * 1.0);   pointlightColor.push(dot * 0.0); 
			
		
		
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
			
			verticenormals.push(norsum1.elements[0], norsum1.elements[1], norsum1.elements[2]);
			verticenormals.push(norsum2.elements[0], norsum2.elements[1], norsum2.elements[2]);
			verticenormals.push(norsum4.elements[0], norsum4.elements[1], norsum4.elements[2]);
			verticenormals.push(norsum3.elements[0], norsum3.elements[1], norsum3.elements[2]);
			
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
	console.log(halfway);
	//console.log(nor);
	console.log(verticenormals.length);
	for (i=0; i<verticenormals.length ; i += 3 ){
		
		ndoth = verticenormals[i] * halfway[0] + verticenormals[i+1] * halfway[1] + verticenormals[i+2]* halfway[2]; 
		console.log(verticenormals[i] * halfway[0]);
		console.log(verticenormals[0]);
		spec = Math.pow(Math.max(ndoth, 0.0), gloss);
		
		specarray.push(spec*0+0);
		specarray.push(spec*1+0);
		specarray.push(spec*0+0.2);
	}
	console.log(specarray);
	
	for (i=0; i<smoothColor.length; i++  ){
			a = ( specarray[i]) + smoothColor[i];
			
			colorValues2.push(a);
		
	}
	
	
}
	
function drawSOR(gl, vertices, indexes, color){
	//console.log(colorValues);
	
	var indexBuffer = gl.createBuffer();
		if (!indexBuffer) 
		return -1;
	//console.log("vertices length" + vertices.length);
	//console.log("flatcolor length" + colorValues.length);
	//console.log("indexes length" + indexes.length);
	//console.log(verticenormals.length);
	
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
	//gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// Draw the cube
	gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0);
	//gl.drawArrays(gl.LINE_STRIP, 0, vertices.length/3);
	
	/*
	
	for (i = 0; i < vectornormalsfinal.length; i ++){ 
		vectornormalscolor.push(1.0, 0.0, 0.0);
	}
	if (!initArrayBuffer(gl, new Float32Array(vectornormalsfinal), 3, gl.FLOAT, 'a_Position')) return -1;
	if (!initArrayBuffer(gl, new Float32Array(vectornormalscolor), 3, gl.FLOAT, 'a_Color')) return -1;
	gl.drawArrays(gl.LINES, 0, vectornormalsfinal.length/3);
	*/
	
}
/*
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
*/
function drawlightline(gl){
	var vertices = new Float32Array([
    0.0, 0.0, 0.0,   500.0, 500.0, 500.0
  ]);
  var n = 2; // The number of vertices

  // Create a buffer object
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

   // Draw the rectangle
  gl.drawArrays(gl.LINE_STRIP, 0, n);
  gl.drawArrays(gl.POINTS, 0, n);
}


function drawCube(gl) {

  var vertices = new Float32Array([   // Coordinates
 
    25, 525, 25,  -25, 525, 25,  -25, 475, 25,  25, 475, 25,   // v0-v1-v2-v3 front
    25, 525, 25,  25, 475, 25,  25, 475, -25,  25, 525, -25,    // v0-v3-v4-v5 right
    25, 525, 25,  25, 525, -25,  -25, 525, -25,  -25, 525, 25, // v0-v5-v6-v1 up
    -25, 525, 25,  -25, 525, -25,  -25, 475, -25,  -25, 475, 25, // v1-v6-v7-v2 left
    -25, 475, -25,  25, 525, -25,  25, 475, -25,  -25, 475, 25,  // v7-v4-v3-v2 down
    25, 525, -25,  -25, 475, -25,  -25, 525, -25,  25, 525, -25// v4-v7-v6-v5 back
	
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



function coord(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
}

//return canvas coordinates 
function canvascoords(ev, canvas, xVal, yVal) {
    var rect = ev.target.getBoundingClientRect();
    var xyposition = [(((xVal - rect.left) - canvas.width / 2) / (canvas.width / 2))*500, ((canvas.height / 2 - (yVal - rect.top)) / (canvas.height / 2))*500];
	return xyposition; 
}
  

// function that clears the canvas
function clearCanvas(gl, canvas) {
    gl = getWebGLContext(canvas);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
}

var loadedSOR;

function updateScreen(){
	rightclicked = true;
	var lightDirection= new Vector3([1/Math.sqrt(3),1/Math.sqrt(3),1/Math.sqrt(3)]);
	lightDirection.normalize;
	console.log(extractedSOR.vertices);
	
	readFile();

	
	
	loadedSOR = [];
	colors=[];
	dots=[];
	nolight = [];
	pickedgrey = [];
	for (i = 0; i < extractedSOR.vertices.length; i ++){ 
		loadedSOR.push(extractedSOR.vertices[i]*500);
		
	}
	console.log(loadedSOR);
	objectcolor=polygonColors[polygonCount];
	polygonCount++;
	for (i = 0; i < extractedSOR.vertices.length; i += 12){ 
		a = new coord(extractedSOR.vertices[i], extractedSOR.vertices[i+1], extractedSOR.vertices[i+2]);
		b = new coord(extractedSOR.vertices[i+3], extractedSOR.vertices[i+4], extractedSOR.vertices[i+5]);
		c = new coord(extractedSOR.vertices[i+9], extractedSOR.vertices[i+10], extractedSOR.vertices[i+11]);
		nor =calculatenormals(a, b, c);
	
		dot = nor.elements[0] * lightDirection.elements[0] + nor.elements[1] * lightDirection.elements[1] + nor.elements[2] * lightDirection.elements[2];
		nolight.push (1,0,0); nolight.push (1,0,0); nolight.push (1,0,0); nolight.push (1,0,0);
		pickedgrey.push(0.5, 0.5, 0.5); pickedgrey.push(0.5, 0.5, 0.5); pickedgrey.push(0.5, 0.5, 0.5); pickedgrey.push(0.5, 0.5, 0.5);
		colors.push(dot * objectcolor[0]); colors.push(dot * objectcolor[1]); colors.push(dot * objectcolor[2]);
		colors.push(dot * objectcolor[0]); colors.push(dot * objectcolor[1]); colors.push(dot * objectcolor[2]);
		colors.push(dot* objectcolor[0]); colors.push(dot * objectcolor[1]); colors.push(dot * objectcolor[2]);
		colors.push(dot * objectcolor[0]); colors.push(dot * objectcolor[1]); colors.push(dot * objectcolor[2]);
	}
	

	a = new Polygon(loadedSOR, extractedSOR.indexes, colors, nolight, pickedgrey);
	
	currentPolygons.push(a);
	console.log(currentPolygons);
	//drawSOR(gl,loadedSOR, extractedSOR.indexes, colors);
	for (i = 0; i < currentPolygons.length; i ++){ 
		drawSOR(gl, currentPolygons[i].vertices, currentPolygons[i].indexes, currentPolygons[i].colors);
	}
	

}

function savecurrentFile(){
	name = makerandomname();
	
	savedSOR = new SOR(name, vertices, indexes);
	saveFile(savedSOR);

}

function makerandomname(){
    var text = "";
    var possible = "1234";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
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

