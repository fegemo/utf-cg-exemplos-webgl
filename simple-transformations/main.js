import { createProgram, createShader } from '../utils/code/gl-utils.js';
import { mat3 } from 'https://cdn.jsdelivr.net/npm/gl-matrix@3.4.4/+esm';

const state = {
    t: 0,
    autoIncrementT: false,
    transformLocation: null,
    objects: [
        {
            // quadrado 1: vai variar sua ESCALA
            name: 'square1',
            transform: mat3.create()  // matriz identidade
        },
        {
            // quadrado 2: vai variar sua ROTAÇÃO
            name: 'square2',
            transform: mat3.create()  // matriz identidade
        },
        {
            // quadrado 3: vai variar sua TRANSLADAÇÃO
            name: 'square3',
            transform: mat3.create()  // matriz identidade
        }
    ],
    // armazena o estado de pressionamento das teclas (true = pressionada)
    // as teclas de interesse aqui são seta para cima, baixo, e barra de espaço
    keys: {
        ArrowUp: false,
        ArrowDown: false,
        Space: false
    }
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
    
    // define os vértices de um quadrado
    const vertices = new Float32Array([
      -0.1, -0.1,   // esquerda inferior
       0.1, -0.1,   // direita inferior
       0.1,  0.1,   // direita superior
      -0.1,  0.1    // esquerda superior
    ]);
    
    // cria um VAO para as configurações do triângulo e um Buffer com vértices
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

    // armazena a localização do uniforme de transformação no estado
    state.transformLocation = gl.getUniformLocation(program, 'transform'); 

    gl.clearColor(1.0, 1.0, 1.0, 1.0); // fundo branco

    // inicializa os manipuladores de eventos para teclado para:
    // - setas para cima/baixo: incrementam/decrementam t
    // - barra de espaço: ativa/desativa incremento automático de t
    ['keydown', 'keyup'].forEach((nameOfEvent) => {
        window.addEventListener(nameOfEvent, (e) => {
            if (e.code in state.keys) {
                const newState = (nameOfEvent === 'keydown');
                state.keys[e.code] = newState;
                // previne comportamento padrão da tecla para, por exemplo,
                // evitar que a página role para cima/baixo ao pressionar setas
                e.preventDefault(); 

            }
            
            if (e.code === 'Space' && nameOfEvent === 'keydown') {
                // alterna o estado de autoIncrementT ao pressionar espaço
                state.autoIncrementT = !state.autoIncrementT;
                // previne comportamento padrão da tecla (ex.: rolar a página)
                e.preventDefault();
            }
        });
    });
}

export function render(gl) {
    // renderiza: desenha o VAO que estava ativado: o do quadrado
    gl.clear(gl.COLOR_BUFFER_BIT);

    // desenha o primeiro quadrado à esquerda (ilustra escala)
    gl.uniformMatrix3fv(state.transformLocation, false, state.objects[0].transform);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    // desenha o segundo quadrado ao meio (ilustra rotação)
    gl.uniformMatrix3fv(state.transformLocation, false, state.objects[1].transform);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    // desenha o terceiro quadrado à direita (ilustra translação)
    gl.uniformMatrix3fv(state.transformLocation, false, state.objects[2].transform);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}

export function update(dt) {
    // atualiza o estado da aplicação a cada frame...
    if (state.autoIncrementT) {
        // se estivermos automaticamente aumentando t, soma tempo e acha novo t
        state.t += dt * 0.5;
    } else {
        // se não está no automático, verifica se teclas foram pressionadas
        if (state.keys.ArrowUp) {
            state.t += 0.01;
        }
        if (state.keys.ArrowDown) {
            state.t -= 0.01;
        }
    }

    // mantém t no intervalo [0, 1] (looping)
    if (state.t > 1) {
        state.t -= 1;
    } else if (state.t < 0) {
        state.t += 1;
    }

    state.objects.forEach((obj) => {
        if (obj.name === 'square1') {
            // square1: escala entre 1.0 e 2.0
            const scale = 1.0 + state.t;
            
            // move sistema de coordenadas para esquerda, depois aplica escala
            mat3.identity(obj.transform);
            mat3.translate(obj.transform, obj.transform, [-0.5, 0.0]);
            mat3.scale(obj.transform, obj.transform, [scale, scale]);

        } else if (obj.name === 'square2') {
            // square2: rotação entre 0 e 2π
            const angle = state.t * 2 * Math.PI;
            mat3.fromRotation(obj.transform, angle);

        } else if (obj.name === 'square3') {
            // square3: translação entre 0 e 0.5 no eixo Y
            const ty = state.t * 0.5;
            
            // move sistema de coordenadas para direita, depois na vertical
            mat3.identity(obj.transform);
            mat3.translate(obj.transform, obj.transform, [0.5, 0]);
            mat3.translate(obj.transform, obj.transform, [0, ty]);
        }
    });
}





// ℹ️ necessário apenas para o exemplo, e não para uma aplicação real: 
// expõe o estado para uso na interface (via data-binding)
export { state };
