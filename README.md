<div align="center">

# ✨ Lume

**Inclusão digital com autonomia, segurança e acolhimento para pessoas idosas.**

Projeto de Trabalho de Conclusão de Curso (TCC) desenvolvido pelo **Grupo Prysmo**.

</div>

---

## 💡 Sobre o Projeto

O **Lume** é um aplicativo educacional voltado ao ensino prático do uso de smartphones para o público idoso. Com uma interface de alto contraste, letras ampliáveis, tutoria guiada pela mascote **Mimi** e simulações interativas em um "celular de mentirinha", o usuário aprende no próprio ritmo e sem medo de errar.

---

## 🚀 Funcionalidades Principais

### 👩‍🏫 Experiência do Aluno
- **Primeiro Acesso Guiado pela Mimi:** tutorial interativo com destaque de foco (*spotlight*) passo a passo no cadastro, login, preferências, tela inicial e trilha, além de um tour opcional pelas funções do app.
- **Trilha de Aprendizado:** unidades organizadas em galáxias, com histórico de progresso e navegação livre entre unidades para rever ou refazer lições concluídas.
- **Lições em Etapas Completas:**
  1. **Introdução** acolhedora com a Mimi.
  2. **Vídeo explicativo** com suporte a legendas e apoio visual.
  3. **Questionário** com feedback imediato e explicações.
  4. **Simulador de Celular** guiado (contatos, mensagens, ligações, câmera, Uber, identificação de golpes por e-mail/links), com ícones visuais de apoio na fala da Mimi.
- **Gamificação Amigável:** sistema de **3 vidas** por lição, cálculo de estrelas e **XP**, registro de **ofensiva diária** (*Sua luz*) e **conquistas**.
- **Feedback Sonoro:** efeitos sonoros dedicados para acertos, erros e conclusão de lições.

### ♿ Acessibilidade Integrada
- **Tamanho da Fonte:** escalonamento configurável (*Pequena*, *Média*, *Grande*) e opção de texto em **Negrito**.
- **Áudio Descrição (`expo-speech`):** leitura em voz alta em português (`pt-BR`) com controle de velocidade (`0,75x`, `0,9x` e `1,15x`).
- **Daltonismo e Alto Contraste:** paletas adaptadas (*Alto Contraste*, *Verde / Vermelho* e *Azul / Amarelo*).
- **Parar Animações:** reduz transições e animações visuais em conjunto com as preferências do sistema.
- **Legendas e Libras (VLibras):** faixa de legendas nos vídeos e integração com o widget oficial **VLibras** do Governo Federal.

### 🛠️ Painel Administrativo (`/admin`)
- **Proteção de Rota:** acesso restrito a contas com papel de administrador (`admin` / `administrador`).
- **Gerenciamento de Unidades e Lições:** criação, edição, ordenação, vinculação de lições e exclusão segura com pop-ups de confirmação.
- **Gerenciamento de Administradores:** listagem, promoção e remoção de permissões de administradores.
- **Conta do Administrador:** edição de perfil, foto, senha e recuperação de acesso.

---

## 🧰 Tecnologias Utilizadas

- **[Expo](https://expo.dev/)** (`~54.0`) & **[React Native](https://reactnative.dev/)** (`0.81`)
- **[Expo Router](https://docs.expo.dev/router/introduction/)** (`~6.0`) — navegação baseada em arquivos
- **[TypeScript](https://www.typescriptlang.org/)**
- **[Supabase](https://supabase.com/)** — autenticação (e-mail/senha, Google, Facebook), banco PostgreSQL, RLS e RPCs
- **[NativeWind](https://www.nativewind.dev/)** / Tailwind CSS
- **[Lucide React Native](https://lucide.dev/)** — iconografia
- **Expo Speech**, **Expo Video**, **Expo WebBrowser**, **AsyncStorage** & **Poppins** (`@expo-google-fonts/poppins`)

---

## 📁 Estrutura do Projeto

```text
Prysmo_Lume/
├── app/
│   ├── _layout.tsx              # Raiz do app, fontes, sessão e Widget VLibras
│   ├── trilha.tsx               # Trilha de aprendizado e seletor de unidades
│   ├── auth/                    # Login, cadastro, verificação, recuperação e preferências
│   ├── onboarding/              # Telas de boas-vindas e primeiro acesso
│   ├── licao/[id].tsx           # Fluxo completo da lição (intro, vídeo, quiz, prática, resultado)
│   ├── pages/                   # Área do aluno (início, desempenho, perfil, conta, acessibilidade, ajuda)
│   └── admin/                   # Área administrativa (início, conta, permissões, unidades, lições)
├── components/                  # Componentes reutilizáveis (GuiaMimi, SimuladorCelular, ModalAdmin, etc.)
├── constants/                   # Paletas de cores e temas
├── hooks/                       # Contexto de acessibilidade e proteção de rotas admin
├── lib/                         # Integração Supabase, CRUDs, áudio, fotos e lógica de notas/trilha
├── services/                    # Serviços de autenticação OAuth e redirecionamento
└── assets/                      # Imagens da Mimi, ícones, fundos e efeitos sonoros (.mpeg)
```

---

## ▶️ Como Executar

### 1. Instalar as dependências
```bash
npm install
```

### 2. Configurar as variáveis de ambiente
Configure as credenciais do seu projeto Supabase no arquivo `.env` na raiz do projeto (de acordo com `lib/supabase.ts`):
```env
EXPO_PUBLIC_SUPABASE_URL=sua_url_do_supabase
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
```

### 3. Iniciar o servidor de desenvolvimento
```bash
# Menu interativo do Expo
npm start

# Ou diretamente na plataforma desejada:
npm run web
npm run android
npm run ios
```

### 4. Verificação de tipos (opcional)
```bash
npx tsc --noEmit
```

---

<div align="center">

Desenvolvido com dedicação pelo **Grupo Prysmo** 💜✨

</div>
