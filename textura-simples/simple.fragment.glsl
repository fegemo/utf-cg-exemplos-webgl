#version 300 es

precision mediump float;

// ℹ️ nova uniform: a textura que será amostrada no shader
uniform sampler2D u_texture;

// ℹ️ nova varying: coordenada de textura interpolada pelo vertex shader
in vec2 v_texcoord;

out vec4 outColor;

void main() {
    outColor = texture(u_texture, v_texcoord);
}
