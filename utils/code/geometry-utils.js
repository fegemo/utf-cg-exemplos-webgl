import { cubeInfo, cylinderInfo, sphereInfo } from './primitive-utils.js'

export function cube(gl, programInfo, x=0, y=0, z=0, size=1) {
    const geometry = cubeInfo(x, y, z, size)
    const vao = gl.createVertexArray()
    gl.bindVertexArray(vao)

    // coords
    const coordsVBO = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, coordsVBO)
    gl.bufferData(gl.ARRAY_BUFFER, geometry.coords, gl.STATIC_DRAW)
    gl.enableVertexAttribArray(programInfo.locations.a_coords)
    gl.vertexAttribPointer(programInfo.locations.a_coords, 3, gl.FLOAT, false, 0, 0)

    // colors
    const colorsVBO = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, colorsVBO)
    gl.bufferData(gl.ARRAY_BUFFER, geometry.colors, gl.STATIC_DRAW)
    gl.enableVertexAttribArray(programInfo.locations.a_color)
    gl.vertexAttribPointer(programInfo.locations.a_color, 3, gl.FLOAT, false, 0, 0)

    // normals
    const normalsVBO = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, normalsVBO)
    gl.bufferData(gl.ARRAY_BUFFER, geometry.normals, gl.STATIC_DRAW)
    gl.enableVertexAttribArray(programInfo.locations.a_normal)
    gl.vertexAttribPointer(programInfo.locations.a_normal, 3, gl.FLOAT, false, 0, 0)

    // indices
    const ibo = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.indices, gl.STATIC_DRAW)

    return {
        vao,
        draw(gl, wireframe=false) {
            if (wireframe) {
                gl.uniform1f(programInfo.locations.u_alpha, 0.8)
                geometry.draw(gl, gl.LINE_LOOP)
                gl.uniform1f(programInfo.locations.u_alpha, 1.0)
            } else {
                geometry.draw(gl)
            }
        }
    }
}

export function cylinder(gl, programInfo, x=0, y=0, z=0, radius=1, height=1, segments=32) {
    const geometry = cylinderInfo(x, y, z, radius, height, segments)
    const vao = gl.createVertexArray()
    gl.bindVertexArray(vao)

    // coords
    const coordsVBO = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, coordsVBO)
    gl.bufferData(gl.ARRAY_BUFFER, geometry.coords, gl.STATIC_DRAW)
    gl.enableVertexAttribArray(programInfo.locations.a_coords)
    gl.vertexAttribPointer(programInfo.locations.a_coords, 3, gl.FLOAT, false, 0, 0)

    // colors
    const colorsVBO = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, colorsVBO)
    gl.bufferData(gl.ARRAY_BUFFER, geometry.colors, gl.STATIC_DRAW)
    gl.enableVertexAttribArray(programInfo.locations.a_color)
    gl.vertexAttribPointer(programInfo.locations.a_color, 3, gl.FLOAT, false, 0, 0)

    // normals
    const normalsVBO = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, normalsVBO)
    gl.bufferData(gl.ARRAY_BUFFER, geometry.normals, gl.STATIC_DRAW)
    gl.enableVertexAttribArray(programInfo.locations.a_normal)
    gl.vertexAttribPointer(programInfo.locations.a_normal, 3, gl.FLOAT, false, 0, 0)

    // indices
    const ibo = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.indices, gl.STATIC_DRAW)

    return {
        vao,
        draw(gl, wireframe=false) {
            if (wireframe) {
                gl.uniform1f(programInfo.locations.u_alpha, 0.8)
                geometry.draw(gl, gl.LINE_LOOP)
                gl.uniform1f(programInfo.locations.u_alpha, 1.0)
            } else {
                geometry.draw(gl)
            }
        }
    }
}

export function sphere(gl, programInfo, x=0, y=0, z=0, radius=1, segments=32) {
    const geometry = sphereInfo(x, y, z, radius, segments)
    const vao = gl.createVertexArray()
    gl.bindVertexArray(vao)

    // coords
    const coordsVBO = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, coordsVBO)
    gl.bufferData(gl.ARRAY_BUFFER, geometry.coords, gl.STATIC_DRAW)
    gl.enableVertexAttribArray(programInfo.locations.a_coords)
    gl.vertexAttribPointer(programInfo.locations.a_coords, 3, gl.FLOAT, false, 0, 0)

    // colors
    const colorsVBO = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, colorsVBO)
    gl.bufferData(gl.ARRAY_BUFFER, geometry.colors, gl.STATIC_DRAW)
    gl.enableVertexAttribArray(programInfo.locations.a_color)
    gl.vertexAttribPointer(programInfo.locations.a_color, 3, gl.FLOAT, false, 0, 0)

    // normals
    const normalsVBO = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, normalsVBO)
    gl.bufferData(gl.ARRAY_BUFFER, geometry.normals, gl.STATIC_DRAW)
    gl.enableVertexAttribArray(programInfo.locations.a_normal)
    gl.vertexAttribPointer(programInfo.locations.a_normal, 3, gl.FLOAT, false, 0, 0)

    // indices
    const ibo = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.indices, gl.STATIC_DRAW)

    return {
        vao,
        draw(gl, wireframe=false) {
            if (wireframe) {
                gl.uniform1f(programInfo.locations.u_alpha, 0.8)
                geometry.draw(gl, gl.LINE_STRIP)
                gl.uniform1f(programInfo.locations.u_alpha, 1.0)
            } else {
                geometry.draw(gl)
            }
        }
    }
}