# Mente Leve — Next.js para Vercel

## Como subir na Vercel (passo a passo)

### 1. Instalar dependências
Abra a pasta `mente-leve-next` no terminal e rode:
```bash
npm install
```

### 2. Testar localmente (opcional)
```bash
npm run dev
```
Acesse http://localhost:3000 para ver o app.

### 3. Subir para o GitHub
```bash
git init
git add .
git commit -m "primeiro commit mente leve"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/mente-leve.git
git push -u origin main
```
(Crie o repositório em github.com antes)

### 4. Conectar na Vercel
1. Acesse vercel.com → faça login com GitHub
2. Clique em "Add New Project"
3. Selecione o repositório `mente-leve`
4. Clique em "Deploy" — a Vercel detecta Next.js automaticamente
5. Pronto! Seu app estará em `mente-leve.vercel.app`

---

## Estrutura
```
pages/
  index.js      ← app completo
  _app.js       ← configuração global
  _document.js  ← fontes
styles/
  globals.css   ← todo o visual
package.json
next.config.js
```
