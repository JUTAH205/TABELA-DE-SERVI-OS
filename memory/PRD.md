# Polícia Marítima - Plataforma de Gestão v2.0

## Problema Original
Plataforma de gestão para a Capitania do Porto da Horta com módulos de Serviços (Navios/Policiamento) e Fiscalização baseado na "Ficha de Fiscalização Única".

## Arquitectura
- **Frontend**: React + Tailwind + Shadcn UI + jsPDF
- **Backend**: FastAPI + Motor (async MongoDB) + JWT Auth
- **Base de Dados**: MongoDB (coleções: servicos, fiscalizacoes, atividades)

## User Personas
- PM Horta (login HORTA/HORTA123) - unidade HT
- PM Pico (login PICO/PICO123) - unidade SR
- PM Velas (login VELAS/VELAS123) - unidade VE
- Admin (login ADMIN/ADMIN123) - visão global

## Implementado (Fev 2026)
- [x] Sistema de login com 4 perfis (HT, SR, VE, ADMIN)
- [x] Isolamento de dados por unidade (atividades)
- [x] Menu SERVIÇOS: Navios, Policiamentos, Mapa, Relatórios
- [x] Menu FISCALIZAÇÃO: Novo Registo (8 tipos), Mapa, Consulta
- [x] Formulário de Fiscalização com 7 tabs
- [x] Numeração sequencial anual por tipo (PE-001/2026)
- [x] GPS auto-captura + edição manual
- [x] Cabeçalho sticky (N., Data, Hora, GPS, Local, Status)
- [x] KPIs nos formulários de serviço
- [x] VIATURA LIGEIRA (substituiu BOTE)
- [x] Filtros NAVIO/UTENTE nos relatórios
- [x] N. Controlo auto-gerado (anual, sequencial)
- [x] Campos em maiúsculas, DD/MM e HH:MM formatados
- [x] SR = São Roque do Pico
- [x] Atividades customizáveis (combobox)
- [x] Deslocação no fim do formulário
- [x] Secção Extras removida
- [x] Pesquisa por data na tabela de serviços

## Backlog Prioritário
- P0: Debug/corrigir geração PDF de fiscalizações (replicar layout DOCX)
- P0: Checkbox "mesmo proprietário" auto-preenche dados proprietário
- P1: PDF individual por tipo de fiscalização (Pesca Lúdica, Profissional, etc.)
- P1: Importação dados do Excel existente
- P2: Cálculo automático valores Portaria 506/2018
- P2: Histórico de alterações
