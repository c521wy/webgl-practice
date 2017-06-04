
struct PointLight{
    highp vec3 position;
    highp vec3 ambient;
    highp vec3 diffuse;
    highp vec3 specular;
};


uniform highp sampler2D uTexture0;
uniform PointLight light;

varying highp vec4 vPosition;
varying highp vec2 vCoord;
varying highp vec3 vNormal;

highp vec3 getDisffuse() {
    highp vec3 lightDir = normalize(light.position - vPosition.xyz);
    highp float diff = max(dot(lightDir, vNormal), 0.0);
    highp vec3 diffuse = light.diffuse * diff;
    return diffuse;
}

highp vec3 getSpecular() {
    highp vec3 lightDir = normalize(light.position - vPosition.xyz);
    highp vec3 reflectDir = reflect(-lightDir, vNormal);
    highp vec3 viewDir = normalize(-vPosition.xyz);
    highp float spec = pow(max(dot(viewDir, reflectDir), 0.0), 16.0);
    highp vec3 specular = light.specular * spec;
    return specular;
}

void main(void) {
    highp vec4 objColor = texture2D(uTexture0, vCoord);

    highp vec3 ambient = light.ambient;
    highp vec3 diffuse = getDisffuse();
    highp vec3 specular = getSpecular();

    gl_FragColor = vec4(ambient + diffuse + specular, 1.0) * objColor;
}