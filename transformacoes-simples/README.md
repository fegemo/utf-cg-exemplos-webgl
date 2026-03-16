# Transformações simples (2D)

Mostra três quadrados que ilustram transformações 2D básicas: escala, rotação e translação.

<video src="../docs/simple-transformations.mp4" width="400" style="float: right" muted autoplay loop></video>

Características principais:
    - 2D
    - Uso de `VAO` e `VBO`
    - Transformações: escala, rotação e translação
    - Biblioteca usada: [glMatrix](https://github.com/toji/gl-matrix)
    - Interatividade via teclado

## Objetivo

Ilustrar o uso de transformações para alterar as coordenadas dos vértices dos
objetos, que são descritos em um sistema de coordenadas local a cada um. Também
ilustra a variação da intensidade da transformação ao longo do tempo e a
interação do usuário via teclado.

## Descrição

Este exemplo desenha três quadrados unitários (usando `VAO`/`VBO`) e aplica 
matrizes de transformação (`mat3`) diferentes para cada instância. Há um loop de atualização/desenho: `update(dt)` altera os estados (por exemplo, 
o parâmetro `t` que vai de zero a um) e `render(gl)` envia a matriz de 
transformação de cada objeto ao _vertex shader_ via `uniform mat3 transform` 
antes de desenhar.

Como funciona:
- O arquivo `main.js` mantém um `state` com um `t` que varia entre 0 e 1.
- Para cada quadro, `update(dt)` atualiza `t` (automaticamente ou via teclado) e recomputa uma `mat3` para cada objeto.
- `render(gl)` envia a matriz ao _shader_ (`gl.uniformMatrix3fv(transformLocation, false, matrix)`) e desenha os três quadrados com 
`gl.drawArrays(gl.TRIANGLE_FAN, 0, 4)` para cada um.


## Exercícios

1) O primeiro e o terceiro quadrados fazem duas transformações: (1) move um 
pouco para esquerda ou direita e, em seguida, (2) aplica uma escala ou 
nova translação (no eixo y). Altere a ordem dessas transformações. 
O que acontece?
2) Faça a rotação do segundo quadrado em torno do seu canto superior direito. 
Dica: faça composição de `translate(v)`/`rotate`/`translate(-v)` para alterar 
o ponto de origem da rotação.
3) Aplique uma cisalha (_shear_) a um quarto quadrado extra usando uma 
matriz `mat3` manualmente construída.


