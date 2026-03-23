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
    
    // define os vértices de um quadrado
    const vertices = new Float32Array([
      20, 20, // ↙️
      80, 20, // ↘️
      80, 80, // ↗️
      20, 80  // ↖️
    ]);
    
    // cria um VAO para as configurações do quadrado e um Buffer com vértices
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

    // ℹ️ encontra a localização da variável 'projection' do shader e 
    // define a matriz de projeção ortográfica
    const projectionUniformLocation = gl.getUniformLocation(program, 'projection');
    const projectionMatrix = new Float32Array([ // ℹ️ repare: column-major order
        0.02, 0.0,  0.0, 0.0, // left: 0, right: 100
        0.0, 0.02,  0.0, 0.0, // bottom: 0, top: 100
        0.0,  0.0, -1.0, 0.0, // near: -1, far: 1
       -1.0, -1.0,  0.0, 1.0
    ]);
    // const projectionMatrix = ortho(0, 100, 0, 100, -1, 1);
    // ⬆️ há uma função auxiliar lá embaixo e também em ../utils/code/math-utils.js

    gl.uniformMatrix4fv(projectionUniformLocation, false, projectionMatrix);
    // ⬆️ define o valor da uniform 'projection' do shader para a matriz 
    // de projeção ortográfica que criamos

    gl.clearColor(1.0, 1.0, 1.0, 1.0); // fundo branco
    // --- fim do código de configuração ---
}

export function render(gl) {
    // renderiza: desenha o VAO que estava ativado: o do quadrado
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    // ⬆️ gl.TRIANGLE_FAN: cada triângulo é formado:
    // - pelo primeiro vértice 
    // - + os dois últimos
    // desenha os triângulos (20,20)-(80,20)-(80,80) e (20,20)-(80,80)-(20,80)
}


// função auxiliar para criar uma matriz de projeção ortográfica
// como um 1D array (column-major, como o WebGL espera)
function ortho(left, right, bottom, top, near, far) {
  const tx = -(right + left)/(right - left)
  const ty = -(top + bottom)/(top - bottom)
  const tz = -(far + near  )/(far - near  )

  return new Float32Array([ // lembre-se, column-major
    2/(right-left), 0, 0, 0,
    0, 2/(top-bottom), 0, 0,
    0, 0, -2/(far-near),  0,
    tx, ty, tz,           1
  ])
}
