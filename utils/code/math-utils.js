// função auxiliar para criar uma matriz de projeção ortográfica
// como um 1D array (column-major, como o WebGL espera)
export function ortho(left, right, bottom, top, near, far) {
  const tx = -(right + left)/(right - left)
  const ty = -(top + bottom)/(top - bottom)
  const tz = -(far + near  )/(far - near  )

  return new Float32Array([ // lembre-se, column-major
    2/(right-left), 0, 0, 0,
    0, 2/(top-bottom), 0, 0,
    0, 0, -2/(far-near),  0,
    tx, ty, tz,           1
  ])
}