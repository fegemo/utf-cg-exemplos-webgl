# Hello World (simples)

Um exemplo mínimo de WebGL2 que desenha um triângulo verde usando VAO e VBO.

<img src="../docs/hello-world.png" width="400" style="float: right">

Características:
  - 2D
  - VAO e VBO
  - shaders (vertex e fragment)
  - atributo de posição em clip space
  - desenho com `gl.drawArrays` (sem índices)

## Objetivo

Mostrar a estrutura básica necessária para renderizar algo com WebGL2:
compilar shaders, enviar vértices para a GPU, configurar atributos e desenhar.
Tudo feito bagunçadão no próprio index.html -- há uma versão mais organizada
em [../hello-organizado/].

## Descrição

O código em `index.html` inicializa um contexto WebGL2, cria um programa
com um _vertex shader_ simples que recebe um atributo `position` e um 
_fragment shader_ que define a cor (verde, codificada diretamente no _shader_).

Fluxo principal:

- Cria e compila os shaders (vertex + fragment).
- Cria um `program` e o usa com `gl.useProgram`.
- Define os vértices do triângulo em um `Float32Array`.
- Cria um VAO e um VBO, envia os vértices ao buffer com `gl.bufferData`.
- Configura o atributo `position` com `gl.vertexAttribPointer` e o habilita.
- Limpa a tela (`gl.clearColor` + `gl.clear`) e desenha o triângulo com
  `gl.drawArrays(gl.TRIANGLES, 0, 3)`.

Observação: a cor está _"hard-coded"_ no _fragment shader_ como 
`vec4(0.0, 1.0, 0.0, 1.0)`.


## Exercícios

1) Altere a cor de fundo. Ela é definida via `gl.clearColor(...)`.
2) Organize o código, dividindo o que está no script em pelo menos as seguintes
funções: `function inicializa()` e `function desenha()`. Dica: a função de
desenho é curtíssima mesmo, apenas 2 ou 3 comandos.
3) O código fonte dos _shaders_ está dentro de strings, dntro do programa 
JavaScript. Seria mais organizado que eles ficassem separados, daí o editor
tem chance de colorir a sintaxe e isso facilita encontrar erros. Passe-os
para dentro de tags <script type="x-shader/x-vertex">...</script> e 
"x-fragment". No código JavaScript, use 
`document.querySelector(['[type$="x-vertex"]']).innerText.trim()` ou 
..."x-fragment" para trazê-los como strings para dentro do programa JavaScript.
   - Obs: esse `type="x-shader/x-vertex"` não é nada especial, mas apenas serve
   para que o navegador não tente executar o código dentro desse elemento 
   pensando que é código JavaScript.
