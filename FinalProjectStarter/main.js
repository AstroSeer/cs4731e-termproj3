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
var pointsArray = [];

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

    gl.enable(gl.DEPTH_TEST)

    loadFile("https://web.cs.wpi.edu/~jmcuneo/cs4731/project3_1/street.obj", "OBJ", 1);
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

function processData() {
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

    eye = vec3(0, 3, 8);
    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = perspective(fov, aspect, near, far);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
    setRoad();
}

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if(isLoaded) {
        // console.log(flatten(faceVertices).length);
        processData();        
    }

    requestAnimFrame(render);
}