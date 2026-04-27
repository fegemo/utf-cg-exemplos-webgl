import { createProgramFromFiles } from '../utils/code/gl-utils.js'
import { cube, sphere, cylinder } from '../utils/code/geometry-utils.js'
import * as M from '../utils/code/math-utils.js';

const state = {
    program: {
        id: null,
        locations: {
            u_model: null,
            u_projection: null,
            u_alpha: null,
            a_coords: null,
            a_color: null,
            a_normal: null
        }
    },
    geometry: {
        cube: {
            draw: null
        },
        sphere: {
            draw: null
        },
        cylinder: {
            draw: null
        }
    },
    t: 0,
    autoIncrementT: false,
    wireframe: true,
    projectionType: 'perspective', // ou 'orthographic'
    objects: [
        {
            center: [-10, 0, -30],
            model: M.translate(-10, 0, -30)
        },
        {
            center: [0, 0, -30],
            model: M.translate(0, 0, -30)
        },
        {
            center: [10, 0, -30],
            model: M.translate(10, 0, -30)
        }
    ],
    keys: {
        ArrowUp: false,
        ArrowDown: false,
        Space: false
    }
}

// module-level helper: set projection uniform according to `state.projectionType`
function applyProjection(gl) {
    const aspect = gl.canvas.width / gl.canvas.height
    let projectionMatrix = null
    if (state.projectionType === 'perspective') {
        const fovY = Math.PI / 3
        projectionMatrix = M.perspective(fovY, aspect, 1, 600)
    } else {
        const orthoSize = 20
        projectionMatrix = M.ortho(-orthoSize * aspect, orthoSize * aspect, -orthoSize, orthoSize, 1, 2000);
    }
    gl.uniformMatrix4fv(state.program.locations.u_projection, false, projectionMatrix)
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

export async function initialize(gl, shaderName) {   
    // cria o programa shader a partir de arquivos
    const vsPath = `${shaderName}.vertex.glsl`
    const fsPath = `${shaderName}.fragment.glsl`
    state.program.id = await createProgramFromFiles(gl, vsPath, fsPath)
    state.program.locations.u_model = gl.getUniformLocation(state.program.id, 'u_model')
    state.program.locations.u_projection = gl.getUniformLocation(state.program.id, 'u_projection')
    state.program.locations.u_alpha = gl.getUniformLocation(state.program.id, 'u_alpha')
    state.program.locations.a_coords = gl.getAttribLocation(state.program.id, 'a_coords')
    state.program.locations.a_color = gl.getAttribLocation(state.program.id, 'a_color')
    state.program.locations.a_normal = gl.getAttribLocation(state.program.id, 'a_normal')

    // cria a geometria de um cubo unitário na origem
    state.geometry.cube = cube(gl, state.program, 0, 0, 0, 1)

    // cria geometria de uma esfera
    state.geometry.sphere = sphere(gl, state.program, 0, 0, 0, 0.75, 16, 16)

    // cria a geometria de um cilindro
    state.geometry.cylinder = cylinder(gl, state.program, 0, 0, 0, 0.6, 1, 16)

    // inicializa o estado da aplicação
    gl.useProgram(state.program.id)
    gl.clearColor(1.0, 1.0, 1.0, 1.0) // fundo branco
    // configura projeção inicial
    applyProjection(gl)
    gl.uniform1f(state.program.locations.u_alpha, 1.0)
    gl.enable(gl.CULL_FACE)
    gl.enable(gl.DEPTH_TEST);

    // inicializa os manipuladores de eventos para teclado para:
    // - setas para cima/baixo: incrementam/decrementam t
    // - barra de espaço: ativa/desativa incremento automático de t
    ['keydown', 'keyup'].forEach((nameOfEvent) => {
        window.addEventListener(nameOfEvent, (e) => {
            if (e.code in state.keys) {
                const newState = (nameOfEvent === 'keydown')
                state.keys[e.code] = newState
                // previne comportamento padrão da tecla para, por exemplo,
                // evitar que a página role para cima/baixo ao pressionar setas
                e.preventDefault();
            }
            
            if (e.code === 'Space' && nameOfEvent === 'keydown') {
                // alterna o estado de autoIncrementT ao pressionar espaço
                state.autoIncrementT = !state.autoIncrementT
                // previne comportamento padrão da tecla (ex.: rolar a página)
                e.preventDefault()
            }

            if (e.code === 'KeyP' && nameOfEvent === 'keydown') {
                // alterna entre projeção ortográfica e perspectiva ao pressionar 'P'
                state.projectionType = (state.projectionType === 'perspective') ? 'orthographic' : 'perspective'
                applyProjection(gl)
            }

            if (e.code === 'KeyW' && nameOfEvent === 'keydown') {
                // alterna entre projeção ortográfica e perspectiva ao pressionar 'P'
                state.wireframe = !state.wireframe
            }
        });
    });

    // listen to the projection <select> control so UI changes update GL
    const projSelect = document.getElementById('input-projection')
    if (projSelect) {
        projSelect.addEventListener('change', (ev) => {
            state.projectionType = ev.target.value
            applyProjection(gl)
        });
    }
}

export function render(gl) {
    // renderiza: desenha o VAO que estava ativado
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    // desenha um chão: cubo grande e achatado, sem rotação, na posição y=-5
    gl.bindVertexArray(state.geometry.cube.vao)
    let model = M.identity()
    model = M.mult(model, M.translate(0, -5, 0))
    model = M.mult(model, M.scale(50, 0.1, 1000))
    gl.uniformMatrix4fv(state.program.locations.u_model, false, model);
    state.geometry.cube.draw(gl)
    if (state.wireframe) {
        state.geometry.cube.draw(gl, true)
    }

    // desenha o primeiro objeto à esquerda (ilustra escala)
    gl.bindVertexArray(state.geometry.cube.vao)
    gl.uniformMatrix4fv(state.program.locations.u_model, false, state.objects[0].model);
    state.geometry.cube.draw(gl)
    if (state.wireframe) {
        state.geometry.cube.draw(gl, true)
    }

    // desenha o segundo objeto ao meio (ilustra rotação)
    gl.bindVertexArray(state.geometry.sphere.vao)
    gl.uniformMatrix4fv(state.program.locations.u_model, false, state.objects[1].model);
    state.geometry.sphere.draw(gl)
    if (state.wireframe) {
        state.geometry.sphere.draw(gl, true)
    }

    // desenha o terceiro objeto à direita (ilustra translação)
    gl.bindVertexArray(state.geometry.cylinder.vao)
    gl.uniformMatrix4fv(state.program.locations.u_model, false, state.objects[2].model);
    state.geometry.cylinder.draw(gl)
    if (state.wireframe) {
        state.geometry.cylinder.draw(gl, true)
    }
}

export function update(dt) {
    // atualiza o estado da aplicação a cada frame...
    if (state.autoIncrementT) {
        // se estivermos automaticamente aumentando t, soma tempo e acha novo t
        state.t += dt * 0.2;
    } else {
        // se não está no automático, verifica se teclas foram pressionadas
        if (state.keys.ArrowUp) {
            state.t += 0.001;
        }
        if (state.keys.ArrowDown) {
            state.t -= 0.001;
        }
    }

    // mantém t no intervalo [0, 1] (looping)
    if (state.t > 1) {
        state.t -= 1;
    } else if (state.t < 0) {
        state.t += 1;
    }

    // objeto 1: rotação entre 0 e 2π
    let angle = state.t * 2 * Math.PI;
    let model = M.identity()
    model = M.mult(model, M.translate(...state.objects[0].center))
    model = M.mult(model, M.rotateY(angle))
    model = M.mult(model, M.rotateX(angle))
    model = M.mult(model, M.scale(5, 5, 5))
    state.objects[0].model = model

    // objeto 2: rotação entre 0 e 2π mas com offset de ângulo de 120 graus (1/3 de ciclo)
    angle += (2 * Math.PI / 3)
    model = M.identity()
    model = M.mult(model, M.translate(...state.objects[1].center))
    model = M.mult(model, M.rotateY(angle))
    model = M.mult(model, M.rotateX(angle))
    model = M.mult(model, M.scale(5, 5, 5))
    state.objects[1].model = model

    // objeto 3: rotação entre 0 e 2π mas com offset de ângulo de 240 graus (2/3 de ciclo)
    angle += Math.PI / 3
    model = M.identity()
    model = M.mult(model, M.translate(...state.objects[2].center))
    model = M.mult(model, M.rotateY(angle))
    model = M.mult(model, M.rotateX(angle))
    model = M.mult(model, M.scale(5, 5, 5))
    state.objects[2].model = model
}





// ℹ️ necessário apenas para o exemplo, e não para uma aplicação real: 
// expõe o estado para uso na interface (via data-binding)
export { state }
