declare let glMatrix, mat4, vec3, vec4, $;

class Mat4 {

    __hold: Float32Array = mat4.create();
    __temp: Float32Array = mat4.create();

    translate(vec: number[]): Mat4 {
        mat4.identity(this.__temp);
        mat4.translate(this.__temp, this.__temp, vec);
        mat4.multiply(this.__hold, this.__temp, this.__hold);
        return this;
    }

    rotate(rad: number, axis: number[]): Mat4 {
        mat4.identity(this.__temp);
        mat4.rotate(this.__temp, this.__temp, rad, axis);
        mat4.multiply(this.__hold, this.__temp, this.__hold);
        return this;
    }

    lookAt(eye: number[], center: number[], up: number[]): Mat4 {
        mat4.lookAt(this.__hold, eye, center, up);
        return this;
    }

    scale(vec: number[]): Mat4 {
        mat4.identity(this.__temp);
        mat4.scale(this.__temp, this.__temp, vec);
        mat4.multiply(this.__hold, this.__temp, this.__hold);
        return this;
    }

    perspective(fovy: number, aspect: number, near: number, far: number): Mat4 {
        mat4.perspective(this.__hold, fovy, aspect, near, far);
        return this;
    }

    toFloat32Array(): Float32Array {
        return this.__hold;
    }

    identity(): Mat4 {
        mat4.identity(this.__hold);
        return this;
    }

    multiply(left: Mat4): Mat4 {
        mat4.multiply(this.__hold, left.__hold, this.__hold);
        return this;
    }

    invert(): Mat4 {
        mat4.invert(this.__hold, this.__hold);
        return this;
    }

    transpose(): Mat4 {
        mat4.transpose(this.__hold, this.__hold);
        return this;
    }
}


class PointLight {
    position: Float32Array;
    wMatrix: Mat4;
    mMatrix: Mat4;
    ambient: Float32Array;
    diffuse: Float32Array;
    specular: Float32Array;

    constructor(pos: number[], ambient: number[], diffuse: number[], specular: number[]) {
        this.position = new Float32Array(pos);
        this.wMatrix = new Mat4().translate(pos);
        this.mMatrix = new Mat4();
        this.ambient = new Float32Array(ambient);
        this.diffuse = new Float32Array(diffuse);
        this.specular = new Float32Array(specular);
    }

    active(gl: WebGLRenderingContext, program: WebGLProgram, camera: Camera) {
        this.mMatrix.identity().multiply(this.wMatrix).multiply(camera.vMatrix);
        let positionAfterTransform: Float32Array = vec4.create();
        vec4.transformMat4(positionAfterTransform, [0.0, 0.0, 0.0, 1.0], this.mMatrix.__hold);
        gl.uniform3fv(gl.getUniformLocation(program, "light.position"), [positionAfterTransform[0], positionAfterTransform[1], positionAfterTransform[2]]);
        gl.uniform3fv(gl.getUniformLocation(program, "light.ambient"), this.ambient);
        gl.uniform3fv(gl.getUniformLocation(program, "light.diffuse"), this.diffuse);
        gl.uniform3fv(gl.getUniformLocation(program, "light.specular"), this.specular);
    }
}

class Box {

    vertexPos: Float32Array;
    vertexPosBuffer: WebGLBuffer;
    vertexIndex: Uint16Array;
    vertexIndexBuffer: WebGLBuffer;
    vertexCoord: Float32Array;
    vertexCoordBuffer: WebGLBuffer;
    vertexNormal: Float32Array;
    vertexNormalBuffer: WebGLBuffer;

    wMatrix: Mat4;
    mMatrix: Mat4;

    texture0Image: HTMLImageElement;
    texture0: WebGLTexture;

    constructor(gl: WebGLRenderingContext) {
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

        this.vertexNormal = new Float32Array([
            // up
            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,
            // down
            0.0, -1.0, 0.0,
            0.0, -1.0, 0.0,
            0.0, -1.0, 0.0,
            0.0, -1.0, 0.0,
            // left
            -1.0, 0.0, 0.0,
            -1.0, 0.0, 0.0,
            -1.0, 0.0, 0.0,
            -1.0, 0.0, 0.0,
            // right
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,
            // front
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            // back
            0.0, 0.0, -1.0,
            0.0, 0.0, -1.0,
            0.0, 0.0, -1.0,
            0.0, 0.0, -1.0
        ]);
        this.vertexNormalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertexNormal, gl.STATIC_DRAW);

        this.wMatrix = new Mat4();
        this.mMatrix = new Mat4();

        this.texture0Image = <HTMLImageElement>document.getElementById("texture0");
        this.texture0 = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture0);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.texture0Image);

    }

    update() {
        this.wMatrix.rotate(glMatrix.toRadian(1), [0.0, 1.0, 0.0]);
    }

    render(gl: WebGLRenderingContext, program: WebGLProgram, camera: Camera) {
        let aVertexPos = gl.getAttribLocation(program, "aVertexPos");
        gl.enableVertexAttribArray(aVertexPos);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPosBuffer);
        gl.vertexAttribPointer(aVertexPos, 3, gl.FLOAT, false, 0, 0);

        let aVertexCoord = gl.getAttribLocation(program, "aVertexCoord");
        gl.enableVertexAttribArray(aVertexCoord);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexCoordBuffer);
        gl.vertexAttribPointer(aVertexCoord, 2, gl.FLOAT, false, 0, 0);

        let aVertexNormal = gl.getAttribLocation(program, "aVertexNormal");
        gl.enableVertexAttribArray(aVertexNormal);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexNormalBuffer);
        gl.vertexAttribPointer(aVertexNormal, 3, gl.FLOAT, false, 0, 0);

        gl.uniformMatrix4fv(gl.getUniformLocation(program, "uMMatrix"), false,
            this.mMatrix.identity().multiply(this.wMatrix).multiply(camera.vMatrix).toFloat32Array());
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "uPMatrix"), false, camera.pMatrix.toFloat32Array());
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "uNormalMatrix"), false,
            this.mMatrix.invert().transpose().toFloat32Array());

        gl.bindTexture(gl.TEXTURE_2D, this.texture0);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.uniform1i(gl.getUniformLocation(program, "uTexture0"), 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
        gl.drawElements(gl.TRIANGLES, this.vertexIndex.length, gl.UNSIGNED_SHORT, 0);
    }

}

class Camera {
    vMatrix: Mat4;
    pMatrix: Mat4;

    constructor() {
        this.vMatrix = new Mat4().lookAt([0.0, 0.0, 30.0], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0]);
        this.pMatrix = new Mat4().perspective(glMatrix.toRadian(90), viewport.width / viewport.height, 0.01, 1000.0);
    }

    active(gl: WebGLRenderingContext, program: WebGLProgram) {
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "uVMatrix"), false, this.vMatrix.toFloat32Array());
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "uPMatrix"), false, this.pMatrix.toFloat32Array());
    }

    translate(vec: number[]): Camera {
        this.vMatrix.translate([-vec[0], -vec[1], -vec[2]]);
        return this;
    }

    rotate(rad: number, axis: number[]): Camera {
        this.vMatrix.rotate(rad, axis);
        return this;
    }
}

class ShaderProgram {

    program: WebGLProgram;

    constructor(gl: WebGLRenderingContext) {
        function createShader(source: string, type: number): WebGLShader {
            let shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                throw new Error(gl.getShaderInfoLog(shader));
            }
            return shader;
        }

        function loadShaderSource(url: string): string {
            let source;
            $.ajax({
                url: url,
                type: "GET",
                async: false,
                dataType: "text",
                success: function (resp) {
                    source = resp;
                }
            });
            if (!source) {
                throw new Error("Failed to load shader");
            }
            return source;
        }

        let vShader = createShader(loadShaderSource("vs.glsl"), gl.VERTEX_SHADER);
        let fShader = createShader(loadShaderSource("fs.glsl"), gl.FRAGMENT_SHADER);

        this.program = gl.createProgram();
        gl.attachShader(this.program, vShader);
        gl.attachShader(this.program, fShader);
        gl.linkProgram(this.program);
        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            let err = new Error(gl.getProgramInfoLog(this.program));
            this.program = null;
            throw err;
        }
    }
}


let viewport: HTMLCanvasElement,
    gl: WebGLRenderingContext,
    box: Box,
    camera: Camera,
    shaderProgram: ShaderProgram,
    pointLight: PointLight;


window.onload = function () {
    viewport = <HTMLCanvasElement>document.getElementById("viewport");
    gl = viewport.getContext("webgl");
    if (!gl) {
        throw new Error("Failed to init WebGL");
    }

    box = new Box(gl);
    box.wMatrix.scale([10.0, 10.0, 10.0]);

    camera = new Camera();
    shaderProgram = new ShaderProgram(gl);
    pointLight = new PointLight([0.0, 12.0, 0.0], [0.1, 0.1, 0.1], [1.0, 1.0, 1.0], [1.0, 1.0, 1.0]);


    function renderFrame() {
        box.update();

        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

        gl.useProgram(shaderProgram.program);

        pointLight.active(gl, shaderProgram.program, camera);

        box.render(gl, shaderProgram.program, camera);

        requestAnimationFrame(renderFrame);
    }

    renderFrame();

};

let mouseDown = false;
let lastMousePos = {x: 0, y: 0};
window.onmousedown = function (e) {
    mouseDown = true;
    lastMousePos = {x: e.clientX, y: e.clientY};
};
window.onmouseup = function (e) {
    mouseDown = false;
    lastMousePos = {x: 0, y: 0};
};
window.onmousemove = function (e) {
    if (mouseDown) {
        let distanceX = e.clientX - lastMousePos.x,
            distanceY = e.clientY - lastMousePos.y;
        camera.rotate(glMatrix.toRadian(distanceY / 10), [1.0, 0.0, 0.0])
            .rotate(glMatrix.toRadian(distanceX / 10), [0.0, 1.0, 0.0]);
        lastMousePos = {x: e.clientX, y: e.clientY};
    }
};

window.onkeydown = function (e) {
    switch (e.keyCode) {
        case 37:
            camera.translate([-1.0, 0.0, 0.0]);
            break;
        case 38:
            camera.translate([0.0, 1.0, 0.0]);
            break;
        case 39:
            camera.translate([1.0, 0.0, 0.0]);
            break;
        case 40:
            camera.translate([0.0, -1.0, 0.0]);
            break;
    }
};
