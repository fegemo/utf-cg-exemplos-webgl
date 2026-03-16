export function setupWebGL() {
    const canvas = document.querySelector('.example-canvas');
    const gl = canvas.getContext('webgl2');
    
    if (!gl) {
      console.error('WebGL2 não está disponível');
      throw new Error('WebGL2 não suportado');
    }

    return gl
}

export async function initialize(gl) {
    gl.clearColor(1.0, 1.0, 1.0, 1.0); // fundo branco
}

export function render(gl) {
    // renderiza: apaga a tela e desenha a cena
    gl.clear(gl.COLOR_BUFFER_BIT);

}
