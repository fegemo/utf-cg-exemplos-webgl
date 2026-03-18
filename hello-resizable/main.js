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
    gl.program = program
    
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

    // ℹ️ configura os "limites do mundo" (projeção) e registra para reconfigurar
    // sempre que o canvas for redimensionado
    const projectionUniformLocation = gl.getUniformLocation(program, 'projection')
    configureResizableWorld(gl, projectionUniformLocation)

    gl.clearColor(1.0, 1.0, 1.0, 1.0); // fundo branco
}

function configureResizableWorld(gl, projectionUniformLocation) {
    const resizableContainer = gl.canvas.closest('.resizable-container')
    
    // ℹ️ cria um observador do tamanho do canvas
    const resizeObserver = new ResizeObserver(([entry, ...others]) => {
      const { width, height } = entry.contentRect

      // ℹ️ define o sistema da janela de visualização para cobrir todo o canvas
      // e redesenha
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
      // ℹ️ calcula a matriz de projeção ortográfica considerando
      // a proporção de largura/altura do canvas para evitar distorção
      // da imagem (achatada ou alongada)
      const aspectRatio = width / height
      const projectionMatrix = ortho(0, 100, 0, 100/aspectRatio, -1, 1)
      
      // ℹ️ envia a matriz de projeção para o shader (GPU) para que seja usada,
      // daí redesenha no novo estado
      gl.uniformMatrix4fv(projectionUniformLocation, false, projectionMatrix)
      render(gl)
    })

    resizeObserver.observe(resizableContainer)
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
