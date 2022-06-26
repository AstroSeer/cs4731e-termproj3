// WebGL globals
let canvas;
let gl;
let program;

var viewMatrixLoc;
var projectionMatrixLoc;
var viewMatrix;
var projectionMatrix;
var fColor;

var colors = [];
var black = vec4(0.0, 0.0, 0.0, 1.0);
var red = vec4(1.0, 0.0, 0.0, 1.0);
var green = vec4(0.0, 1.0, 0.0, 1.0);
var blue = vec4(0.0, 0.0, 1.0, 1.0);
var pink = vec4(1.0, 0.0, 1.0, 1.0);
colors.push(black);
colors.push(red);
colors.push(green);
colors.push(blue);
colors.push(pink);

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

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    render();
}

function setLight() {
    // finalVerts.push(roadFaceVertices);
    // finalVerts.push(carFaceVertices);
    // finalVerts.push(bunnyFaceVertices);
    // finalVerts.push(stopsignFaceVertices);
    // finalVerts.push(lightFaceVertices);

    for(var x = 0; x < loadCap; x++) {
        console.log(finalVerts);
        var transformMatrix;
        switch(x) {
            case 0:
                transformMatrix = translate(0, 0, 0);
                break;
            case 1:
                transformMatrix = translate(3, 2, 0);
                break;
            case 2:
                transformMatrix = translate(3, 1, 0);
                break;
            case 3:
                transformMatrix = translate(-5, 0, 0);
                break;
            case 4:
                transformMatrix = translate(-1, 0, 0);
                break;
        }
        var modelMatrix = gl.getUniformLocation(program, "modelMatrix");
        gl.uniformMatrix4fv(modelMatrix, false, flatten(transformMatrix));

        var rBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, rBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(finalVerts[x]), gl.STATIC_DRAW);

        var rPosition = gl.getAttribLocation( program, "vPosition");
        gl.vertexAttribPointer(rPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(rPosition);

        vColor = gl.getUniformLocation(program, "fColor");
        gl.uniform4fv(vColor, flatten(colors[x]));
        gl.drawArrays(gl.TRIANGLES, 0, flatten(finalVerts[x]).length);
    }
}

function processData() {
    // setRoad();
    // setCar();
    // setBunny();
    //setStop();
    viewMatrixLoc = gl.getUniformLocation( program, "viewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

    eye = vec3(0, 3, 10);
    viewMatrix = lookAt(eye, at , up);
    projectionMatrix = perspective(fov, aspect, near, far);

    gl.uniformMatrix4fv(viewMatrixLoc, false, flatten(viewMatrix) );
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
    setLight();
}

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
    if(isBusy == false) {
        if(isLoaded == loadCap) {
            //isBusy = true;
            //console.log(flatten(faceVertices).length);
            processData();
            //keepRender = true;     
        }
        else if(isLoaded == 0) {
            loadFile("https://web.cs.wpi.edu/~jmcuneo/cs4731/project3_1/street.obj", "OBJ");
        }
        else if(isLoaded == 1) {
            loadFile("https://web.cs.wpi.edu/~jmcuneo/cs4731/project3_1/car.obj", "OBJ");
        }
        else if(isLoaded == 2) {
            loadFile("https://web.cs.wpi.edu/~jmcuneo/cs4731/project3_1/bunny.obj", "OBJ");
        }
        else if(isLoaded == 3) {
            loadFile("https://web.cs.wpi.edu/~jmcuneo/cs4731/project3_1/lamp.obj", "OBJ");
        }
        else if(isLoaded == 4) {
            loadFile("https://web.cs.wpi.edu/~jmcuneo/cs4731/project3_1/stopsign.obj", "OBJ");
        }
    }
    
    // if(keepRender) {
    //     console.log("renderinggg");
    //     gl.drawArrays(gl.TRIANGLE_FAN, 0, flatten(roadFaceVertices).length);
    //     gl.drawArrays(gl.TRIANGLE_FAN, 0, flatten(carFaceVertices).length);
    //     gl.drawArrays(gl.TRIANGLE_FAN, 0, flatten(bunnyFaceVertices).length);
    // }

    if(isLoaded != loadCap) {
        requestAnimFrame(render);
    }
    // requestAnimFrame(render);
}