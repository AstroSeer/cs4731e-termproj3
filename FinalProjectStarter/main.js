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

var black = new Uint8Array([255, 0, 0, 255]);

var skyURLS = [
    "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3_1/skybox_posx.png",
    "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3_1/skybox_negx.png",
    "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3_1/skybox_posy.png",
    "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3_1/skybox_negy.png",
    "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3_1/skybox_posz.png",
    "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3_1/skybox_negz.png"
];
var skyIMG1;
var skyIMG2;
var skyIMG3;
var skyIMG4;
var skyIMG5;
var skyIMG6;

// const skyFaces = [
//     {
//       target: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
//       url: "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3_1/skybox_posx.png",
//     },
//     {
//       target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
//       url: "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3_1/skybox_negx.png",
//     },
//     {
//       target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
//       url: "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3_1/skybox_posy.png",
//     },
//     {
//       target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
//       url: "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3_1/skybox_negy.png",
//     },
//     {
//       target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
//       url: "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3_1/skybox_posz.png",
//     },
//     {
//       target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
//       url: "https://web.cs.wpi.edu/~jmcuneo/cs4731/project3_1/skybox_negz.png",
//     },
//   ];

var cubeMap;

var skyBoxOn = false;
var skyType = 0.0;

var pointsArray = [];
var texCoordsArray = [];
var colorsArray = [];

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

var cubeVerts = [
    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5, -0.5, -0.5, 1.0 )
];

var vertexColors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 0.0, 1.0, 1.0, 1.0 ),  // white
    vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan
];

var skyTexCoord = [
    [minT, minT],
    [minT, maxT],
    [maxT, maxT],
    [maxT, minT]
];

var alpha = 0.0;
var alphaY = 0.0;
var tY = 0.025;

var fov = 60;
var aspect;
var near = 0.1;
var far = 100000;

var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);
var eyeCoords = vec3(0.0, 3.0, 8.0);
var eyeMoveX = 1.0;
var eyeMoveY = -0.1;
var eyeMoveZ = -1.0;

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

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    skyIMG1 = new Image();
    skyIMG1.crossOrigin = "";
    skyIMG1.src = skyURLS[0];
    skyIMG1.onload = function() {
        console.log(skyIMG1);
    }
    skyIMG2 = new Image();
    skyIMG2.crossOrigin = "";
    skyIMG2.src = skyURLS[1];
    skyIMG2.onload = function() {
        console.log(skyIMG2);
    }
    skyIMG3 = new Image();
    skyIMG3.crossOrigin = "";
    skyIMG3.src = skyURLS[2];
    skyIMG3.onload = function() {
        console.log(skyIMG3);
    }
    skyIMG4 = new Image();
    skyIMG4.crossOrigin = "";
    skyIMG4.src = skyURLS[3];
    skyIMG4.onload = function() {
        console.log(skyIMG4);
    }
    skyIMG5 = new Image();
    skyIMG5.crossOrigin = "";
    skyIMG5.src = skyURLS[4];
    skyIMG5.onload = function() {
        console.log(skyIMG5);
    }
    skyIMG6 = new Image();
    skyIMG6.crossOrigin = "";
    skyIMG6.src = skyURLS[5];
    skyIMG6.onload = function() {
        console.log(skyIMG6);
    }
    render();
}

function quad(a, b, c, d) {
    pointsArray.push(cubeVerts[a]);
    colorsArray.push(vertexColors[a]);
    texCoordsArray.push(skyTexCoord[0]);

    pointsArray.push(cubeVerts[b]);
    colorsArray.push(vertexColors[a]);
    texCoordsArray.push(skyTexCoord[1]);

    pointsArray.push(cubeVerts[c]);
    colorsArray.push(vertexColors[a]);
    texCoordsArray.push(skyTexCoord[2]);

    pointsArray.push(cubeVerts[a]);
    colorsArray.push(vertexColors[a]);
    texCoordsArray.push(skyTexCoord[0]);

    pointsArray.push(cubeVerts[c]);
    colorsArray.push(vertexColors[a]);
    texCoordsArray.push(skyTexCoord[2]);

    pointsArray.push(cubeVerts[d]);
    colorsArray.push(vertexColors[a]);
    texCoordsArray.push(skyTexCoord[3]);
}

function setObjects() {
    var transformMatrix;
    var modelMatrix = gl.getUniformLocation(program, "modelMatrix");
    var rBuffer = gl.createBuffer();
    var rPosition = gl.getAttribLocation( program, "vPosition");
    var vNormal = gl.createBuffer();
    var vNormalPosition = gl.getAttribLocation( program, "vNormal");

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
                    transformMatrix = translate(2.85, -0.25, 0);
                    //transformMatrix = mult(transformMatrix, rotateY(180));
                    break;
                case 2:
                    transformMatrix = translate(1, 1, 0);
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
            
            if(x == 4 && finalUVs[4].get('StopMaterial')) {
                var tBuffer = gl.createBuffer();
                gl.activeTexture(gl.TEXTURE0);
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

            gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition));
            gl.uniform1f(gl.getUniformLocation(program, "shininess"), materialShininess);
            gl.uniform1f(gl.getUniformLocation(program, "vStopSign"), stopSign);

            gl.drawArrays(gl.TRIANGLES, 0, flatten(key[1]).length);
        }
    }
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
    if(code == "r" || code == "R") {
        skyBoxOn = !skyBoxOn;
    }
    if(code == "f" || code == "F") {
        skyBoxOn = !skyBoxOn;
    }
});

function configureCubeMap() {
    console.log("in cubeMap config");
    //Initialize
    cubeMap = gl.createTexture();
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeMap);

    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    //Create a 2x2 texture
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, black);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, black);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, black);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, black);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, black);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, black);


    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.uniform1i(gl.getUniformLocation(program, "texMap"), 2);
}

function setCube() {
   quad( 1, 0, 3, 2 );
   quad( 2, 3, 7, 6 );
   quad( 3, 0, 4, 7 );
   quad( 6, 5, 1, 2 );
   quad( 4, 5, 6, 7 );
   quad( 5, 4, 0, 1 );
}

function configureCubeMapImage(i1, i2, i3, i4, i5, i6) {

    //console.log(image);
    //Initialize
    cubeMap = gl.createTexture();
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeMap);

    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    //Create a 2x2 texture
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, i1);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, i2);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, i3);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, i4);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, i5);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, i6);

    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.uniform1i(gl.getUniformLocation(program, "texMap"), 3);
}

function processData() {
    viewMatrixLoc = gl.getUniformLocation( program, "viewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

    if(skyBoxOn) {
        console.log("skyBoxOn is activated");
        setCube();
        console.log(pointsArray);
        var cubeTransformMatrix = scalem(10, 10, 10);
        console.log(cubeTransformMatrix);
        console.log(colorsArray);
        console.log("----------------");
        var boxModelMatrix = gl.getUniformLocation(program, "modelMatrix");
        gl.uniformMatrix4fv(boxModelMatrix, false, flatten(cubeTransformMatrix));

        var cBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
        gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW );

        var vColor = gl.getAttribLocation( program, "vColor" );
        gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray( vColor );

        var eBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, eBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
        
        var rPosition = gl.getAttribLocation( program, "vPosition");
        gl.vertexAttribPointer(rPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(rPosition);

        skyType = 2.0;
        gl.uniform1f(gl.getUniformLocation(program, "vSkyType"), skyType);
        gl.drawArrays(gl.TRIANGLES, 0, flatten(pointsArray));
        pointsArray = [];
        colorsArray = [];
        skyType = 0.0;
    }
    gl.uniform1f(gl.getUniformLocation(program, "vSkyType"), skyType);

    var image = new Image();
    image.crossOrigin = "";
    image.src = textureURL;
    image.onload = function() {
        configureTexture(image);
    }

    eye = eyeCoords;
    viewMatrix = lookAt(eye, at , up);
    if(cameraMoving) {
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

function configureTexture1(image) {
    var tex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, tex);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);


    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.uniform1i(gl.getUniformLocation(program, "tex1"), 1);

}

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
    if(isBusy == false) {
        if(isObjectLoaded == objectLoadCap && isMaterialLoaded == materialLoadCap) {
            // console.log(textureURL);
            // console.log(currMaterial);
            // console.log(diffuseMap);
            // console.log(specularMap);
            //console.log(textureURL);
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