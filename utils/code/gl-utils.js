export const createShader = (gl, name, type, source) => {
  // cria 
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source.trim());
  gl.compileShader(shader);
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }
  
  // lidando com erros de compilação
  const infoLog = gl.getShaderInfoLog(shader);
  console.error(`Erro ao compilar o shader ${name}:`, infoLog);
  gl.deleteShader(shader);
  throw new Error(`Falha na compilação do shader ${name}: ` + infoLog);
};


export const createProgram = (gl, vertexShader, fragmentShader) => {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }
  
  // lidando com erros de linkedição
  const infoLog = gl.getProgramInfoLog(program);
  console.error('Erro ao linkar o programa:', infoLog);
  gl.deleteProgram(program);
  throw new Error('Falha na linkedição do programa: ' + infoLog);
};

