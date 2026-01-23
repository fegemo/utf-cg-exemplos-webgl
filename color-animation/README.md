# Animando uma cor

Mostra um quadrado cuja cor vai alterando ao longo do tempo.

<video src="../docs/color-animation.mp4" width="400" style="float: right" muted loop autoplay></video>

Características:
  - 2D
  - VAO e VBO
  - animação
  - shaders
    - posições em _clip space_
    - uniform para cor
  - interatividade
    - troca de cor via HTML

## Objetivo

Ilustrar como fazer uma animação ao alterar o valor de uma variável de estado
da cena -- no caso, a cor de um quadrado -- ao longo do tempo usando uma cor
inicial e outra final, interpolando entre elas.

## Descrição

Uma animação é a alteração de algum valor que é feita ao longo do tempo. Logo,
precisamos de uma forma para fazer esse ajuste ao longo de vários quadros.

Para tanto, separamos a lógica da aplicação entre uma função de desenho 
(`render(gl)`) e outra de atualização do estado da aplicação (`update(dt)`).
Daí, entramos em um laço infinito que: atualiza o estado, depois redesenha:
é o chamado `gameLoop()` ou `mainLoop()`. Na Web, usamos uma função chamada
`requestAnimationFrame(callback)` (apelido: `rAF`) para que o navegador invoque
a função `callback` o mais rápido possível, assim:

```js
// armazena o "horário" que a mainLoop foi invocada da última vez
const lastTime = 0

function mainLoop(currentTime) {
    // 0. determina quanto tempo se passou e armazena no "deltaTime" ou "dt"
    const dt = (currentTime - lastTime) / 1000
    lastTime = currentTime

    // 1. atualiza o estado da aplicação
    update(dt)

    // 2. redesenha a aplicação no novo estado
    render(gl)

    // registra mainLoop para ser executada o mais rápido possível (novamente)
    requestAnimationFrame(mainLoop)
}

// registra a 1ª vez
requestAnimationFrame(mainLoop)
```

Nesse esquema, a função `update(dt)` tem a responsabilidade de atualizar o
estado da aplicação. No caso deste simples exemplo, determinar qual a nova cor
do objeto sendo desenhado:

```js
const state = {
    elapsedTime: 0,
    currentColor: [0, 1, 0]

    colorBegin: [0, 1, 0],   // verde 
    colorEnd:   [0, 0, 1]    // azul
}

function update(dt) {
    // atualiza a cor atual com base no tempo
    state.elapsedTime += dt
    const t = (Math.sin(state.elapsedTime) + 1) / 2    // varia entre 0 e 1
    const currentColor = [
        state.colorBegin[0] * (1 - t) + state.colorEnd[0] * t,
        state.colorBegin[1] * (1 - t) + state.colorEnd[1] * t,
        state.colorBegin[2] * (1 - t) + state.colorEnd[2] * t,
    ];
    state.currentColor = new Float32Array(currentColor);
}
```


A função `update(dt)` gerencia uma variável `t` que vai de zero a um usando uma
função de seno (para uma atualização suave) e, baseado nesse valor, determina
qual a `currentColor` que é uma interpolação entre `colorBegin` e `colorEnd`.

A função de desenho define a cor que é passada para o _shader_ usando uma 
variável `uniform`:

```js
function render(gl) {
    // renderiza: desenha o VAO que estava ativado: o do triângulo
    gl.clear(gl.COLOR_BUFFER_BIT);
    // ℹ️ uniform currentColor = state.currentColor 
    gl.uniform3fv(state.colorUniformLocation, state.currentColor);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}
```

É importante que a função de desenho NUNCA altere o estado da aplicação: ela
deve apenas desenhar a aplicação NO ESTADO ATUAL. Fica a cargo da função 
`update(dt)` alterar o estado do programa (o valor da cor).


## Exercícios

Sugestões de alterações para aprofundar o conhecimento a partir deste exemplo:

1) Alterar a cor de fundo para outra (a `gl.clearColor` é quem define).
2) Altere o código para deixar a animação mais lenta.
3) [Desafio] Insira uma nova `uniform vec2 offset` no código representando um
deslocamento nos eixos x e y e antes de retornar a posição do vértice, some
as suas coordenadas com esse vetor de deslocamento. Em `main.js`, não se esqueça
de encontrar a posição dessa uniform na função de inicialização e de definir seu
valor (na inicialização, como não será alterada, ou em desenho). O esperado é
o objeto ser desenhado no centro porém levemente deslocado para direita e 
para baixo se você passar um `offset` de `[0.2, 0.2]`, por exemplo.  
