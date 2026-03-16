#version 300 es

in vec2 a_position;

// ℹ️ novo atributo: coordenada de textura
in vec2 a_texcoord;

// ℹ️ nova variável de saída: coordenada de textura interpolada
out vec2 v_texcoord;

void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);

    // ℹ️ repassa as coordenadas de textura para o fragment shader
    // ele vai interpolar o valor para cada fragmento (pixel) do quadrilátero
    v_texcoord = a_texcoord;
}