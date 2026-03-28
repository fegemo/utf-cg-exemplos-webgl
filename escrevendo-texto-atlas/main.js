import { createRenderer, loadFont } from 'https://cdn.jsdelivr.net/npm/webgl-fonts@1.2.5/+esm'
// ℹ️ neste exemplo, repare que nem precisamos definir shaders porque a própria
// lib webgl-fonts já cuida disso para nós 


const state = {
    text: 'The quick brown fox jumps over the lazy dog.',   
    font: null,
    fontPath: 'liberation-sans',
    backgroundColor: [1, 1, 1, 1],
}

// cache simples para fontes carregadas, para não precisar
// recarregá-las se já estiverem na memória
const fontCache = {}

// objeto da lib webgl-fonts que cuida de renderizar o texto
let textRenderer = null

export function setupWebGL() {
    const canvas = document.querySelector('.example-canvas');
    const gl = canvas.getContext('webgl2');
    const dppx = window.devicePixelRatio;
    const width = 500 * dppx;
    const height = 500 * dppx;
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = `${width / dppx}px`;
    canvas.style.height = `${height / dppx}px`;
    canvas.style.aspectRatio = 'unset';
    if (!gl) {
        console.error('WebGL2 não está disponível');
        throw new Error('WebGL2 não suportado');
    }
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

    return gl
}

// função registrada ao evento de 'change' do <select> de fontes 
export async function setFont(gl, fontPath) {
    // verifica se a fonte já está no cache ou se precisa carregá-la
    if (fontCache[fontPath]) {
        console.info(`Usando a fonte ${fontPath} do cache...`)
        state.font = fontCache[fontPath]
        return
    }
    console.info(`Carregando a fonte ${fontPath}...`)
    state.font = await loadFont(gl, fontPath, '../utils/sdf-fonts')
    console.info(`Fonte ${fontPath} carregada.`)
    fontCache[fontPath] = state.font
}

export async function initialize(gl) {
    // carrega os arquivos (json e png)que descrevem a fonte Roboto: 
    // por ex: ../utils/sdf-fonts/{roboto.json|roboto.png}
    await setFont(gl, state.fontPath);
    textRenderer = createRenderer(gl);

    gl.clearColor(...state.backgroundColor);
}

export function render(gl) {
    // renderiza: apaga a tela e desenha o texto
    gl.clear(gl.COLOR_BUFFER_BIT);

    // invoca o textRenderer para desenhar o texto na tela
    textRenderer.render({
        font: state.font,
        fontSize: 30,
        text: state.text,
        translateX: 0,
        translateY: 0,  // esta lib usa (0,0) no canto superior esquerdo
        fontHinting: true,
        subpixel: true,
        fontColor: [0, 0, 0, 1],
        backgroundColor: state.backgroundColor,
    })

    // invoca de novo
    textRenderer.render({
        font: state.font,
        fontSize: 12,
        text: 'Acentos funcionam... Será? Depende da fonte ;)...',
        translateX: 20,
        translateY: 90,
        fontHinting: true,
        subpixel: true,
        fontColor: [0.4, 0.7, 0.24, 1],
        backgroundColor: state.backgroundColor
    })

    // invoca de novo
    textRenderer.render({
        font: state.font,
        fontSize: 12,
        text: 'WebGL Fonts!',
        translateX: 0,
        translateY: 140,
        fontHinting: true,
        subpixel: true,
        fontColor: [0.2, 0.4, 0.8, 1],
        backgroundColor: state.backgroundColor,
    })
}
