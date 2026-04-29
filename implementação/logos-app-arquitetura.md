# λόγος — Logós App

## Documento de Arquitetura e Planejamento Técnico

**React Native • Expo • TypeScript — v1.0**

---

## Índice

1. [Visão Geral do Produto](#1-visão-geral-do-produto)
2. [Stack Tecnológica](#2-stack-tecnológica)
3. [Arquitetura do Sistema](#3-arquitetura-do-sistema)
4. [Modelagem do Banco de Dados](#4-modelagem-do-banco-de-dados)
5. [Telas e Fluxo de Navegação](#5-telas-e-fluxo-de-navegação)
6. [Funcionalidades — Detalhamento](#6-funcionalidades--detalhamento)
7. [Infraestrutura e CI/CD](#7-infraestrutura-e-cicd)
8. [Roadmap de Desenvolvimento](#8-roadmap-de-desenvolvimento)
9. [Decisões Técnicas Importantes](#9-decisões-técnicas-importantes)

---

## 1. Visão Geral do Produto

O **Logós** é um aplicativo mobile multiplataforma (iOS + Android) para leitura e estudo bíblico profundo. O diferencial central é a integração nativa dos **Números Strong** — sistema de indexação do hebraico e grego originais — diretamente no texto, permitindo ao usuário tocar qualquer palavra e acessar seu étimo, significado e ocorrências no AT/NT.

### Pilares do Produto

- Leitura imersiva com acesso **inline** aos Números Strong (H e G)
- Múltiplas traduções em paralelo (ARA, NVI, ACF, KJV, interlinear)
- Pesquisa por palavra original, número Strong ou termo em português
- Anotações e destaques pessoais sincronizados na nuvem
- Planos de leitura e histórico
- **Modo offline-first**: todo o conteúdo disponível sem internet

### 💡 Proposta de Valor

> Diferente de apps como YouVersion (que foca em social/devocionais), o Logós se posiciona para o **estudioso e pastor** que quer profundidade teológica acessível no celular. A experiência de tocar uma palavra e ver instantaneamente o original grego ou hebraico é o momento "uau" que define o produto.

---

## 2. Stack Tecnológica

A stack foi escolhida para maximizar produtividade, aproveitando conhecimento em React, sem abrir mão de performance mobile nativa.

### 2.1 Frontend — React Native + Expo

| Tecnologia                 | Justificativa                                                                |
| -------------------------- | ---------------------------------------------------------------------------- |
| **React Native 0.74+**     | Componentes nativos reais (não WebView). Performance fluida.                 |
| **Expo SDK 51+**           | Ambiente gerenciado: OTA updates, builds na nuvem (EAS Build), APIs prontas. |
| **TypeScript 5.x**         | Tipagem estrita. Fundamental para modelar dados bíblicos complexos.          |
| **Expo Router v3**         | Roteamento file-based (similar ao Next.js). Ideal para deep links.           |
| **NativeWind v4**          | Tailwind CSS para React Native. Estilização rápida e consistente.            |
| **Zustand**                | State management leve. Melhor que Redux para este escopo.                    |
| **React Query (TanStack)** | Cache e sync de dados server-side. Gerencia estados de loading/erro.         |

### 2.2 Banco de Dados Local (Offline-First)

| Tecnologia                    | Justificativa                                                     |
| ----------------------------- | ----------------------------------------------------------------- |
| **expo-sqlite (SQLite)**      | Banco local nativo. TODA a Bíblia + Strong fica no dispositivo.   |
| **Drizzle ORM**               | ORM TypeScript para SQLite. Queries tipadas, sem raw SQL.         |
| **expo-file-system**          | Gerenciamento de arquivos para importar DBs pré-populados no app. |
| **WatermelonDB** _(opcional)_ | Se precisar de sync reativo mais avançado entre local e cloud.    |

### 2.3 Backend e Cloud

| Tecnologia                  | Justificativa                                                             |
| --------------------------- | ------------------------------------------------------------------------- |
| **Supabase (BaaS)**         | Auth + PostgreSQL + Storage + Realtime. Open source. Gratuito até escala. |
| **Supabase Auth**           | Login por email/senha, Google, Apple Sign-In.                             |
| **Supabase Storage**        | Backup de anotações e destaques do usuário.                               |
| **Edge Functions (Deno)**   | Lógica de negócio serverless se necessário (ex: planos premium).          |
| **EAS (Expo App Services)** | Build, Submit e Update (OTA) automatizados para App Store e Play Store.   |

### 2.4 Ferramentas de Desenvolvimento

| Ferramenta              | Uso                                                           |
| ----------------------- | ------------------------------------------------------------- |
| **pnpm**                | Package manager mais rápido e eficiente que npm/yarn.         |
| **ESLint + Prettier**   | Linting e formatação automática.                              |
| **Husky + lint-staged** | Pre-commit hooks: garante código limpo antes de commitar.     |
| **GitHub Actions**      | CI/CD: testes, builds e deploy automáticos.                   |
| **Maestro**             | Testes de UI end-to-end para mobile. Simples e eficaz.        |
| **Sentry**              | Monitoramento de erros em produção (plano gratuito generoso). |

---

## 3. Arquitetura do Sistema

### 3.1 Visão Macro (Camadas)

```
┌─────────────────────────────────────────────────────────┐
│                  PRESENTATION LAYER                     │
│   Expo Router · NativeWind · Componentes React Native   │
├─────────────────────────────────────────────────────────┤
│                  BUSINESS LOGIC LAYER                   │
│       Zustand Stores · React Query · Custom Hooks       │
├──────────────────────────┬──────────────────────────────┤
│   LOCAL DATA LAYER       │   REMOTE DATA LAYER          │
│   SQLite · Drizzle ORM   │   Supabase SDK · REST/WS     │
│   (Bíblia + Strong)      │   (Auth · Notas · Sync)      │
└──────────────────────────┴──────────────────────────────┘
```

### 3.2 Estrutura de Pastas do Projeto

Padrão **Feature-First** (por domínio, não por tipo de arquivo):

```
logos-app/
├── app/                        # Expo Router (rotas/telas)
│   ├── (tabs)/                 # Tab navigator principal
│   │   ├── index.tsx           # Home / Leitura
│   │   ├── search.tsx          # Busca
│   │   ├── library.tsx         # Biblioteca / Planos
│   │   └── profile.tsx         # Perfil / Config
│   ├── reader/[book]/[chapter] # Tela de leitura
│   ├── strong/[id].tsx         # Detalhe do número Strong
│   └── _layout.tsx             # Layout raiz
│
├── features/                   # Módulos por domínio
│   ├── bible/                  # Leitura bíblica
│   │   ├── components/         # VerseText, StrongBadge, etc.
│   │   ├── hooks/              # useBibleReader, useChapter
│   │   └── store/              # bibleStore (Zustand)
│   ├── strong/                 # Números Strong
│   │   ├── components/         # StrongDrawer, GreekText
│   │   └── hooks/              # useStrongEntry
│   ├── notes/                  # Anotações e destaques
│   ├── search/                 # Busca bíblica
│   └── auth/                   # Autenticação
│
├── db/                         # Banco de dados local
│   ├── schema.ts               # Schema Drizzle
│   ├── migrations/             # Migrações SQLite
│   └── seed/                   # Scripts de importação
│
├── lib/                        # Utilitários compartilhados
│   ├── supabase.ts             # Cliente Supabase
│   └── constants.ts            # Books, capítulos, etc.
│
└── assets/                     # Fontes, ícones, DB estático
    └── bible.db                # SQLite pré-populado (~50MB)
```

---

## 4. Modelagem do Banco de Dados

O SQLite local é o coração do app. Todo o conteúdo bíblico e Strong fica pré-instalado no dispositivo, garantindo funcionamento offline total.

### 4.1 Tabela: `verses` (Versículos)

```sql
CREATE TABLE verses (
  id          INTEGER PRIMARY KEY,  -- ex: 1001001 = Gn 1:1
  book_id     INTEGER NOT NULL,     -- 1-66
  chapter     INTEGER NOT NULL,     -- 1-N
  verse       INTEGER NOT NULL,     -- 1-N
  translation TEXT    NOT NULL,     -- 'ARA', 'NVI', 'KJV'...
  text        TEXT    NOT NULL,     -- Texto do versículo
  text_tokens TEXT,                 -- JSON: tokens com IDs Strong
  UNIQUE(book_id, chapter, verse, translation)
);
```

### 4.2 Tabela: `strong_entries` (Dicionário Strong)

```sql
CREATE TABLE strong_entries (
  id               TEXT PRIMARY KEY,   -- 'H7225', 'G3056'
  language         TEXT NOT NULL,      -- 'H' (hebraico) | 'G' (grego)
  original_word    TEXT NOT NULL,      -- Palavra em heb/grego
  transliteration  TEXT NOT NULL,      -- Ex: 'rêshîyth', 'lógos'
  pronunciation    TEXT,               -- Pronúncia fonética
  definition_pt    TEXT NOT NULL,      -- Definição em português
  definition_en    TEXT,               -- Definição em inglês
  kjv_usage        TEXT,               -- Como KJV traduz
  root_words       TEXT,               -- JSON: IDs de palavras raiz
  occurrence_count INTEGER             -- Nº de ocorrências no AT/NT
);
```

### 4.3 Tabela: `verse_tokens` (Tokens com Strong)

```sql
CREATE TABLE verse_tokens (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  verse_id   INTEGER NOT NULL,     -- FK -> verses.id
  position   INTEGER NOT NULL,     -- Posição da palavra no versículo
  word_pt    TEXT    NOT NULL,     -- Palavra em português
  strong_id  TEXT,                 -- FK -> strong_entries.id (pode ser NULL)
  morph_code TEXT,                 -- Código morfológico (ex: 'V-AAI-3S')
  FOREIGN KEY(verse_id) REFERENCES verses(id)
);
```

### 4.4 Tabelas de Usuário (Sincronizadas com Supabase)

```sql
CREATE TABLE highlights (
  id         TEXT    PRIMARY KEY,   -- UUID
  verse_id   INTEGER NOT NULL,
  color      TEXT    NOT NULL,      -- 'yellow', 'green', 'blue', 'pink'
  created_at TEXT    NOT NULL,
  synced     INTEGER DEFAULT 0      -- 0=pendente, 1=sincronizado
);

CREATE TABLE notes (
  id         TEXT    PRIMARY KEY,
  verse_id   INTEGER NOT NULL,
  content    TEXT    NOT NULL,
  updated_at TEXT    NOT NULL,
  synced     INTEGER DEFAULT 0
);
```

### 4.5 Fontes dos Dados Bíblicos

> **📚 Datasets Open Source disponíveis:**
>
> - [openscriptures/strongs](https://github.com/openscriptures/strongs) — Strong's concordance completa em JSON/XML (Public Domain)
> - [STEPBible.org](https://stepbible.org) — Textos hebraico/grego com mapeamento Strong (Creative Commons)
> - [eBible.org](https://ebible.org) — Traduções em português abertas (ACF, ARA)
> - Crosswire SWORD — Formato padrão para módulos bíblicos

> ⚠️ **Atenção de licença:** NVI e outras traduções modernas são Copyright. Para uso comercial, é necessário licenciamento pago. Para MVP, usar **ACF e ARA** que são domínio público.

---

## 5. Telas e Fluxo de Navegação

### 5.1 Hierarquia de Rotas (Expo Router)

```
Root Layout (_layout.tsx)
  ├── (auth)/              → Login / Cadastro / Onboarding
  └── (app)/               → App principal (pós-login)
       ├── (tabs)/         → Bottom Tab Navigator
       │    ├── index      → 🏠 Home (versículo do dia + acesso rápido)
       │    ├── reader     → 📖 Continuar leitura
       │    ├── search     → 🔍 Busca
       │    ├── library    → 📚 Biblioteca / Planos
       │    └── profile    → 👤 Perfil
       ├── reader/[book]/[chapter]  → Tela de leitura
       ├── strong/[id]              → Detalhe Strong (Bottom Sheet)
       ├── verse/[id]/note          → Editor de anotação
       └── settings/                → Configurações
```

### 5.2 Descrição das Telas Principais

#### 📖 Reader (Leitura)

Tela central do app. Exibe o texto do capítulo selecionado com palavras tocáveis.

- Seletor de livro/capítulo no topo (dropdown ou modal)
- Versículos numerados com rolagem contínua
- Palavras com Strong diferenciadas visualmente (sublinhado sutil ou ponto)
- **Long-press** no versículo: opções de highlight, nota, compartilhar, copiar
- FAB para trocar tradução rapidamente
- Leitura paralela: dois textos lado a lado (landscape ou modo dividido)

#### λ Strong Detail (Bottom Sheet)

Abre ao tocar uma palavra com Strong. Usa Bottom Sheet para não perder o contexto da leitura.

- ID Strong (ex: `G3056`) com badge de idioma (H/G)
- Palavra original em caracteres gregos/hebraicos com fonte especializada
- Transliteração fonética e definição completa em português
- Usos no KJV e outras traduções
- Lista de versículos onde a palavra aparece (concordância)
- Palavras relacionadas (mesma raiz)

#### 🔍 Search (Busca)

- Busca full-text no texto bíblico (SQLite FTS5)
- Busca por número Strong (ex: `G3056`)
- Busca por palavra original (ex: `λόγος`)
- Filtros: livro, testamento, tradução
- Histórico de buscas recentes

#### 📚 Library (Biblioteca)

- Planos de leitura (criados ou importados)
- Progresso de leitura visual por livro
- Marcadores e versículos favoritos
- Minhas anotações (lista com busca)

#### ⚙️ Settings (Configurações)

- Fonte e tamanho do texto
- Tema: Claro / Escuro / Sépia
- Tradução padrão
- Download de módulos adicionais (offline)
- Conta e sincronização (Supabase Auth)

---

## 6. Funcionalidades — Detalhamento

### 6.1 Sistema Strong — Como Funciona

O texto bíblico é armazenado em formato tokenizado: cada versículo tem seus tokens (palavras) mapeados individualmente para um Strong ID.

```typescript
// Exemplo de verse_tokens para João 1:1
{ pos: 0, word: 'No',        strong_id: null    }
{ pos: 1, word: 'princípio', strong_id: 'G746'  }  // archḗ
{ pos: 2, word: 'era',       strong_id: 'G2258' }  // ēn
{ pos: 3, word: 'o',         strong_id: null    }
{ pos: 4, word: 'Verbo',     strong_id: 'G3056' }  // lógos
{ pos: 5, word: 'e',         strong_id: null    }
{ pos: 6, word: 'o',         strong_id: null    }
{ pos: 7, word: 'Verbo',     strong_id: 'G3056' }
{ pos: 8, word: 'estava',    strong_id: 'G2258' }
{ pos: 9, word: 'com',       strong_id: 'G4314' }  // pros
{ pos: 10, word: 'Deus',     strong_id: 'G2316' }  // theos
```

### 6.2 Offline-First Strategy

| Dado                 | Estratégia                                           |
| -------------------- | ---------------------------------------------------- |
| Bíblia + Strong      | 100% local — SQLite pré-carregado no bundle do app   |
| Anotações/Destaques  | Escrita local-first, sync via Supabase quando online |
| Planos de leitura    | Local com opção de download de planos adicionais     |
| Histórico de leitura | Local com backup na nuvem (conta registrada)         |
| Configurações        | AsyncStorage local                                   |
| Updates de conteúdo  | OTA via Expo (correções) ou download incremental     |

### 6.3 Texto Interlinear

Modo avançado onde o texto original aparece palavra por palavra acima/abaixo da tradução.

- **Fonte hebraico:** Ezra SIL (SIL International, open source)
- **Fonte grego:** GFS Porson ou SBL Greek (open source)
- Exibição RTL automática para o hebraico
- Toggle rápido: interlinear / tradução / texto original puro

---

## 7. Infraestrutura e CI/CD

### 7.1 Supabase — Setup

| Serviço                   | Uso                                                           |
| ------------------------- | ------------------------------------------------------------- |
| **Auth**                  | Email/senha + Google OAuth + Apple Sign-In (obrigatório iOS)  |
| **Database (PostgreSQL)** | Tabelas: profiles, notes, highlights, reading_plans, progress |
| **Row Level Security**    | Cada usuário acessa APENAS seus próprios dados                |
| **Storage**               | Backup de bancos de notas ou exportações do usuário           |
| **Realtime**              | Sync ao vivo de destaques entre dispositivos (opcional v2)    |

> 💰 **Custo:** plano Free cobre até 50.000 MAU, 500MB DB, 1GB Storage. Suficiente para MVP e fase inicial de crescimento.

### 7.2 EAS (Expo Application Services)

| Serviço              | Uso                                                                  |
| -------------------- | -------------------------------------------------------------------- |
| **EAS Build**        | Compila `.ipa` (iOS) e `.apk/.aab` (Android) na nuvem, sem Mac local |
| **EAS Submit**       | Envia builds para App Store Connect e Google Play Console            |
| **EAS Update (OTA)** | Deploy de JS bundle sem passar pela loja. Updates em minutos.        |
| **EAS Metadata**     | Gerencia screenshots, descrições e configs das lojas                 |

> 💰 **Custo:** plano Free inclui 30 builds/mês. Suficiente para desenvolvimento solo.

### 7.3 GitHub Actions — Pipeline CI/CD

```yaml
# .github/workflows/ci.yml

on: [push]

jobs:
  lint-and-test:
    steps:
      - Checkout
      - pnpm install
      - ESLint check
      - TypeScript type-check
      - Jest unit tests

  build-preview: # apenas em PRs
    steps:
      - EAS Build --profile preview
      - Gera QR Code para teste físico

  deploy-production: # apenas em merge para main
    steps:
      - EAS Update (OTA para usuários existentes)
      - EAS Build --profile production (se necessário)
      - EAS Submit (se nova versão nativa)
```

---

## 8. Roadmap de Desenvolvimento

### ✅ Fase 1 — MVP (2–3 meses)

1. Setup do projeto: Expo + TypeScript + Expo Router + NativeWind
2. Importar e popular o SQLite com ARA/ACF + Strong Hebraico e Grego
3. Tela de leitura funcional com seletor de livro/capítulo
4. Integração Strong: toque na palavra → Bottom Sheet com definição
5. Busca bíblica básica (FTS5)
6. Highlights por cor + anotações simples (local only)
7. Tema claro/escuro, tamanho de fonte
8. Publicar beta no TestFlight (iOS) e Google Play Testing

### 🔨 Fase 2 — Conteúdo e Conta (1–2 meses)

1. Auth com Supabase (email + Google + Apple)
2. Sync de anotações e destaques na nuvem
3. Modo interlinear (original palavra a palavra)
4. Múltiplas traduções em paralelo
5. Planos de leitura pré-definidos
6. Versículo do dia (widget e notificação)

### 🚀 Fase 3 — Crescimento (contínuo)

1. Módulos adicionais: comentários, dicionários teológicos
2. Mapas bíblicos interativos
3. Compartilhamento de versículos como imagem
4. Modo estudo: Strong + comentário + cross-reference na mesma tela
5. Versão tablet otimizada (iPadOS / Android tablet)
6. Monetização: freemium (conteúdo básico grátis, avançado premium)

---

## 9. Decisões Técnicas Importantes

### Por que SQLite e não uma API REST?

Toda a Bíblia com Strong cabe em ~50–80MB de SQLite. Carregar versículos de uma API REST seria lento, dependeria de conexão e aumentaria custo de servidor. SQLite local oferece queries instantâneas (<5ms) e funciona 100% offline.

### Por que Expo Managed Workflow?

O Expo Managed Workflow elimina a necessidade de lidar com Xcode e Android Studio no dia a dia. O EAS Build compila na nuvem. A única limitação é o uso de native modules muito exóticos — que não é o caso aqui.

### Tokenização do Texto

O maior desafio técnico é o mapeamento palavra-por-palavra entre o texto em português e os Números Strong do original. A solução é usar datasets pré-processados (como os do STEPBible) onde esse alinhamento já existe, e armazená-los como `verse_tokens` no SQLite. Não requer IA ou processamento em tempo real.

### Fonte para Caracteres Bíblicos

Fontes padrão do sistema não suportam hebraico bíblico com pontuação (nikkud) corretamente. É necessário incluir no bundle as fontes **SBL Hebrew** e **SBL Greek** (ambas gratuitas — Society of Biblical Literature).

---

> 🚀 **Próximo Passo Recomendado**
>
> 1. Criar repositório no GitHub com Expo + TypeScript + Expo Router
> 2. Baixar o dataset Strong do GitHub (`openscriptures/strongs`)
> 3. Criar script de importação para popular o SQLite
> 4. Implementar a tela de leitura básica como primeira entrega
>
> Esse fluxo valida o core técnico do produto antes de investir em UI polida.

---

_Logós App — Documento vivo. Atualizar conforme o projeto evolui._
