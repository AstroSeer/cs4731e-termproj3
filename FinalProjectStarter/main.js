// WebGL globals
let canvas;
let gl;
let program;

var viewMatrixLoc;
var projectionMatrixLoc;
var viewMatrix;
var projectionMatrix;
var fColor;

var objectLoadCap = 5;
var materialLoadCap = 5;
var keepRender = false;

var texCoordsArray = [];

var texture;

var minT = 0.0;
var maxT = 1.0


var lightOn = true;
var lightPosition = vec4( 0.0, 2.0, 0.0, 0.0 ); 
var lightAmbient = vec4( 0.1, 0.1, 0.1, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 0.3, 0.3, 0.3, 1.0 );
var materialDiffuse;
var materialSpecular;
var materialShininess = 20.0;

var texCoord = [
    vec2(minT, minT),
    vec2(minT, maxT),
    vec2(maxT, maxT),
    vec2(maxT, minT)
];

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
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Initialize shaders
    program = initShaders(gl, "vshader", "fshader");
    gl.useProgram(program);

    aspect = canvas.width/canvas.height;

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    render();
}

function setObjects() {
    for(var x = 0; x < objectLoadCap; x++) {
        for(let key of finalVerts[x]) {
            // console.log(key);
            // console.log(diffuseMap.get(key[0]));
            materialDiffuse = diffuseMap.get(key[0]);
            materialSpecular = specularMap.get(key[0]);

            //console.log(materialDiffuse);

            var diffuseProduct = mult(lightDiffuse, materialDiffuse);
            var specularProduct = mult(lightSpecular, materialSpecular);
            var ambientProduct = mult(lightAmbient, materialAmbient);
    
            // console.log(diffuseProduct);
            // console.log(specularProduct);

            var transformMatrix;
            switch(x) {
                case 0:
                    transformMatrix = translate(0, 0, 0);
                    break;
                case 1:
                    transformMatrix = translate(2.75, 0, 0);
                    break;
                case 2:
                    transformMatrix = translate(1, 1, 0);
                    break;
                case 3:
                    transformMatrix = translate(0, 0, 0);
                    break;
                case 4:
                    transformMatrix = translate(-1, 0, -4);
                    break;
            }
            var modelMatrix = gl.getUniformLocation(program, "modelMatrix");
            gl.uniformMatrix4fv(modelMatrix, false, flatten(transformMatrix));

            var rBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, rBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(key[1]), gl.STATIC_DRAW);

            var rPosition = gl.getAttribLocation( program, "vPosition");
            gl.vertexAttribPointer(rPosition, 4, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(rPosition);

            var vNormal = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vNormal);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(finalNorms[x].get(key[0])), gl.STATIC_DRAW);

            var vNormalPosition = gl.getAttribLocation( program, "vNormal");
            gl.vertexAttribPointer(vNormalPosition, 4, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(vNormalPosition);

            //console.log(finalNorms);

            gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct));
            gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct));
            gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct));
            gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition));
            gl.uniform1f(gl.getUniformLocation(program, "shininess"), materialShininess);

            gl.drawArrays(gl.TRIANGLES, 0, flatten(key[1]).length);
        }
        //console.log(finalUVs[x]);
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
});

function processData() {
    viewMatrixLoc = gl.getUniformLocation( program, "viewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

    eye = vec3(0, 3, 8);
    viewMatrix = lookAt(eye, at , up);
    projectionMatrix = perspective(fov, aspect, near, far);

    gl.uniformMatrix4fv(viewMatrixLoc, false, flatten(viewMatrix) );
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
    //console.log(diffuseMap);
    setObjects();
    //console.log(finalVerts);
}

function configureTexture(image) {
    var tex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);

}

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
    if(isBusy == false) {
        if(isObjectLoaded == objectLoadCap && isMaterialLoaded == materialLoadCap) {
            //console.log(textureURL);
            //console.log(currMaterial);
            // console.log(diffuseMap);
            // console.log(specularMap);
            processData();    
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