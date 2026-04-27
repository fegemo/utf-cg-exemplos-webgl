#version 300 es

precision mediump float;
in vec3 v_color;

in vec3 v_normal;
out vec4 outColor;
uniform float u_alpha;

void main() {
    outColor = vec4(v_color, u_alpha);
}
