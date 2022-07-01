// WebGL globals
let canvas;
let gl;
let program;

var viewMatrixLoc;
var projectionMatrixLoc;
var viewMatrix;
var projectionMatrix;
var fColor;
var stopSign = 0.0;

var objectLoadCap = 5;
var materialLoadCap = 5;

var cameraMoving = false;

//var texCoordsArray = [];
// var skyBox = [
//     "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3_1/skybox_negx.png",
//     "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3_1/skybox_negy.png",
//     "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3_1/skybox_negz.png",
//     "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3_1/skybox_posx.png",
//     "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3_1/skybox_posy.png",
//     "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3_1/skybox_posz.png"
// ];
var skyBoxOn = false;
var skyType = 0.0;

var shadowOn = false;
var sm;
var hoodCamera = false;
var engageCarMove = false;
var shadowColor = vec4(0.0, 0.0, 0.0, 1.0);

var texture;

var minT = 0.0;
var maxT = 1.0;

var keepRender = false;

var lightOn = true;
var lightPosition = vec4( 0.0, 2.0, 0.0, 0.0 ); 
var lightAmbient = vec4( 0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 0.3, 0.3, 0.3, 1.0 );
var materialDiffuse;
var materialSpecular;
var materialShininess = 20.0;

var skyTexCoord = [
    [minT, minT],
    [minT, maxT],
    [maxT, maxT],
    [maxT, minT]
];

    
var alpha = 0.0;
var alphaY = 0.0;
var tY = 0.025;
var rot = 0.0;

var fov = 60;
var aspect;
var near = 0.1;
var far = 100000;
var vShadows = 0.0;

var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);
var eyeCoords = vec3(0.0, 3.0, 8.0);
var defaultCoords = vec3(0.0, 0.0, 0.0);
var eyeMoveX = 1.0;
var eyeMoveY = -0.1;
var eyeMoveZ = -1.0;
var moveCar = [2.85, 0.0];
var directionCar = 1;

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
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Initialize shaders
    program = initShaders(gl, "vshader", "fshader");
    gl.useProgram(program);

    aspect = canvas.width/canvas.height;
    sm = mat4();
    sm[3][3] = 0;
    sm[3][1] = -1/lightPosition[1];

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    render();
}

function setObjects() {
    viewMatrixLoc = gl.getUniformLocation( program, "viewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

    // eye = eyeCoords;
    // viewMatrix = lookAt(eye, at , up);
    // console.log(viewMatrix);
    // if(cameraMoving && !hoodCamera) {
    //     alpha -= 3.0;
    //     alphaY += tY;
    //     if(alphaY <= -0.25 || alphaY >= 0.25) {
    //         tY = tY * -1;
    //     }
    //     //console.log(alpha);

    // }

    // viewMatrix = mult(viewMatrix, rotateY(alpha));
    // viewMatrix = mult(viewMatrix, translate(0, alphaY, 0));
    // projectionMatrix = perspective(fov, aspect, near, far);
    //console.log(viewMatrix);

    var transformMatrix;
    var modelMatrix = gl.getUniformLocation(program, "modelMatrix");
    var rBuffer = gl.createBuffer();
    var rPosition = gl.getAttribLocation( program, "vPosition");
    var vNormal = gl.createBuffer();
    var vNormalPosition = gl.getAttribLocation( program, "vNormal");

    var parentMatrix = [];
    for(var x = 0; x < objectLoadCap; x++) {
        for(let key of finalVerts[x]) {
            materialDiffuse = diffuseMap.get(key[0]);
            materialSpecular = specularMap.get(key[0]);

            gl.uniform4fv(gl.getUniformLocation(program, "lightDiffuse"), flatten(lightDiffuse));
            gl.uniform4fv(gl.getUniformLocation(program, "materialDiffuse"), flatten(materialDiffuse));
            gl.uniform4fv(gl.getUniformLocation(program, "lightSpecular"), flatten(lightSpecular));
            gl.uniform4fv(gl.getUniformLocation(program, "materialSpecular"), flatten(materialSpecular));
            gl.uniform4fv(gl.getUniformLocation(program, "lightAmbient"), flatten(lightAmbient));
            gl.uniform4fv(gl.getUniformLocation(program, "materialAmbient"), flatten(materialAmbient));

            switch(x) {
                case 0:
                    transformMatrix = translate(0, 0, 0);
                    break;
                case 1:
                    transformMatrix = translate(moveCar[0], -0.25, moveCar[1]);
                    transformMatrix = mult(transformMatrix, rotateY(rot));
                    parentMatrix.push(transformMatrix);
                    break;
                case 2:
                    transformMatrix = mult(parentMatrix[0], translate(0.2, 0.70, 1.5));
                    parentMatrix.push(transformMatrix);
                    if(hoodCamera) {
                        viewMatrix = parentMatrix[0];
                        viewMatrix = mult(viewMatrix, rotateY(180));
                        viewMatrix = mult(viewMatrix, translate(-0.2, -0.4, -1.0));
                    }
                    //parentMatrix.pop();
                    break;
                case 3:
                    transformMatrix = translate(0, 0, 0);
                    break;
                case 4:
                    transformMatrix = translate(-1, 0, -4.25);
                    break;
            }
            gl.uniformMatrix4fv(modelMatrix, false, flatten(transformMatrix));

            gl.bindBuffer(gl.ARRAY_BUFFER, rBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(key[1]), gl.STATIC_DRAW);

            gl.vertexAttribPointer(rPosition, 4, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(rPosition);

            gl.bindBuffer(gl.ARRAY_BUFFER, vNormal);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(finalNorms[x].get(key[0])), gl.STATIC_DRAW);

            gl.vertexAttribPointer(vNormalPosition, 4, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(vNormalPosition);
            //rot = rot-0.01;
            if(x == 4 && finalUVs[4].get('StopMaterial')) {
                var tBuffer = gl.createBuffer();
                gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );
                gl.bufferData( gl.ARRAY_BUFFER, flatten(finalUVs[4].get('StopMaterial')), gl.STATIC_DRAW );
            
                var vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
                gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
                gl.enableVertexAttribArray( vTexCoord );

                stopSign = 1.0;
            }
            else {
                stopSign = 0.0;
            }

            gl.uniformMatrix4fv(viewMatrixLoc, false, flatten(viewMatrix) );
            gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );

            gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition));
            gl.uniform1f(gl.getUniformLocation(program, "shininess"), materialShininess);
            gl.uniform1f(gl.getUniformLocation(program, "vStopSign"), stopSign);

            gl.drawArrays(gl.TRIANGLES, 0, flatten(key[1]).length);
            stopSign = 0.0;

            if(shadowOn && lightOn) {
                if(x == 1 || x == 4) {
                    vShadows = 1.0;
                    gl.uniform1f(gl.getUniformLocation(program, "vShadows"), vShadows);
                    var modelMatrix2;
                    modelMatrix2 = translate(lightPosition[0], lightPosition[1], lightPosition[2]);
                    modelMatrix2 = mult(modelMatrix2, sm);
                    modelMatrix2 = mult(modelMatrix2, translate(-lightPosition[0], -lightPosition[1], -lightPosition[2]))

                    var viewMatrix2 = mult(viewMatrix, modelMatrix2);

                    gl.bindBuffer(gl.ARRAY_BUFFER, rBuffer);
                    gl.bufferData(gl.ARRAY_BUFFER, flatten(key[1]), gl.STATIC_DRAW);
        
                    gl.vertexAttribPointer(rPosition, 4, gl.FLOAT, false, 0, 0);
                    gl.enableVertexAttribArray(rPosition);

                    gl.uniform4fv(gl.getUniformLocation(program, "lightDiffuse"), flatten(shadowColor));
                    gl.uniform4fv(gl.getUniformLocation(program, "materialDiffuse"), flatten(shadowColor));
                    gl.uniform4fv(gl.getUniformLocation(program, "lightSpecular"), flatten(shadowColor));
                    gl.uniform4fv(gl.getUniformLocation(program, "materialSpecular"), flatten(shadowColor));
                    gl.uniform4fv(gl.getUniformLocation(program, "lightAmbient"), flatten(shadowColor));
                    gl.uniform4fv(gl.getUniformLocation(program, "materialAmbient"), flatten(shadowColor));

                    viewMatrixLoc = gl.getUniformLocation( program, "viewMatrix" );
                    gl.uniformMatrix4fv(viewMatrixLoc, false, flatten(viewMatrix2));
                    gl.uniform1f(gl.getUniformLocation(program, "vShadows"), vShadows);
                    gl.drawArrays(gl.TRIANGLES, 0, key[1].length);
                    vShadows = 0.0;
                }
            }
        }
    }
    if(engageCarMove) {
        if(moveCar[0] >= 2.8 && moveCar[1] >= 2.8) {
            rot = rot - 90;
            moveCar[0] = moveCar[0] - 0.2;
            directionCar = 2;
        }
        else if(moveCar[0] <= -2.8 && moveCar[1] >= 2.8) {
            rot = rot - 90;
            moveCar[1] = moveCar[1] - 0.2;
            directionCar = 3;
        }
        else if(moveCar[0] <= -2.8 && moveCar[1] <= -2.8) {
            rot = rot - 90;
            moveCar[0] = moveCar[0] + 0.2;
            directionCar = 4;
        }
        else if(moveCar[0] >= 2.8 && moveCar[1] <= -2.8) {
            rot = rot - 90;
            moveCar[1] = moveCar[1] + 0.2;
            directionCar = 1;
        }
        else {
            switch(directionCar) {
                case 1:
                    moveCar[1] = moveCar[1] + 0.1;
                    break;
                case 2:
                    moveCar[0] = moveCar[0] - 0.1;
                    break;
                case 3:
                    moveCar[1] = moveCar[1] - 0.1;
                    break;
                case 4:
                    moveCar[0] = moveCar[0] + 0.1;
                    break;
            }
        }
    }
    // console.log(moveCar);
    // console.log(directionCar);
}

window.addEventListener("keypress", function(event) {
    var code = event.key;
    //Switches between wireframe and solid when "M" is pressed
    if(code == "l" || code == "L") {
        if(lightOn) {
            lightDiffuse = vec4( 0.1, 0.1, 0.1, 1.0 );
            lightSpecular = vec4( 0.1, 0.1, 0.1, 1.0 );
        }
        else {
            lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
            lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
        }
        lightOn = !lightOn;
    }
    if(code == "c" || code == "C") {
        cameraMoving = !cameraMoving;
    }
    if(code == "e" || code == "E") {
        skyBoxOn = !skyBoxOn;
    }
    if(code == "s" || code == "S") {
        shadowOn = !shadowOn;
    }
    if(code == "d" || code == "D") {
        hoodCamera = !hoodCamera;
    }
    if(code == "m" || code == "M") {
        engageCarMove = !engageCarMove;
    }
});

function processData() {
    // viewMatrixLoc = gl.getUniformLocation( program, "viewMatrix" );
    // projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

    var image = new Image();
    image.crossOrigin = "";
    image.src = textureURL;
    image.onload = function() {
        configureTexture(image);
    }

    if(!hoodCamera) {
        eye = eyeCoords;
        viewMatrix = lookAt(eye, at , up);
        // console.log(viewMatrix);
        if(cameraMoving && !hoodCamera) {
            alpha -= 3.0;
            alphaY += tY;
            if(alphaY <= -0.25 || alphaY >= 0.25) {
                tY = tY * -1;
            }
        //console.log(alpha);
        }
        viewMatrix = mult(viewMatrix, rotateY(alpha));
        viewMatrix = mult(viewMatrix, translate(0, alphaY, 0));
        projectionMatrix = perspective(fov, aspect, near, far);
        //console.log(viewMatrix);
    
        gl.uniformMatrix4fv(viewMatrixLoc, false, flatten(viewMatrix) );
        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
    }
    setObjects();
}

function configureTexture(image) {
    var tex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
}

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
    if(isBusy == false) {
        if(isObjectLoaded == objectLoadCap && isMaterialLoaded == materialLoadCap) {
            processData();
            // isBusy = true;
            // keepRender = true;
        }
        else if(isMaterialLoaded == 0) {
            loadFile("https://web.cs.wpi.edu/~jmcuneo/cs4731/project3_1/street.mtl", "MTL");
        }
        else if(isMaterialLoaded == 1) {
            loadFile("https://web.cs.wpi.edu/~jmcuneo/cs4731/project3_1/car.mtl", "MTL");
        }
        else if(isMaterialLoaded == 2) {
            loadFile("https://web.cs.wpi.edu/~jmcuneo/cs4731/project3_1/bunny.mtl", "MTL");
        }
        else if(isMaterialLoaded == 3) {
            loadFile("https://web.cs.wpi.edu/~jmcuneo/cs4731/project3_1/lamp.mtl", "MTL");
        }
        else if(isMaterialLoaded == 4) {
            loadFile("https://web.cs.wpi.edu/~jmcuneo/cs4731/project3_1/stopsign.mtl", "MTL");
        }
        else if(isObjectLoaded == 0) {
            loadFile("https://web.cs.wpi.edu/~jmcuneo/cs4731/project3_1/street.obj", "OBJ");
        }
        else if(isObjectLoaded == 1) {
            loadFile("https://web.cs.wpi.edu/~jmcuneo/cs4731/project3_1/car.obj", "OBJ");
        }
        else if(isObjectLoaded == 2) {
            loadFile("https://web.cs.wpi.edu/~jmcuneo/cs4731/project3_1/bunny.obj", "OBJ");
        }
        else if(isObjectLoaded == 3) {
            loadFile("https://web.cs.wpi.edu/~jmcuneo/cs4731/project3_1/lamp.obj", "OBJ");
        }
        else if(isObjectLoaded == 4) {
            loadFile("https://web.cs.wpi.edu/~jmcuneo/cs4731/project3_1/stopsign.obj", "OBJ");
        }
    }
    requestAnimFrame(render);
}