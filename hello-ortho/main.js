import { createProgram, createShader } from '../utils/code/gl-utils.js';

export function setupWebGL() {
    // inicializa o WebGL2
    const canvas = document.querySelector('.example-canvas');
    const gl = canvas.getContext('webgl2');
    
    if (!gl) {
      console.error('WebGL2 não está disponível');
      throw new Error('WebGL2 não suportado');
    }

    return gl
}

export function initialize(gl) {
    // inicializa o shader the vértice e fragmento e em seguida os compila
    // são programas executados pela GPU sempre que algo precisa ser desenhado
    const vertexShaderCode = document.querySelector('[type="shader/vertex"]').textContent;
    const fragmentShaderCode = document.querySelector('[type="shader/fragment"]').textContent;

    
    // finaliza a combinação (compila + link) dos shaders em um programa
    const program = createProgram(gl,
      createShader(gl, 'vs', gl.VERTEX_SHADER, vertexShaderCode),
      createShader(gl, 'fs', gl.FRAGMENT_SHADER, fragmentShaderCode)
    );
    gl.useProgram(program);
    
    // define os vértices de um triângulo
    const vertices = new Float32Array([
      0.0,  0.5,   // topo
      -0.5, -0.5,  // esquerda
      0.5, -0.5    // direita
    ]);
    
    // cria um VAO para as configurações do triângulo e um Buffer com vértices
    // gl.bufferData(...): move os dados dos vértices: RAM -> VRAM (GPU)
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    
    // configura o atributo 'position' ("in vec2 position" do shader) para 
    // receber os dados do buffer quando o programa (shaders) for executado
    const positionAttributeLocation = gl.getAttribLocation(program, 'position');
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionAttributeLocation);

    gl.clearColor(1.0, 1.0, 1.0, 1.0); // fundo branco
    // --- fim do código de configuração ---
}

export function render(gl) {
    // renderiza: desenha o VAO que estava ativado: o do triângulo
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}
