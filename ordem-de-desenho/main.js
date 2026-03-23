import { createProgram, createShader } from '../utils/code/gl-utils.js';
import { ortho, scale } from '../utils/code/math-utils.js';

const cena = {
    vaoQuadradoGrande: null,
    vaoQuadradoPequeno: null,
    colorUniformLocation: null
}

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
    
    const verticesQuadradoGrande = new Float32Array([
      -60, -60, 0, // ↙️
       60, -60, 0, // ↘️
       60,  60, 0, // ↗️
      -60,  60, 0  // ↖️
    ])
    const verticesQuadradoPequeno = new Float32Array([
      -40, -40, 0, // ↙️
       40, -40, 0, // ↘️
       40,  40, 0, // ↗️
      -40,  40, 0  // ↖️
    ])
    
    // VAO quadrado grande
    cena.vaoQuadradoGrande = gl.createVertexArray()
    gl.bindVertexArray(cena.vaoQuadradoGrande)
    const vboQuadradoGrande = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vboQuadradoGrande)
    gl.bufferData(gl.ARRAY_BUFFER, verticesQuadradoGrande, gl.STATIC_DRAW)
    
    const positionAttributeLocation = gl.getAttribLocation(program, 'position')
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(positionAttributeLocation)

    // VAO quadrado pequeno
    cena.vaoQuadradoPequeno = gl.createVertexArray()
    gl.bindVertexArray(cena.vaoQuadradoPequeno)
    const vboQuadradoPequeno = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vboQuadradoPequeno)
    gl.bufferData(gl.ARRAY_BUFFER, verticesQuadradoPequeno, gl.STATIC_DRAW)
    
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(positionAttributeLocation)
    
    // desativa o VAO para evitar alterações acidentais
    gl.bindVertexArray(null)

    const projectionUniformLocation = gl.getUniformLocation(program, 'projection')
    cena.colorUniformLocation = gl.getUniformLocation(program, 'color')
    
    const projectionMatrix = ortho(-100, 100, -100, 100, -1, 1)
    gl.uniformMatrix4fv(projectionUniformLocation, false, projectionMatrix);

    gl.clearColor(1.0, 1.0, 1.0, 1.0); // fundo branco
    // ℹ️ ativa o teste de profundidade, para que webgl não ignore a coordenada z
    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL) // default: gl.LESS
}

export function render(gl) {
    // ℹ️ limpa o buffer de cor E O BUFFER de profundidade
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // quadrado maior, vermelho
    gl.bindVertexArray(cena.vaoQuadradoGrande)
    gl.uniform4f(cena.colorUniformLocation, 1.0, 0.0, 0.0, 1.0) // vermelho
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4)

    // quadrado menor, branco, desenhado por cima do vermelho
    gl.bindVertexArray(cena.vaoQuadradoPequeno)
    gl.uniform4f(cena.colorUniformLocation, 1.0, 1.0, 1.0, 1.0) // branco
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4)

}
