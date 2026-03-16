import { createProgram, createShader } from '../utils/code/gl-utils.js';
import { mat3 } from 'https://cdn.jsdelivr.net/npm/gl-matrix@3.4.4/+esm';

const TWO_PI = Math.PI * 2;

const state = {
  angle: 0, // angulo em radianos
  speed: Math.PI / 2, // velocidade angular em rad/s
  transformLocation: null,
  transform: mat3.create()
};

export function setupWebGL() {
  const canvas = document.querySelector('.example-canvas');
  const gl = canvas.getContext('webgl2');
  if (!gl) {
    console.error('WebGL2 não está disponível');
    throw new Error('WebGL2 não suportado');
  }
  return gl;
}

export function initialize(gl) {
  const vertexShaderCode = document.querySelector('[type="shader/vertex"]').textContent;
  const fragmentShaderCode = document.querySelector('[type="shader/fragment"]').textContent;

  const program = createProgram(gl,
    createShader(gl, 'vs', gl.VERTEX_SHADER, vertexShaderCode),
    createShader(gl, 'fs', gl.FRAGMENT_SHADER, fragmentShaderCode)
  );
  gl.useProgram(program);

  // quadrado definido na origem, tamanho 0.5
  const vertices = new Float32Array([
    -0.25, -0.25,
     0.25, -0.25,
     0.25,  0.25,
    -0.25,  0.25
  ]);

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  const positionAttributeLocation = gl.getAttribLocation(program, 'position');
  gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(positionAttributeLocation);

  state.transformLocation = gl.getUniformLocation(program, 'transform');

  gl.clearColor(1.0, 1.0, 1.0, 1.0);
}

export function update(dt) {
  // velocidade: 1 volta em 4 segundos => velocidade angular = 2π/4 = π/2
  state.angle += state.speed * dt;

  if (state.angle > TWO_PI) {
    state.angle -= TWO_PI;
  } else if (state.angle < 0) {
    state.angle += TWO_PI;
  }
  mat3.fromRotation(state.transform, state.angle);
}

export function render(gl) {
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.uniformMatrix3fv(state.transformLocation, false, state.transform);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}





export { state };
