# Control 4 Sistemas — Landing Page Institucional

Landing page clean desenvolvida para a **Control 4 Sistemas** (`control4sistemas.com.br`), focada em sistemas web de gerenciamento, controle e gestão empresarial.

## Stack Utilizada

- **HTML5 Semântico**
- **Tailwind CSS** (via CDN, tema claro e minimalista)
- **CSS Customizado** (`styles.css`)
- **JavaScript Vanilla** (`app.js`) — demonstração interativa de CRUD no navegador, validação de formulário e envio de orçamento para o WhatsApp da Juliana (`+55 12 98860-0746`)
- **Lucide Icons** (via CDN)
- **Tipografia:** `Inter` e `JetBrains Mono` (Google Fonts)

## Como Rodar Localmente

```bash
# Opção 1: Usando npx serve
npx serve .

# Opção 2: Usando Python
python -m http.server 8080
```

Acesse `http://localhost:8080` no navegador.

## Deploy no GitHub + Vercel

1. Suba os arquivos para o GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: landing page clean Control 4 Sistemas"
   git branch -M main
   git remote add origin <URL_DO_SEU_REPOSITORIO>
   git push -u origin main
   ```
2. Importe o repositório na [Vercel](https://vercel.com) e clique em **Deploy** (projeto estático, sem comando de build).
