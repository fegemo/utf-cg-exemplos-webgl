import { createProgram, createShader } from '../utils/code/gl-utils.js';
import { ortho } from '../utils/code/math-utils.js';
import { square } from '../utils/code/primitive-utils.js';

const state = {
    followType: ['follow', 'exact'][0],         // tipo de seguimento: 'follow' ou 'exact'
    offsetLocation: null,                       // localização do uniforme no shader
    target: new Float32Array([250, 250, 0]),    // posição atual do mouse
    offset: new Float32Array([20, 50, 0])       // posição atual do quadrado
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
    gl.canvas.addEventListener('mousemove', mouseMove)
    window.addEventListener('keydown', keyDown)
     
    // inicializa o shader the vértice e fragmento e em seguida os compila
    // são programas executados pela GPU sempre que algo precisa ser desenhado
    const vertexShaderCode = document.querySelector('[type="shader/vertex"]').textContent;
    const fragmentShaderCode = document.querySelector('[type="shader/fragment"]').textContent;

    
    // finaliza a combinação (compila + link) dos shaders em um programa
    const program = createProgram(gl,
      createShader(gl, 'vs', gl.VERTEX_SHADER, vertexShaderCode),
      createShader(gl, 'fs', gl.FRAGMENT_SHADER, fragmentShaderCode)
    );
    
    // define os vértices de um quadrado
    const vertices = square(0, 0, 0, 35)
    
    // cria um VAO para as configurações do quadrado e um Buffer com vértices
    // gl.bufferData(...): move os dados dos vértices: RAM -> VRAM (GPU)
    const vao = gl.createVertexArray()
    gl.bindVertexArray(vao)
    const vbo = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)
    
    // configura o atributo 'position' ("in vec3 position" do shader) para 
    // receber os dados do buffer quando o programa (shaders) for executado
    const positionAttributeLocation = gl.getAttribLocation(program, 'position')
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(positionAttributeLocation)


    // uniform da projeção
    const projectionUniformLocation = gl.getUniformLocation(program, 'projection')
    const canvasWidth = gl.canvas.width
    const canvasHeight = gl.canvas.height
    const projectionMatrix = ortho(0, canvasWidth, canvasHeight, 0, -1, 1)
    
    // armazena a localização do uniforme de cor no estado e 
    // inicializa com a cor inicial
    state.offsetLocation = gl.getUniformLocation(program, 'offset')
    state.offset = new Float32Array([canvasWidth/2, canvasHeight/2, 0])
    
    // inicia o estado do WebGL: cor de fundo e programa ativo
    gl.clearColor(1.0, 1.0, 1.0, 1.0); // fundo branco
    gl.useProgram(program);
    gl.uniform3fv(state.offsetLocation, state.offset);
    gl.uniformMatrix4fv(projectionUniformLocation, false, projectionMatrix);
}

export function render(gl) {
    // renderiza: desenha o VAO que estava ativado: o do quadrado
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform3fv(state.offsetLocation, state.offset);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}

export function update(dt) {
    const followSpeed = 1 * dt
    if (state.followType === 'follow') {
        state.offset[0] += (state.target[0] - state.offset[0]) * followSpeed
        state.offset[1] += (state.target[1] - state.offset[1]) * followSpeed
    } else if (state.followType === 'exact') {
        state.offset[0] = state.target[0]
        state.offset[1] = state.target[1]
    }
}


function mouseMove(e) {
    state.target[0] = e.offsetX
    state.target[1] = e.offsetY
}

function keyDown(e) {
    if (e.key === ' ') {
        // inverte o followType entre 'follow' e 'exact'
        state.followType = state.followType === 'follow' ? 'exact' : 'follow'
    }
}








export { state }