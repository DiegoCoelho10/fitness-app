# 💪 FIT APP - Gestão de Treinos com Gamificação

Aplicação moderna e responsiva para gestão de treinos pessoais com sistema de gamificação estilo Duolingo + Gym Rats.

**🌐 Tecnologias:**
- React 18 + Firebase
- Design Mobile-First Responsivo
- Autenticação com Email/Senha
- Firestore para banco de dados
- Framer Motion para animações
- Deploy automático com GitHub Actions

---

## 🚀 Quick Start

### Requisitos
- Node.js 16+
- Git
- Conta Firebase

### 1. Clone o repositório
```bash
git clone https://github.com/seu-user/fitness-app.git
cd fitness-app
```

### 2. Configure Firebase
Crie arquivo `.env.local`:
```env
REACT_APP_FIREBASE_API_KEY=sua_chave
REACT_APP_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=seu-projeto-id
REACT_APP_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=seu-sender-id
REACT_APP_FIREBASE_APP_ID=seu-app-id
```

### 3. Instale e rode
```bash
npm install
npm start
```

Acesse http://localhost:3000

---

## 📱 Features

✅ **Autenticação**
- Login/Cadastro com Firebase
- Dois tipos de usuário: Personal Trainer e Aluno
- Controle de acesso por pagamento

✅ **Dashboard Dinâmico**
- Views diferentes para cada role
- Estatísticas e KPIs
- Ações rápidas

✅ **Layout Responsivo**
- Mobile-first design
- Sidebar recuável
- Funciona em qualquer dispositivo

✅ **Gamificação** (Base)
- Sistema de pontos
- Ranking
- Streaks
- Badges

---

## 🔄 Deploy

### Automático (Recomendado)
```bash
git push
```
GitHub Actions faz tudo automaticamente!

### Manual
```bash
npm run build
firebase deploy
```

---

## 📚 Documentação

- `00_GUIA_ONDE_COLOCAR.md` - Setup local
- `21_DEPLOY_GITHUB_FIREBASE.md` - Deploy detalhado
- `RESUMO_DO_PROJETO.md` - Arquitetura

---

## 🗂️ Estrutura
