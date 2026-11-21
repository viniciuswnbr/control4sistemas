# Control 4 Sistemas — Landing Page Institucional

Landing page clean desenvolvida para a **Control 4 Sistemas** (`control4sistemas.com.br`), focada em sistemas web de gerenciamento, controle, CRUD e gestão empresarial.

## Arquivos do Projeto

- `index.html` — Página principal com SEO Local, Open Graph e Dados Estruturados (`schema.org/ProfessionalService`)
- `styles.css` — Estilos customizados (tema claro minimalista)
- `app.js` — CRUD interativo no navegador e envio de orçamento para o WhatsApp da Juliana (`+55 12 98860-0746`)
- `sitemap.xml` — Mapa do site para indexação no Google
- `robots.txt` — Diretivas para rastreadores e referência ao `sitemap.xml`
- `vercel.json` — Configuração de headers e URLs limpas na Vercel

---

## 1. Como Rodar Localmente

```bash
# Opção 1: Usando npx serve
npx serve .

# Opção 2: Usando Python
python -m http.server 8080
```

Acesse `http://localhost:8080` no navegador.

---

## 2. Publicar na Vercel com Domínio `control4sistemas.com.br`

1. **Suba o projeto para o GitHub:**
   ```bash
   git init
   git add .
   git commit -m "feat: landing page Control 4 Sistemas com SEO local"
   git branch -M main
   git remote add origin <URL_DO_SEU_REPOSITORIO>
   git push -u origin main
   ```
2. **Importe na Vercel:**
   - Acesse [vercel.com](https://vercel.com) → **Add New Project** → selecione o repositório.
   - Framework Preset: **Other** (sem comando de build) → clique em **Deploy**.
3. **Configure o domínio `control4sistemas.com.br`:**
   - No painel do projeto na Vercel, vá em **Settings → Domains** e adicione `control4sistemas.com.br` (e `www.control4sistemas.com.br`).
   - No painel onde o domínio foi registrado (ex.: Registro.br), configure o DNS conforme a Vercel indicar:
     - Registro **A** (`@`) → `76.76.21.21` (ou o IP exibido no painel da Vercel)
     - Registro **CNAME** (`www`) → `cname.vercel-dns.com`
   - Aguarde a propagação e a emissão automática do SSL (HTTPS).

---

## 3. Google Search Console (`sitemap.xml`)

1. Acesse [search.google.com/search-console](https://search.google.com/search-console).
2. Adicione a propriedade `https://control4sistemas.com.br` (ou tipo **Domínio** `control4sistemas.com.br` validando via registro TXT no DNS).
3. No menu lateral, clique em **Sitemaps**, digite `sitemap.xml` e clique em **Enviar**.
4. Use **Inspeção de URL** na página inicial (`https://control4sistemas.com.br/`) e clique em **Solicitar indexação**.

---

## 4. Cadastro no Google Perfil da Empresa (SEO Local — Vale do Paraíba / SP)

1. Acesse [business.google.com](https://business.google.com) com a conta Google da empresa.
2. **Nome da empresa:** `Control 4 Sistemas`
3. **Categoria principal:** `Empresa de software` (ou `Desenvolvimento de software`). Categorias secundárias: `Consultoria em TI`, `Web designer`.
4. **Tipo de atendimento:** Se atender de forma remota/visita ao cliente sem loja física aberta ao público, selecione **"Não tenho um endereço físico para receber clientes"** e cadastre a **Área de cobertura**:
   - Cidades do Vale do Paraíba (ex.: São José dos Campos, Taubaté, Jacareí, Caçapava, Pindamonhangaba, Guaratinguetá)
   - Estado de São Paulo
   - Brasil
5. **Contato:**
   - Telefone/WhatsApp: `+55 12 98860-0746`
   - Site: `https://control4sistemas.com.br`
6. **Descrição recomendada:**
   > A Control 4 Sistemas desenvolve sistemas web sob medida para gerenciamento, controle financeiro, estoque, pedidos, clientes e automação de processos empresariais. Substitua planilhas por painéis rápidos e fáceis de usar. Atendimento no Vale do Paraíba (SP) e em todo o Brasil.
7. **Verificação & Otimização:** conclua a verificação solicitada pelo Google (vídeo/telefone/código), adicione capturas de tela dos seus painéis/CRUDs na aba **Fotos** e peça avaliações de clientes satisfeitos com palavras-chave naturais (ex.: *"sistema de gestão"*, *"controle de estoque"*).
