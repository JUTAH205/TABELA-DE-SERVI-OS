import jsPDF from "jspdf";
import "jspdf-autotable";

const PRIMARY_COLOR = [0, 45, 114]; // #002D72
const ACCENT_COLOR = [218, 41, 28]; // #DA291C
const TEXT_COLOR = [15, 23, 42];
const LIGHT_BG = [241, 245, 249];

function addHeader(doc, title) {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Top bar
  doc.setFillColor(...PRIMARY_COLOR);
  doc.rect(0, 0, pageWidth, 3, "F");
  doc.setFillColor(...ACCENT_COLOR);
  doc.rect(0, 3, pageWidth, 1, "F");

  // Header text
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("S. R.", pageWidth / 2, 12, { align: "center" });
  
  doc.setFontSize(7);
  doc.text("MINISTERIO DA DEFESA NACIONAL", pageWidth / 2, 16, { align: "center" });
  doc.text("AUTORIDADE MARITIMA NACIONAL", pageWidth / 2, 20, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text("POLICIA MARITIMA", pageWidth / 2, 26, { align: "center" });

  doc.setFontSize(8);
  doc.text("COMANDO LOCAL DA HORTA", pageWidth / 2, 31, { align: "center" });

  // Separator
  doc.setDrawColor(...PRIMARY_COLOR);
  doc.setLineWidth(0.5);
  doc.line(15, 34, pageWidth - 15, 34);

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text(title, pageWidth / 2, 40, { align: "center" });
}

function addInfoGrid(doc, fields, startY) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const colWidth = (pageWidth - margin * 2) / 2;
  let y = startY;

  fields.forEach((row, idx) => {
    row.forEach((field, colIdx) => {
      const x = margin + colIdx * colWidth;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      doc.text(field.label + ":", x, y);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...TEXT_COLOR);
      doc.text(String(field.value || ""), x + 35, y);
    });
    y += 7;
  });

  return y;
}

function addFooter(doc, servico) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const y = pageHeight - 35;

  doc.setDrawColor(...PRIMARY_COLOR);
  doc.setLineWidth(0.3);
  doc.line(15, y, pageWidth - 15, y);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);

  // Left: 2nd Commander
  doc.text("VISTO", 30, y + 8, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.text("2.o COMANDANTE", 30, y + 18, { align: "center" });
  doc.line(15, y + 14, 50, y + 14);

  // Right: Commander
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text("VISTO", pageWidth - 30, y + 8, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.text("COMANDANTE", pageWidth - 30, y + 18, { align: "center" });
  doc.line(pageWidth - 50, y + 14, pageWidth - 15, y + 14);

  // Center: responsible
  if (servico.responsavel) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...TEXT_COLOR);
    doc.text("O Responsavel: " + servico.responsavel, pageWidth / 2, y + 8, { align: "center" });
  }

  // Bottom bar
  doc.setFillColor(...ACCENT_COLOR);
  doc.rect(0, pageHeight - 4, pageWidth, 1, "F");
  doc.setFillColor(...PRIMARY_COLOR);
  doc.rect(0, pageHeight - 3, pageWidth, 3, "F");
}

export function generateNaviosPDF(servico) {
  const doc = new jsPDF("landscape", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();

  // Page 1: Relacao de Participantes
  addHeader(doc, "RELACAO DE PARTICIPANTES");

  const infoFields = [
    [
      { label: "TIPO", value: "ATOS E SERVICO DE POLICIAMENTO A NAVIOS" },
      { label: "DESPACHO", value: servico.despacho },
    ],
    [
      { label: "ATIVIDADE", value: servico.atividade },
      { label: "N. CONTROLO", value: servico.numero_controlo },
    ],
    [
      { label: "NAVIO", value: servico.navio },
      { label: "N. SERVICO", value: String(servico.numero_servico) },
    ],
    [
      { label: "UTENTE", value: servico.utente },
      { label: "DESLOCACAO KM", value: String(servico.deslocacao_km || 0) },
    ],
  ];

  let y = addInfoGrid(doc, infoFields, 48);
  y += 5;

  // Agents table
  const agentHeaders = [
    "AGENTE", "GDH INICIO\nDIA", "GDH INICIO\nHORA", "GDH FIM\nDIA", "GDH FIM\nHORA",
    "VISITA\nENTRADA", "VISITA\nSAIDA", "SVC P\nREQ", "SVC P\nIMP", "SVC NP\nREQ", "SVC NP\nIMP"
  ];

  const agentRows = (servico.agentes || []).map(a => [
    a.nome, a.gdh_inicio_dia, a.gdh_inicio_hora, a.gdh_fim_dia, a.gdh_fim_hora,
    a.visita_entrada || 0, a.visita_saida || 0, a.svc_p_req || 0, a.svc_p_imp || 0,
    a.svc_np_req || 0, a.svc_np_imp || 0
  ]);

  if (agentRows.length === 0) {
    agentRows.push(["", "", "", "", "", "", "", "", "", "", ""]);
  }

  doc.autoTable({
    startY: y,
    head: [agentHeaders],
    body: agentRows,
    theme: "grid",
    styles: { fontSize: 7, cellPadding: 2, textColor: TEXT_COLOR },
    headStyles: {
      fillColor: PRIMARY_COLOR,
      textColor: [255, 255, 255],
      fontSize: 6,
      fontStyle: "bold",
      halign: "center",
    },
    columnStyles: {
      0: { cellWidth: 40 },
    },
    margin: { left: 15, right: 15 },
  });

  addFooter(doc, servico);

  // Page 2: Mapa de Comunicacao
  doc.addPage("landscape");
  addHeader(doc, "MAPA DE COMUNICACAO DE SERVICOS DE POLICIAMENTO PRESTADOS");

  const infoFields2 = [
    [
      { label: "ATIVIDADE", value: servico.atividade },
      { label: "DESPACHO", value: servico.despacho },
    ],
    [
      { label: "NAVIO", value: servico.navio },
      { label: "N. CONTROLO", value: servico.numero_controlo },
    ],
    [
      { label: "UTENTE", value: servico.utente },
      { label: "N. SERVICO", value: String(servico.numero_servico) },
    ],
  ];

  let y2 = addInfoGrid(doc, infoFields2, 48);
  y2 += 3;

  doc.setFont("helvetica", "italic");
  doc.setFontSize(6);
  doc.setTextColor(100, 100, 100);
  doc.text("Valores a cobrar de acordo com a Portaria 506/2018, de 02 de outubro", 15, y2);
  y2 += 5;

  // Escala de Navios table
  const naviosServiceData = [
    ["Visita a navios a entrada ou saida do porto", "1.5", String(servico.visita || 0)],
    ["Policiamento permanente requisitado - navios (hora)", "1.6", String(servico.p_req || 0)],
    ["Policiamento nao permanente requisitado - navios (hora)", "1.7", String(servico.np_req || 0)],
    ["Policiamento permanente imposto - navios (hora)", "1.8", String(servico.p_imp || 0)],
    ["Policiamento nao permanente imposto - navios (hora)", "1.9", String(servico.np_imp || 0)],
  ];

  doc.autoTable({
    startY: y2,
    head: [["ESCALA DE NAVIOS", "ART.", "QTD"]],
    body: naviosServiceData,
    theme: "grid",
    styles: { fontSize: 7, cellPadding: 2, textColor: TEXT_COLOR },
    headStyles: { fillColor: PRIMARY_COLOR, textColor: [255, 255, 255], fontSize: 7, fontStyle: "bold" },
    columnStyles: { 0: { cellWidth: 150 }, 1: { cellWidth: 20, halign: "center" }, 2: { cellWidth: 20, halign: "center" } },
    margin: { left: 15, right: 15 },
  });

  y2 = doc.lastAutoTable.finalY + 5;

  // Empenhamento table
  const empData = [
    ["Bote semirrigido (hora excl. tripulacao)", "3.49", String(servico.bote || 0)],
    ["Lancha ou embarcacao (hora excl. tripulacao)", "3.50", String(servico.lancha || 0)],
    ["Mota de agua (hora excl. tripulacao)", "3.51", String(servico.moto_agua || 0)],
    ["Viatura Ligeira 4x4 (hora excl. operador)", "3.52", String(servico.viatura_4x4 || 0)],
    ["Moto-quatro 4x4 (hora excl. operador)", "3.53", String(servico.moto_4 || 0)],
    ["Deslocacao pessoal em servico (km)", "3.54", String(servico.deslocacao || 0)],
  ];

  doc.autoTable({
    startY: y2,
    head: [["EMPENHAMENTO PESSOAL E MEIOS", "ART.", "QTD"]],
    body: empData,
    theme: "grid",
    styles: { fontSize: 7, cellPadding: 2, textColor: TEXT_COLOR },
    headStyles: { fillColor: ACCENT_COLOR, textColor: [255, 255, 255], fontSize: 7, fontStyle: "bold" },
    columnStyles: { 0: { cellWidth: 150 }, 1: { cellWidth: 20, halign: "center" }, 2: { cellWidth: 20, halign: "center" } },
    margin: { left: 15, right: 15 },
  });

  addFooter(doc, servico);

  doc.save(`Servico_Navios_${servico.numero_servico}.pdf`);
}

export function generatePoliciamentosPDF(servico) {
  const doc = new jsPDF("landscape", "mm", "a4");

  // Page 1: Relacao de Participantes
  addHeader(doc, "RELACAO DE PARTICIPANTES");

  const infoFields = [
    [
      { label: "TIPO", value: "ATOS E SERVICO DE POLICIA" },
      { label: "DESPACHO", value: servico.despacho },
    ],
    [
      { label: "ATIVIDADE", value: servico.atividade },
      { label: "N. CONTROLO", value: servico.numero_controlo },
    ],
    [
      { label: "UTENTE", value: servico.utente },
      { label: "N. SERVICO", value: String(servico.numero_servico) },
    ],
    [
      { label: "DESLOCACAO KM", value: String(servico.deslocacao_km || 0) },
      { label: "", value: "" },
    ],
  ];

  let y = addInfoGrid(doc, infoFields, 48);
  y += 5;

  // Police agents table
  const agentHeaders = [
    "AGENTE", "DIA\nINICIO", "HORA\nINICIO", "DIA\nFIM", "HORA\nFIM",
    "REQ P\n20-8h", "REQ P\n8-20h", "REQ P\nS/D/F",
    "REQ NP\n20-8h", "REQ NP\n8-20h", "REQ NP\nS/D/F",
    "IMP P\n20-8h", "IMP P\n8-20h", "IMP P\nS/D/F",
    "IMP NP\n20-8h", "IMP NP\n8-20h", "IMP NP\nS/D/F"
  ];

  const agentRows = (servico.agentes || []).map(a => [
    a.nome, a.gdh_inicio_dia, a.gdh_inicio_hora, a.gdh_fim_dia, a.gdh_fim_hora,
    a.req_p_noturno_4h || 0, a.req_p_diurno_4h || 0, a.req_p_sdf || 0,
    a.req_np_noturno_4h || 0, a.req_np_diurno_4h || 0, a.req_np_sdf || 0,
    a.imp_p_noturno_4h || 0, a.imp_p_diurno_4h || 0, a.imp_p_sdf || 0,
    a.imp_np_noturno_4h || 0, a.imp_np_diurno_4h || 0, a.imp_np_sdf || 0,
  ]);

  if (agentRows.length === 0) {
    agentRows.push(Array(17).fill(""));
  }

  doc.autoTable({
    startY: y,
    head: [agentHeaders],
    body: agentRows,
    theme: "grid",
    styles: { fontSize: 6, cellPadding: 1.5, textColor: TEXT_COLOR },
    headStyles: {
      fillColor: PRIMARY_COLOR,
      textColor: [255, 255, 255],
      fontSize: 5.5,
      fontStyle: "bold",
      halign: "center",
    },
    columnStyles: { 0: { cellWidth: 35 } },
    margin: { left: 10, right: 10 },
  });

  addFooter(doc, servico);

  // Page 2: Mapa de Comunicacao
  doc.addPage("landscape");
  addHeader(doc, "MAPA DE COMUNICACAO DE SERVICOS DE POLICIAMENTO PRESTADOS");

  const infoFields2 = [
    [
      { label: "ATIVIDADE", value: servico.atividade },
      { label: "DESPACHO", value: servico.despacho },
    ],
    [
      { label: "UTENTE", value: servico.utente },
      { label: "N. CONTROLO", value: servico.numero_controlo },
    ],
  ];

  let y2 = addInfoGrid(doc, infoFields2, 48);
  y2 += 3;

  doc.setFont("helvetica", "italic");
  doc.setFontSize(6);
  doc.setTextColor(100, 100, 100);
  doc.text("Valores a cobrar de acordo com a Portaria 506/2018, de 02 de outubro", 15, y2);
  y2 += 5;

  // Policiamento Requisitado table
  const reqData = [
    ["Permanente 8H-20H (por hora)", "4.1", String(servico.pol_req_p_diurno_4h || 0), String(servico.pol_req_p_diurno_h || 0)],
    ["Permanente 20H-08H (por hora)", "4.2", String(servico.pol_req_p_noturno_4h || 0), String(servico.pol_req_p_noturno_h || 0)],
    ["Nao Permanente 8H-20H (por hora)", "4.3", String(servico.pol_req_np_diurno_4h || 0), String(servico.pol_req_np_diurno_h || 0)],
    ["Nao Permanente 20H-08H (por hora)", "4.4", String(servico.pol_req_np_noturno_4h || 0), String(servico.pol_req_np_noturno_h || 0)],
  ];

  doc.autoTable({
    startY: y2,
    head: [["POLICIAMENTO REQUISITADO", "ART.", "4H", "H"]],
    body: reqData,
    theme: "grid",
    styles: { fontSize: 7, cellPadding: 2, textColor: TEXT_COLOR },
    headStyles: { fillColor: PRIMARY_COLOR, textColor: [255, 255, 255], fontSize: 7, fontStyle: "bold" },
    columnStyles: {
      0: { cellWidth: 120 },
      1: { cellWidth: 20, halign: "center" },
      2: { cellWidth: 20, halign: "center" },
      3: { cellWidth: 20, halign: "center" },
    },
    margin: { left: 15, right: 15 },
  });

  y2 = doc.lastAutoTable.finalY + 4;

  // Policiamento Imposto table
  const impData = [
    ["Permanente 8H-20H (por hora)", "4.9", String(servico.pol_imp_p_diurno_4h || 0), String(servico.pol_imp_p_diurno_h || 0)],
    ["Permanente 20H-08H (por hora)", "4.13", String(servico.pol_imp_p_noturno_4h || 0), String(servico.pol_imp_p_noturno_h || 0)],
    ["Nao Permanente 8H-20H (por hora)", "4.11", String(servico.pol_imp_np_diurno_4h || 0), String(servico.pol_imp_np_diurno_h || 0)],
    ["Nao Permanente 20H-08H (por hora)", "4.15", String(servico.pol_imp_np_noturno_4h || 0), String(servico.pol_imp_np_noturno_h || 0)],
  ];

  doc.autoTable({
    startY: y2,
    head: [["POLICIAMENTO IMPOSTO", "ART.", "4H", "H"]],
    body: impData,
    theme: "grid",
    styles: { fontSize: 7, cellPadding: 2, textColor: TEXT_COLOR },
    headStyles: { fillColor: [139, 92, 246], textColor: [255, 255, 255], fontSize: 7, fontStyle: "bold" },
    columnStyles: {
      0: { cellWidth: 120 },
      1: { cellWidth: 20, halign: "center" },
      2: { cellWidth: 20, halign: "center" },
      3: { cellWidth: 20, halign: "center" },
    },
    margin: { left: 15, right: 15 },
  });

  y2 = doc.lastAutoTable.finalY + 4;

  // Empenhamento
  const empData = [
    ["Bote semirrigido (hora excl. tripulacao)", "3.49", String(servico.bote || 0)],
    ["Lancha ou embarcacao (hora excl. tripulacao)", "3.50", String(servico.lancha || 0)],
    ["Mota de agua (hora excl. tripulacao)", "3.51", String(servico.moto_agua || 0)],
    ["Viatura Ligeira 4x4 (hora excl. operador)", "3.52", String(servico.viatura_4x4 || 0)],
    ["Moto-quatro 4x4 (hora excl. operador)", "3.53", String(servico.moto_4 || 0)],
    ["Deslocacao pessoal em servico (km)", "3.54", String(servico.deslocacao || 0)],
  ];

  doc.autoTable({
    startY: y2,
    head: [["EMPENHAMENTO PESSOAL E MEIOS", "ART.", "QTD"]],
    body: empData,
    theme: "grid",
    styles: { fontSize: 7, cellPadding: 2, textColor: TEXT_COLOR },
    headStyles: { fillColor: ACCENT_COLOR, textColor: [255, 255, 255], fontSize: 7, fontStyle: "bold" },
    columnStyles: { 0: { cellWidth: 120 }, 1: { cellWidth: 20, halign: "center" }, 2: { cellWidth: 20, halign: "center" } },
    margin: { left: 15, right: 15 },
  });

  addFooter(doc, servico);

  doc.save(`Servico_Policiamentos_${servico.numero_servico}.pdf`);
}
