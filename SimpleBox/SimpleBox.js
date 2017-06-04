var Mat4 = (function () {
    function Mat4() {
        this.__hold = mat4.create();
        this.__temp = mat4.create();
    }
    Mat4.prototype.translate = function (vec) {
        mat4.identity(this.__temp);
        mat4.translate(this.__temp, this.__temp, vec);
        mat4.multiply(this.__hold, this.__temp, this.__hold);
        return this;
    };
    Mat4.prototype.rotate = function (rad, axis) {
        mat4.identity(this.__temp);
        mat4.rotate(this.__temp, this.__temp, rad, axis);
        mat4.multiply(this.__hold, this.__temp, this.__hold);
        return this;
    };
    Mat4.prototype.lookAt = function (eye, center, up) {
        mat4.lookAt(this.__hold, eye, center, up);
        return this;
    };
    Mat4.prototype.perspective = function (fovy, aspect, near, far) {
        mat4.perspective(this.__hold, fovy, aspect, near, far);
        return this;
    };
    Mat4.prototype.toFloat32Array = function () {
        return this.__hold;
    };
    return Mat4;
}());
var Box = (function () {
    function Box(gl) {
        this.vertexPos = new Float32Array([
            // up
            -1.0, 1.0, -1.0,
            1.0, 1.0, -1.0,
            -1.0, 1.0, 1.0,
            1.0, 1.0, 1.0,
            // down
            -1.0, -1.0, 1.0,
            1.0, -1.0, 1.0,
            -1.0, -1.0, -1.0,
            1.0, -1.0, -1.0,
            // left
            -1.0, 1.0, -1.0,
            -1.0, 1.0, 1.0,
            -1.0, -1.0, -1.0,
            -1.0, -1.0, 1.0,
            // right
            1.0, 1.0, 1.0,
            1.0, 1.0, -1.0,
            1.0, -1.0, 1.0,
            1.0, -1.0, -1.0,
            // front
            -1.0, 1.0, 1.0,
            1.0, 1.0, 1.0,
            -1.0, -1.0, 1.0,
            1.0, -1.0, 1.0,
            // back
            -1.0, -1.0, -1.0,
            1.0, -1.0, -1.0,
            -1.0, 1.0, -1.0,
            1.0, 1.0, -1.0
        ]);
        this.vertexPosBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertexPos, gl.STATIC_DRAW);
        this.vertexIndex = new Uint16Array([
            // up
            0, 2, 1,
            2, 3, 1,
            // down
            4, 6, 5,
            6, 7, 5,
            // left
            8, 10, 9,
            10, 11, 9,
            // right
            12, 14, 13,
            14, 15, 13,
            // front
            16, 18, 17,
            18, 19, 17,
            // back
            20, 22, 21,
            22, 23, 21
        ]);
        this.vertexIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.vertexIndex, gl.STATIC_DRAW);
        this.vertexCoord = new Float32Array([
            // up
            0.0, 0.0,
            1.0, 0.0,
            0.0, 1.0,
            1.0, 1.0,
            // down
            0.0, 0.0,
            1.0, 0.0,
            0.0, 1.0,
            1.0, 1.0,
            // left
            0.0, 0.0,
            1.0, 0.0,
            0.0, 1.0,
            1.0, 1.0,
            // right
            0.0, 0.0,
            1.0, 0.0,
            0.0, 1.0,
            1.0, 1.0,
            // front
            0.0, 0.0,
            1.0, 0.0,
            0.0, 1.0,
            1.0, 1.0,
            // back
            0.0, 0.0,
            1.0, 0.0,
            0.0, 1.0,
            1.0, 1.0
        ]);
        this.vertexCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertexCoord, gl.STATIC_DRAW);
        this.wMatrix = new Mat4();
        this.texture0Image = document.getElementById("texture0");
        this.texture0 = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture0);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.texture0Image);
    }
    Box.prototype.update = function () {
        this.wMatrix.rotate(glMatrix.toRadian(1), [0.0, 1.0, 0.0]);
    };
    Box.prototype.render = function (gl, program) {
        var aVertexPos = gl.getAttribLocation(program, "aVertexPos");
        gl.enableVertexAttribArray(aVertexPos);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPosBuffer);
        gl.vertexAttribPointer(aVertexPos, 3, gl.FLOAT, false, 0, 0);
        var aVertexCoord = gl.getAttribLocation(program, "aVertexCoord");
        gl.enableVertexAttribArray(aVertexCoord);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexCoordBuffer);
        gl.vertexAttribPointer(aVertexCoord, 2, gl.FLOAT, false, 0, 0);
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "uWMatrix"), false, this.wMatrix.toFloat32Array());
        gl.bindTexture(gl.TEXTURE_2D, this.texture0);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.uniform1i(gl.getUniformLocation(program, "uTexture0"), 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
        gl.drawElements(gl.TRIANGLES, this.vertexIndex.length, gl.UNSIGNED_SHORT, 0);
    };
    return Box;
}());
var Camera = (function () {
    function Camera() {
        this.vMatrix = new Mat4().lookAt([0.0, 0.0, 5.0], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0]);
        this.pMatrix = new Mat4().perspective(glMatrix.toRadian(90), viewport.width / viewport.height, 0.01, 1000.0);
    }
    Camera.prototype.active = function (gl, program) {
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "uVMatrix"), false, this.vMatrix.toFloat32Array());
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "uPMatrix"), false, this.pMatrix.toFloat32Array());
    };
    Camera.prototype.translate = function (vec) {
        this.vMatrix.translate([-vec[0], -vec[1], -vec[2]]);
        return this;
    };
    Camera.prototype.rotate = function (rad, axis) {
        this.vMatrix.rotate(rad, axis);
        return this;
    };
    return Camera;
}());
var ShaderProgram = (function () {
    function ShaderProgram(gl) {
        this.vsSouce = "" +
            "attribute vec3 aVertexPos;" +
            "attribute vec2 aVertexCoord;" +
            "" +
            "uniform mat4 uWMatrix;" +
            "uniform mat4 uVMatrix;" +
            "uniform mat4 uPMatrix;" +
            "" +
            "varying highp vec2 vCoord;" +
            "" +
            "void main(void) {" +
            "   gl_Position = uPMatrix * uVMatrix * uWMatrix * vec4(aVertexPos, 1.0);" +
            "   vCoord = aVertexCoord;" +
            "}";
        this.fsSouce = "" +
            "uniform sampler2D uTexture0;" +
            "" +
            "varying highp vec2 vCoord;" +
            "" +
            "void main(void) {" +
            "   gl_FragColor = texture2D(uTexture0, vCoord);" +
            "}";
        function createShader(source, type) {
            var shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                throw new Error(gl.getShaderInfoLog(shader));
            }
            return shader;
        }
        var vShader = createShader(this.vsSouce, gl.VERTEX_SHADER);
        var fShader = createShader(this.fsSouce, gl.FRAGMENT_SHADER);
        this.program = gl.createProgram();
        gl.attachShader(this.program, vShader);
        gl.attachShader(this.program, fShader);
        gl.linkProgram(this.program);
        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            var err = new Error(gl.getProgramInfoLog(this.program));
            this.program = null;
            throw err;
        }
    }
    return ShaderProgram;
}());
var viewport, gl, box, camera, shaderProgram;
window.onload = function () {
    viewport = document.getElementById("viewport");
    gl = viewport.getContext("webgl");
    if (!gl) {
        throw new Error("Failed to init WebGL");
    }
    box = new Box(gl);
    camera = new Camera();
    shaderProgram = new ShaderProgram(gl);
    function renderFrame() {
        box.update();
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
        gl.useProgram(shaderProgram.program);
        camera.active(gl, shaderProgram.program);
        box.render(gl, shaderProgram.program);
        requestAnimationFrame(renderFrame);
    }
    renderFrame();
};
var mouseDown = false;
var lastMousePos = { x: 0, y: 0 };
window.onmousedown = function (e) {
    mouseDown = true;
    lastMousePos = { x: e.clientX, y: e.clientY };
};
window.onmouseup = function (e) {
    mouseDown = false;
    lastMousePos = { x: 0, y: 0 };
};
window.onmousemove = function (e) {
    if (mouseDown) {
        var distanceX = e.clientX - lastMousePos.x, distanceY = e.clientY - lastMousePos.y;
        camera.rotate(glMatrix.toRadian(distanceY / 10), [1.0, 0.0, 0.0])
            .rotate(glMatrix.toRadian(distanceX / 10), [0.0, 1.0, 0.0]);
        lastMousePos = { x: e.clientX, y: e.clientY };
    }
};
window.onkeydown = function (e) {
    switch (e.keyCode) {
        case 37:
            camera.translate([-0.1, 0.0, 0.0]);
            break;
        case 38:
            camera.translate([0.0, 0.1, 0.0]);
            break;
        case 39:
            camera.translate([0.1, 0.0, 0.0]);
            break;
        case 40:
            camera.translate([0.0, -0.1, 0.0]);
            break;
    }
};
