# Rotação simples

Exemplo mínimo que mostra um único quadrado rotacionando no centro do canvas.

Características:
- Apenas uma malha (quadrado) desenhada com `VAO`/`VBO`.
- Transformação usando `mat3` (rotação).
- Atualização contínua do ângulo em `update(dt)`.

Como usar:
1. Abra `rotacao-simples/index.html` em um navegador compatível com WebGL2.
2. O quadrado começará a girar automaticamente.

Arquivos:
- `index.html` — página principal com shaders e loop de animação.
- `main.js` — inicialização do WebGL, atualização e render.

Dependências:
- `../utils/code/gl-utils.js` (helpers WebGL presentes no repositório).
- `gl-matrix` via CDN (import em `main.js`).

Sinta-se à vontade para ajustar a velocidade de rotação em `main.js`.
