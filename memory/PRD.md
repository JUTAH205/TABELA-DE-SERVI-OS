# Polícia Marítima - Gestão de Serviços Prestados

## Problema Original
Sistema de gestão de serviços prestados para o Comando Local da Horta da Polícia Marítima. Dois tipos de formulários (Policiamento a Navios e Serviços de Polícia) que preenchem uma tabela comum. Geração de PDF tipo fatura ao gravar. Edição de serviços existentes.

## Arquitectura
- **Frontend**: React + Tailwind CSS + Shadcn UI + jsPDF
- **Backend**: FastAPI + Motor (async MongoDB)
- **Base de Dados**: MongoDB (coleção `servicos`)
- **PDF**: Geração client-side com jsPDF + jspdf-autotable

## User Personas
- Agentes da Polícia Marítima (inserção de serviços)
- Pessoal administrativo (consulta e geração de relatórios)

## Requisitos Core
- Tabela de serviços prestados (baseada no Excel fornecido)
- Formulário de Navios (policiamento a navios)
- Formulário de Policiamentos (serviços de polícia)
- Número único de serviço auto-incrementado
- Geração de PDF ao gravar (2 páginas: Relação de Participantes + Mapa de Comunicação)
- Edição e eliminação de serviços
- Dashboard com estatísticas
- Sem autenticação (por agora)
- Tudo em Português de Portugal

## Implementado (Fev 2026)
- [x] Backend com CRUD completo de serviços
- [x] Dashboard com estatísticas (total, por tipo, por posto, mensal)
- [x] Tabela de serviços com pesquisa e filtros
- [x] Formulário de Navios com agentes
- [x] Formulário de Policiamentos com agentes
- [x] Geração de PDF (Navios e Policiamentos)
- [x] Edição de serviços existentes
- [x] Eliminação de serviços com confirmação
- [x] Design institucional (Barlow + Inter, azul marinho + vermelho)

## Backlog
- P0: Importação de dados do Excel existente
- P1: Autenticação de utilizadores
- P1: Exportação de relatórios mensais (Excel/PDF)
- P2: Gestão de utentes (base de dados de utentes frequentes)
- P2: Cálculo automático de valores a cobrar (Portaria 506/2018)
- P2: Histórico de alterações nos serviços
