import { createProgram, createShader } from '../utils/code/gl-utils.js';
import { perspective, rotateX, mult, translate } from '../utils/code/math-utils.js';
import { square } from '../utils/code/primitive-utils.js';

const scene = {
  square: {
    vao: null,
    angle: 0,
    modelMatrixFront: null,
    modelMatrixBack: null
  },
  modelLoc: null,
  projectionLoc: null,
  projectionMatrix: null
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
  const vertexShaderCode = document.querySelector('[type="shader/vertex"]').textContent;
  const fragmentShaderCode = document.querySelector('[type="shader/fragment"]').textContent;
  
  // finaliza a combinação (compila + link) dos shaders em um programa
  const program = createProgram(gl,
    createShader(gl, 'vs', gl.VERTEX_SHADER, vertexShaderCode),
    createShader(gl, 'fs', gl.FRAGMENT_SHADER, fragmentShaderCode)
  );
  gl.useProgram(program);
  
  // VAO + VBO quadrado
  scene.square.vao = gl.createVertexArray()
  gl.bindVertexArray(scene.square.vao)
  const vbo = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
  gl.bufferData(gl.ARRAY_BUFFER, square(0, 0, 0, 1), gl.STATIC_DRAW)
  const positionAttributeLocation = gl.getAttribLocation(program, 'position')
  gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0)
  gl.enableVertexAttribArray(positionAttributeLocation)
  
  // localização de uniforms
  scene.projectionLoc = gl.getUniformLocation(program, 'projection');
  scene.modelLoc = gl.getUniformLocation(program, 'model');

  scene.projectionMatrix = perspective(Math.PI / 4, 1, 0.1, 100)
  gl.uniformMatrix4fv(scene.projectionLoc, false, scene.projectionMatrix);
  
  gl.clearColor(1.0, 1.0, 1.0, 1.0)

  // habilita o descarte de faces traseiras (back-face culling)
  gl.enable(gl.CULL_FACE)
  gl.cullFace(gl.BACK)  // opcional: é o valor padrão. Outro seria gl.FRONT
  gl.frontFace(gl.CCW)  // opcional: é o valor padrão. Outro seria gl.CW
}

export function render(gl) {
  gl.clear(gl.COLOR_BUFFER_BIT);
  
  gl.bindVertexArray(scene.square.vao)
  gl.uniformMatrix4fv(scene.projectionLoc, false, scene.projectionMatrix)
  // desenha o quadrado de frente usando TRIANGLE_FAN
  gl.uniformMatrix4fv(scene.modelLoc, false, scene.square.modelMatrixFront)
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4)

  // desenha o quadrado de trás usando LINE_LOOP
  gl.uniformMatrix4fv(scene.modelLoc, false, scene.square.modelMatrixBack)
  gl.drawArrays(gl.LINE_LOOP, 0, 4)
}

export function update(dt) {
  scene.square.angle += dt * 1
  if (scene.square.angle > 2 * Math.PI) {
    scene.square.angle -= 2 * Math.PI
  }

  // atualiza a matriz de cada quadrado (frente e trás)
  // frente: rotação com ângulo atual
  // trás: rotação com ângulo oposto (ângulo atual + 180°)
  scene.square.modelMatrixFront = mult(translate(0, 0, -3), rotateX(scene.square.angle))
  scene.square.modelMatrixBack = mult(translate(0, 0, -3), rotateX(scene.square.angle + Math.PI))
}
