attribute highp vec3 aVertexPos;
attribute highp vec2 aVertexCoord;
attribute highp vec3 aVertexNormal;

uniform highp mat4 uMMatrix;
uniform highp mat4 uPMatrix;
uniform highp mat4 uNormalMatrix;

varying highp vec4 vPosition;
varying highp vec2 vCoord;
varying highp vec3 vNormal;

void main() {
    vPosition = uMMatrix * vec4(aVertexPos, 1.0);
    gl_Position = uPMatrix * vPosition;
    vCoord = aVertexCoord;
    vNormal = normalize(mat3(uNormalMatrix) * aVertexNormal);
}