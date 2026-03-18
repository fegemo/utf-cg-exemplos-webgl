import { createProgram, createShader } from '../utils/code/gl-utils.js';
import { ortho } from '../utils/code/math-utils.js';

// ℹ️ objeto global para armazenar os objetos da cena
// agora é necessário para armazenarmos os VAOs de cada objeto,
// para poder ativá-los na função de renderização
const sceneObjects = {
    // inicialmente vazio, mas depois terá os VAOs do quadrado e triângulo
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
    gl.program = program
    
    // define os vértices de um quadrado
    const quadVertices = new Float32Array([
      20, 20, // ↙️
      80, 20, // ↘️
      80, 80, // ↗️
      20, 80  // ↖️
    ])

    const triVertices = new Float32Array([
      120, 120, // ↙️
      180, 120, // ↘️
      150, 180  // ⬆️
    ])
    
    // ℹ️ quadrado: VAO + VBO para posição
    sceneObjects.quadVAO = gl.createVertexArray()
    gl.bindVertexArray(sceneObjects.quadVAO)
    const quadPositionVBO = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, quadPositionVBO)
    gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW)
    const positionAttributeLocation = gl.getAttribLocation(program, 'position')
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(positionAttributeLocation)

    // ℹ️ triângulo: VAO + VBO para posição
    sceneObjects.triVAO = gl.createVertexArray()
    gl.bindVertexArray(sceneObjects.triVAO)
    const triPositionVBO = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, triPositionVBO)
    gl.bufferData(gl.ARRAY_BUFFER, triVertices, gl.STATIC_DRAW)
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(positionAttributeLocation)
    
    // encontra a localização da variável 'projection' do shader e 
    // define a matriz de projeção ortográfica
    const projectionUniformLocation = gl.getUniformLocation(program, 'projection')
    const projectionMatrix = ortho(0, 200, 0, 200, -1, 1)
    gl.uniformMatrix4fv(projectionUniformLocation, false, projectionMatrix)

    gl.clearColor(1.0, 1.0, 1.0, 1.0) // fundo branco
}

export function render(gl) {
    // apaga a tela
    gl.clear(gl.COLOR_BUFFER_BIT)

    // ℹ️ ativa o VAO do quadrado e desenha ele
    gl.bindVertexArray(sceneObjects.quadVAO)
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4)

    // ℹ️ ativa o VAO do triângulo e desenha ele
    gl.bindVertexArray(sceneObjects.triVAO)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
}
