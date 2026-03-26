# Polícia Marítima - Sistema de Gestão Digital

## Problema Original
Digitalizar o sistema de gestão da Polícia Marítima (Açores) actualmente em Excel e PDFs editáveis. Dois módulos: "Serviços" (Navios e Policiamentos) e "Fiscalização" (Ficha de Fiscalização Única com 9 tipos de atividade e 7 tabs).

## Utilizadores
- 3 postos: HORTA, PICO, VELAS (dados isolados por posto)
- 1 perfil ADMIN (visão agregada de todos os postos)

## Arquitectura
- **Backend**: FastAPI + MongoDB
- **Frontend**: React + Shadcn UI + TailwindCSS
- **Auth**: JWT com isolamento por posto
- **PDF**: jsPDF (client-side)

## Funcionalidades Implementadas
- [x] CRUD Serviços (Navios / Policiamentos) com mapeamento Excel
- [x] Geração PDF para Serviços
- [x] Autenticação com 4 perfis (HORTA, PICO, VELAS, ADMIN)
- [x] Módulo Fiscalização com interface 7-tabs e 9 tipos de atividade
- [x] Captura GPS automática e sticky headers
- [x] Componentes de input customizados: DateInput (DD/MM/AAAA), TimeInput (HH:MM), NIFInput (9 dígitos), GPSInput (38º31.561'N), UpperInput
- [x] Checkbox para ligar Proprietário=Timoneiro e Operador=Proprietário
- [x] Nomenclatura corrigida: "NR ID" em vez de "N. CC"
- [x] GPS inline formatting (sem overlay font-mono, sem parêntesis) — corrigido 26/03/2026
- [x] Pesca Lúdica: "Pescador" em vez de "Timoneiro", campos obrigatórios com validação, checkbox "Pesca Lúdica Embarcada", Proprietário/Operador removidos, tab "Licença/Capturas" — 26/03/2026

## Tarefas Pendentes

### P1
- Aplicar as 6 regras globais (Date, NIF, GPS, nomenclatura) a NaviosForm.jsx e PoliciamentosForm.jsx
- Validar vista global ADMIN no frontend (backend já isolado)

### P2
- Investigar/corrigir problemas intermitentes de login no frontend
- Verificar e aperfeiçoar geração PDF para as 9 Fichas de Fiscalização

### Futuro
- Sistema de notificações para documentos/licenças a expirar em 30 dias
- Refactoring: dividir FiscalizacaoNovo.jsx em sub-componentes por tab

## Credenciais de Teste
- HORTA / HORTA123
- PICO / PICO123
- VELAS / VELAS123
- ADMIN / ADMIN123

## APIs Principais
- POST /api/auth/login
- GET /api/auth/me
- GET /api/kpis
- GET/POST /api/servicos
- GET/POST /api/fiscalizacoes
