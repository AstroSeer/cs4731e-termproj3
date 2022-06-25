// WebGL globals
let canvas;
let gl;
let program;

var modelViewMatrixLoc;
var projectionMatrixLoc;
var modelViewMatrix;
var projectionMatrix;
var fColor;

var black = vec4(0.0, 0.0, 0.0, 1.0);
var red = vec4(1.0, 0.0, 0.0, 1.0);
var green = vec4(0.0, 1.0, 0.0, 1.0);
var blue = vec4(0.0, 0.0, 1.0, 1.0);
var pink = vec4(1.0, 0.0, 1.0, 1.0);

var loadCap = 5;
var keepRender = false;

var fov = 60;
var aspect;
var near = 0.1;
var far = 100000;

var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);


/**
 * Sets up WebGL and enables the features this program requires.
 */
function main() {
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl = WebGLUtils.setupWebGL(canvas);

    //Check that the return value is not null.
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // Set viewport
    gl.viewport(0, 0, canvas.width, canvas.height);

    // Set clear color
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    // Initialize shaders
    program = initShaders(gl, "vshader", "fshader");
    gl.useProgram(program);

    aspect = canvas.width/canvas.height;

    //gl.enable(gl.DEPTH_TEST);
    render();
}

function setRoad() {
    //console.log(roadFaceVertices);
    var rBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, rBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(roadFaceVertices), gl.STATIC_DRAW);

    var rPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(rPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(rPosition);

    fColor = gl.getUniformLocation(program, "fColor");
    gl.uniform4fv(fColor, flatten(black));
    gl.drawArrays(gl.TRIANGLE_FAN, 0, flatten(roadFaceVertices).length);
}

function setCar() {
    var rBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, rBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(carFaceVertices), gl.STATIC_DRAW);

    var rPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(rPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(rPosition);

    fColor = gl.getUniformLocation(program, "fColor");
    gl.uniform4fv(fColor, flatten(blue));
    gl.drawArrays(gl.TRIANGLE_FAN, 0, flatten(carFaceVertices).length);
}

function setBunny() {
    var rBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, rBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(bunnyFaceVertices), gl.STATIC_DRAW);

    var rPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(rPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(rPosition);

    fColor = gl.getUniformLocation(program, "fColor");
    gl.uniform4fv(fColor, flatten(green));
    gl.drawArrays(gl.TRIANGLE_FAN, 0, flatten(bunnyFaceVertices).length);
}

function setStop() {
    var rBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, rBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(stopsignFaceVertices), gl.STATIC_DRAW);

    var rPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(rPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(rPosition);

    fColor = gl.getUniformLocation(program, "fColor");
    gl.uniform4fv(fColor, flatten(red));
    gl.drawArrays(gl.TRIANGLE_FAN, 0, flatten(stopsignFaceVertices).length);
}

function setLight() {
    var rBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, rBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(lightFaceVertices), gl.STATIC_DRAW);

    var rPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(rPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(rPosition);

    fColor = gl.getUniformLocation(program, "fColor");
    gl.uniform4fv(fColor, flatten(pink));
    gl.drawArrays(gl.TRIANGLE_FAN, 0, flatten(lightFaceVertices).length);
}

function processData() {
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

    eye = vec3(0, 3, 10);
    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = perspective(fov, aspect, near, far);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
    setRoad();
    setCar();
    setBunny();
    setStop();
    setLight();
}

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if(isBusy == false) {
        if(isLoaded == loadCap) {
            //isBusy = true;
            //console.log(flatten(faceVertices).length);
            processData();
            //keepRender = true;     
        }
        else if(isLoaded == 0) {
            loadFile("https://web.cs.wpi.edu/~jmcuneo/cs4731/project3_1/street.obj", "OBJ", 1);
        }
        else if(isLoaded == 1) {
            loadFile("https://web.cs.wpi.edu/~jmcuneo/cs4731/project3_1/car.obj", "OBJ", 2);
        }
        else if(isLoaded == 2) {
            loadFile("https://web.cs.wpi.edu/~jmcuneo/cs4731/project3_1/bunny.obj", "OBJ", 3);
        }
        else if(isLoaded == 3) {
            loadFile("https://web.cs.wpi.edu/~jmcuneo/cs4731/project3_1/stopsign.obj", "OBJ", 4);
        }
        else if(isLoaded == 4) {
            loadFile("https://web.cs.wpi.edu/~jmcuneo/cs4731/project3_1/lamp.obj", "OBJ", 5);
        }
    }
    
    // if(keepRender) {
    //     console.log("renderinggg");
    //     gl.drawArrays(gl.TRIANGLE_FAN, 0, flatten(roadFaceVertices).length);
    //     gl.drawArrays(gl.TRIANGLE_FAN, 0, flatten(carFaceVertices).length);
    //     gl.drawArrays(gl.TRIANGLE_FAN, 0, flatten(bunnyFaceVertices).length);
    // }

    requestAnimFrame(render);
}