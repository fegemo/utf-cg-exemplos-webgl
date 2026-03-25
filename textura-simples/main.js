import { createProgramFromFiles } from '../utils/code/gl-utils.js';

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

export async function initialize(gl, shaderName) {   
    // cria o programa shader a partir de arquivos
    const vsPath = `${shaderName}.vertex.glsl`;
    const fsPath = `${shaderName}.fragment.glsl`;
    const program = await createProgramFromFiles(gl, vsPath, fsPath);
    
    // define os vértices de um quadrado
    const vertices = new Float32Array([
      -0.5, -0.5,  // inferior esquerdo
       0.5, -0.5,  // inferior direito
       0.5,  0.5,  // superior direito
      -0.5,  0.5   // superior esquerdo
    ]);

    // ℹ️ coordenadas de textura de cada vértice
    // (0,0) é o canto inferior esquerdo da imagem,
    // (1,1) é o canto superior direito
    // a ordem deve ser a mesma dos vértices
    const texcoords = new Float32Array([
        0.0, 0.0, // inferior esquerdo
        1.0, 0.0, // inferior direito
        1.0, 1.0, // superior direito
        0.0, 1.0  // superior esquerdo
    ]);
    
    // cria um VAO para as configurações do triângulo e um Buffer com vértices
    // gl.bufferData(...): move os dados dos vértices: RAM -> VRAM (GPU)
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    // configura o atributo 'a_position' ("in vec2 a_position" do shader) para 
    // receber os dados do buffer quando o programa (shaders) for executado
    const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
    const vboPosition = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vboPosition);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionAttributeLocation);

    // ℹ️ configura o atributo 'texcoord' ("in vec2 texcoord" do shader)
    const texcoordAttributeLocation = gl.getAttribLocation(program, 'a_texcoord');
    const vboTexcoord = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vboTexcoord);
    gl.bufferData(gl.ARRAY_BUFFER, texcoords, gl.STATIC_DRAW);
    gl.vertexAttribPointer(texcoordAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texcoordAttributeLocation);

    const textureUniformLocation = gl.getUniformLocation(program, 'u_texture');

    // ℹ️ carrega a imagem da textura e a move para a VRAM (GPU), configurando
    // seus parâmetros de amostragem (min/mag filter) e gerando os mipmaps
    // 
    // usa uma promessa: resolvida assim que imagem é carregada e depois
    // configurada como textura, ou rejeitada se ocorrer um erro no carregamento
    // ...dessa forma, a função initialize() só é considerada concluída 
    // quando a textura é baixada e carregada na GPU com sucesso
    const textureLoadedPromise = new Promise((resolve, reject) => {
        const image = new Image()
        image.onload = () => resolve(image)
        image.onerror = (err) => reject(err)
        image.src = 'pusheen-noodles.png'
    }).then((image) => {
        // ℹ️ cria a textura, ativa o slot 0 e pega a localização 
        // da uniform 'u_texture' do shader, para definir que vai usar a do slot 0
        const texture = gl.createTexture()
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
        
        gl.generateMipmap(gl.TEXTURE_2D)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, 
            gl.LINEAR_MIPMAP_LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    })


    // ℹ️ inverte verticalmente para baixo-para-cima que é o que WebGL espera
    // por que precisa disso? Se não fizer, fica de cabeça para baixo 
    // entenda aqui:
    // https://jameshfisher.com/2020/10/22/why-is-my-webgl-texture-upside-down/
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    // ℹ️ habilita o blending para lidar com transparências da textura (canal alpha)
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // inicia o estado do WebGL: cor de fundo e programa ativo
    gl.clearColor(1.0, 1.0, 1.0, 1.0); // fundo branco
    gl.useProgram(program);
    gl.uniform1i(textureUniformLocation, 0); // ℹ️ textura no slot 0

    // ℹ️ retorna uma promessa que é resolvida quando 
    // a textura é carregada e configurada
    return Promise.all([
        textureLoadedPromise
    ]);
}

export function render(gl) {
    // renderiza: desenha o VAO que estava ativado: o do quadrado
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}

export function update(dt) {
    // neste exemplo não há estado para atualizar
}

