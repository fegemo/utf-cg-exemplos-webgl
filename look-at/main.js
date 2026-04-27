import { createProgramFromFiles } from '../utils/code/gl-utils.js'
import { cube, cylinder, sphere } from '../utils/code/geometry-utils.js'
import { m4 } from '../3rd-party/twgl-full.module.js'

const state = {
    program: {
        id: null,
        locations: {
            u_model: null,
            u_view: null,
            u_projection: null,
            u_alpha: null,
            a_coords: null,
            a_color: null,
            a_normal: null
        }
    },
    geometry: {
        cube: {
            vao: null,
            draw: null
        },
        cylinder: {
            vao: null,
            draw: null
        },
        sphere: {
            vao: null,
            draw: null
        }
    },
    cameras: {
        current: 0,
        views: [
            {
                name: 'Câmera 1',
                eye: [0, 5, 0],
                center: [0, 0, -200],
                up: [0, 1, 0]
            },
            {
                name: 'Câmera 2',
                eye: [100, 5, 0],
                center: [0, 0, -200],
                up: [0, 1, 0]
            },
            {
                name: 'Câmera 3',
                eye: [100, 20, -200],
                center: [0, 0, -200],
                up: [0, 1, 0]
            }
        ],
    },
    t: 0,
    autoIncrementT: false,
    wireframe: true,
    objects: [
        {
            // chão: caixa achatada no eixo y
            type: 'cube',
            center: [0, -5, 0],
            size: [2000, 0.1, 2000],
            model: m4.multiply(m4.translation([0, -5, 0]), m4.scaling([2000, 0.1, 2000]))
        },
        {
            // tronco de árvore: cilindro estreito e alto
            type: 'cylinder',
            center: [30, 0, -200],
            size: [2, 60, 2],
            model: m4.multiply(m4.translation([30, 0, -200]), m4.scaling([2, 60, 2]))
        },
        {
            // copa de árvore: esfera
            type: 'sphere',
            center: [30, 30, -200],
            size: [10, 10, 10],
            model: m4.multiply(m4.translation([30, 30, -200]), m4.scaling([10, 10, 10]))
        },
        {
            // casa: caixa
            type: 'cube',
            center: [-40, 15, -150],
            size: [60, 40, 30],
            model: m4.multiply(m4.translation([-40, 15, -150]), m4.scaling([60, 40, 30]))
        },
        {
            // casa: telhado esquerdo (caixa rotacionada)
            type: 'cube',
            center: [-40, 40, -150],
            size: [60, 20, 30],
            model: m4.multiply(m4.multiply(m4.translation([-60, 40, -150]), m4.rotationZ(Math.PI/6)), m4.scaling([50, 1, 34]))
        },
        {
            // casa: telhado direito (caixa rotacionada)
            type: 'cube',
            center: [-20, 40, -150],
            size: [60, 20, 30],
            model: m4.multiply(m4.multiply(m4.translation([-20, 40, -150]), m4.rotationZ(-Math.PI/6)), m4.scaling([50, 1, 34]))
        }
    ],
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

function activateCamera(gl, camera) {
    const cameraMatrix = m4.lookAt(camera.eye, camera.center, camera.up)
    const viewMatrix = m4.inverse(cameraMatrix)
    gl.uniformMatrix4fv(state.program.locations.u_view, false, viewMatrix)
    console.log("Câmera atual:", camera.name)
}

export async function initialize(gl, shaderName) {   
    // cria o programa shader a partir de arquivos
    const vsPath = `${shaderName}.vertex.glsl`
    const fsPath = `${shaderName}.fragment.glsl`
    state.program.id = await createProgramFromFiles(gl, vsPath, fsPath)
    state.program.locations.u_model = gl.getUniformLocation(state.program.id, 'u_model')
    state.program.locations.u_view = gl.getUniformLocation(state.program.id, 'u_view')
    state.program.locations.u_projection = gl.getUniformLocation(state.program.id, 'u_projection')
    state.program.locations.u_alpha = gl.getUniformLocation(state.program.id, 'u_alpha')
    state.program.locations.a_coords = gl.getAttribLocation(state.program.id, 'a_coords')
    state.program.locations.a_color = gl.getAttribLocation(state.program.id, 'a_color')
    state.program.locations.a_normal = gl.getAttribLocation(state.program.id, 'a_normal')

    // cria a geometria de um cubo unitário na origem
    state.geometry.cube = cube(gl, state.program)
    state.geometry.cylinder = cylinder(gl, state.program)
    state.geometry.sphere = sphere(gl, state.program)

    // inicializa o estado da aplicação
    gl.useProgram(state.program.id)
    gl.clearColor(1.0, 1.0, 1.0, 1.0)
    gl.uniform1f(state.program.locations.u_alpha, 1.0)
    gl.enable(gl.CULL_FACE)
    gl.enable(gl.DEPTH_TEST)

    const perspectiveMatrix = m4.perspective(Math.PI / 3, gl.canvas.width / gl.canvas.height, 1, 2000)
    gl.uniformMatrix4fv(state.program.locations['u_projection'], false, perspectiveMatrix)

    // ativa a câmera inicial
    activateCamera(gl, state.cameras.views[state.cameras.current]);

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

            if (e.code === 'KeyC' && nameOfEvent === 'keydown') {
                // alterna entre as câmeras ao pressionar a tecla C
                state.cameras.current = (state.cameras.current + 1) % state.cameras.views.length
                activateCamera(gl, state.cameras.views[state.cameras.current])
            }

            if (e.code === 'KeyW' && nameOfEvent === 'keydown') {
                // alterna entre projeção ortográfica e perspectiva ao pressionar 'P'
                state.wireframe = !state.wireframe;
            }
        })
    })

    const cameraSelect = document.getElementById('input-camera')
    cameraSelect.addEventListener('change', (e) => {
        const selectedIndex = e.target.selectedIndex
        state.cameras.current = selectedIndex
        activateCamera(gl, state.cameras.views[selectedIndex])
    })
}

export function render(gl) {
    // renderiza: desenha o VAO que estava ativado
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    // percorre a cena desenhando todos os objetos
    for (let object of state.objects) {
        gl.bindVertexArray(state.geometry[object.type].vao)
        gl.uniformMatrix4fv(state.program.locations['u_model'], false, object.model)
        state.geometry[object.type].draw(gl)
        if (state.wireframe) {
            state.geometry[object.type].draw(gl, true)
        }
    }
}

export function update(dt) {
}





// ℹ️ necessário apenas para o exemplo, e não para uma aplicação real: 
// expõe o estado para uso na interface (via data-binding)
export { state }
