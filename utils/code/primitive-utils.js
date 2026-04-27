// cria os vértices de um quadrado centrado em (x,y) e com o tamanho 'size'
// x, y: coordenadas do centro do quadrado
// z: coordenada z dos vértices
// size: comprimento do lado do quadrado
export function square(x=0, y=0, z=0, size=1) {
  const halfSize = size / 2
  return new Float32Array([
    x - halfSize, y - halfSize, z, // ↙️   v3----v2
    x + halfSize, y - halfSize, z, // ↘️   |   / |
    x + halfSize, y + halfSize, z, // ↗️   | /   |
    x - halfSize, y + halfSize, z  // ↖️   v0----v1
  ])
}


// descreve um cubo unitário na origem
// usando gl.TRIANGLES e índices
// cria coordenadas, cores, normais e indices
export function cubeInfo(x=0, y=0, z=0, size=1) {
  const halfSize = size / 2
  const h = halfSize
  // palette de tons pastéis
  const colorPalette = [
    [1.00, 0.80, 0.86], // pastel pink
    [0.74, 0.93, 0.77], // pastel green
    [0.70, 0.82, 0.96], // pastel blue
    [1.00, 0.95, 0.74], // pastel yellow
    [0.98, 0.78, 0.90], // pastel lavender
    [0.72, 0.93, 0.93]  // pastel cyan
  ]

  const coords = [
    // face de cima, y=+h
    -h,  h,  h,
     h,  h,  h,
     h,  h, -h,
    -h,  h, -h,
    // face de baixo, y=-h
    -h, -h,  h,
    -h, -h, -h,
     h, -h, -h,
     h, -h,  h,
    // face da frente, z=+h
    -h, -h,  h,
     h, -h,  h,
     h,  h,  h,
    -h,  h,  h,
    // face de trás, z=-h
     h, -h, -h,
    -h, -h, -h,
    -h,  h, -h,
     h,  h, -h,
    // face esquerda, x=-h
    -h, -h, -h,
    -h, -h,  h,
    -h,  h,  h,
    -h,  h, -h,
    // face direita, x=+h
     h, -h,  h,
     h, -h, -h,
     h,  h, -h,
     h,  h,  h
  ]

  const normals = [
    // face de cima, y=+h
     0,  1,  0,
     0,  1,  0,
     0,  1,  0,
     0,  1,  0,
    // face de baixo, y=-h
     0, -1,  0,
     0, -1,  0,
     0, -1,  0,
     0, -1,  0,
    // face da frente, z=+h
     0,  0,  1,
     0,  0,  1,
     0,  0,  1,
     0,  0,  1,
    // face de trás, z=-h
     0,  0, -1,
     0,  0, -1,
     0,  0, -1,
     0,  0, -1,
    // face esquerda, x=-h
    -1,  0,  0,
    -1,  0,  0,
    -1,  0,  0,
    -1,  0,  0,
    // face direita, x=+h
     1,  0,  0,
     1,  0,  0,
     1,  0,  0,
     1,  0,  0
  ]

  const colors = [
    // face de cima, y=+h
    ...colorPalette[0], // rosa pastel
    ...colorPalette[0],
    ...colorPalette[0],
    ...colorPalette[0],
    // face de baixo, y=-h
    ...colorPalette[1], // verde pastel
    ...colorPalette[1],
    ...colorPalette[1],
    ...colorPalette[1],
    // face da frente, z=+h
    ...colorPalette[2], // azul pastel
    ...colorPalette[2],
    ...colorPalette[2],
    ...colorPalette[2],
    // face de trás, z=-h
    ...colorPalette[3], // amarelo pastel
    ...colorPalette[3],
    ...colorPalette[3],
    ...colorPalette[3],
    // face esquerda, x=-h
    ...colorPalette[4], // lavanda pastel
    ...colorPalette[4],
    ...colorPalette[4],
    ...colorPalette[4],
    // face direita, x=+h
    ...colorPalette[5], // ciano pastel
    ...colorPalette[5],
    ...colorPalette[5],
    ...colorPalette[5]
  ]
  const indices = [
    // face de cima, y=+h
    0, 1, 2, 2, 3, 0,
    // face de baixo, y=-h
    4, 5, 6, 6, 7, 4,
    // face da frente, z=+h
    8, 9, 10, 10, 11, 8,
    // face de trás, z=-h
    12, 13, 14, 14, 15, 12,
    // face esquerda, x=-h
    16, 17, 18, 18, 19, 16,
    // face direita, x=+h
    20, 21, 22, 22, 23, 20
  ]

  const coordsArr = new Float32Array(coords)
  const colorsArr = new Float32Array(colors)
  const normalsArr = new Float32Array(normals)
  const indicesArr = new Uint16Array(indices)

  return {
    coords: coordsArr,
    colors: colorsArr,
    normals: normalsArr,
    indices: indicesArr,
    draw(gl, primitiveType=gl.TRIANGLES) {
      gl.drawElements(primitiveType, indicesArr.length, gl.UNSIGNED_SHORT, 0)
    }
  }
}

export function cylinderInfo(x=0, y=0, z=0, radius=0.5, height=1, segments=32) {
  const coords = []
  const colors = []
  const normals = []
  const indices = []

  // gera os vértices do cilindro
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2
    const xPos = x + Math.cos(angle) * radius
    const zPos = z + Math.sin(angle) * radius

    // vértice da base inferior
    coords.push(xPos, y - height/2, zPos)
    colors.push(0.9, 0.2, 0.6) // cor marrom para a base
    normals.push(0, -1, 0)

    // vértice da base superior
    coords.push(xPos, y + height/2, zPos)
    colors.push(0.9, 0.2, 0.6) // mesma cor para a parte superior
    normals.push(0, 1, 0)
  }

  // gerar os índices para as faces laterais
  for (let i = 0; i < segments; i++) {
    const baseIndex = i * 2
    indices.push(baseIndex, baseIndex + 1, baseIndex + 2) // triângulo da face lateral
    indices.push(baseIndex + 1, baseIndex + 3, baseIndex + 2) // triângulo da face lateral
  }

  // gera os índices para as bases
  const baseCenterIndex = coords.length / 3 // índice do centro da base
  coords.push(x, y - height/2, z) // centro da base inferior
  colors.push(0.9, 0.2, 0.6)
  normals.push(0, -1, 0)

  coords.push(x, y + height/2, z) // centro da base superior
  colors.push(0.9, 0.2, 0.6)
  normals.push(0, 1, 0)

  for (let i = 0; i < segments; i++) {
    const baseIndex = i * 2
    indices.push(baseCenterIndex, baseIndex, (baseIndex + 2) % (segments * 2)) // triângulo da base inferior
    indices.push(baseIndex + 1, baseCenterIndex + 1, (baseIndex + 3) % (segments * 2)) // triângulo da base superior
  }

  const coordsArr = new Float32Array(coords)
  const colorsArr = new Float32Array(colors)
  const normalsArr = new Float32Array(normals)
  const indicesArr = new Uint16Array(indices)

  return {
    coords: coordsArr,
    colors: colorsArr,
    normals: normalsArr,
    indices: indicesArr,
    draw(gl, primitiveType=gl.TRIANGLES) {
      gl.drawElements(primitiveType, indicesArr.length, gl.UNSIGNED_SHORT, 0)
    }
  }
}

export function sphereInfo(x=0, y=0, z=0, radius=0.5, latitudeBands=16, longitudeBands=16) {
  const coords = []
  const colors = []
  const normals = []
  const indices = []

  for (let latNumber = 0; latNumber <= latitudeBands; latNumber++) {
    const theta = latNumber * Math.PI / latitudeBands
    const sinTheta = Math.sin(theta)
    const cosTheta = Math.cos(theta)

    for (let longNumber = 0; longNumber <= longitudeBands; longNumber++) {
      const phi = longNumber * Math.PI * 2 / longitudeBands
      const sinPhi = Math.sin(phi)
      const cosPhi = Math.cos(phi)

      const nx = x + radius * sinTheta * cosPhi
      const ny = y + radius * cosTheta
      const nz = z + radius * sinTheta * sinPhi

      coords.push(nx, ny, nz)
      colors.push(0.5, 0.8, 0.7)
      normals.push(sinTheta * cosPhi, cosTheta, sinTheta * sinPhi)
    }
  }

  for (let latNumber = 0; latNumber < latitudeBands; latNumber++) {
    for (let longNumber = 0; longNumber < longitudeBands; longNumber++) {
      const first = latNumber * (longitudeBands + 1) + longNumber
      const second = first + longitudeBands + 1

      indices.push(first, first + 1, second)
      indices.push(first + 1, second + 1, second)
    }
  }

  const coordsArr = new Float32Array(coords)
  const colorsArr = new Float32Array(colors)
  const normalsArr = new Float32Array(normals)
  const indicesArr = new Uint16Array(indices)

  return {
    coords: coordsArr,
    colors: colorsArr,
    normals: normalsArr,
    indices: indicesArr,
    draw(gl, primitiveType=gl.TRIANGLES) {
      gl.drawElements(primitiveType, indicesArr.length, gl.UNSIGNED_SHORT, 0)
    }
  }
}
