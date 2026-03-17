import React, { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { FileBarChart, Search, Download } from "lucide-react";
import { generateNaviosPDF, generatePoliciamentosPDF } from "@/lib/pdfGenerator";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function Relatorio() {
  const [filters, setFilters] = useState({
    tipo: "todos",
    comando: "todos",
    data_inicio: "",
    data_fim: "",
    atividade: "",
    utente: "",
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const updateFilter = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.tipo !== "todos") params.tipo = filters.tipo;
      if (filters.comando !== "todos") params.comando = filters.comando;
      if (filters.data_inicio) params.data_inicio = filters.data_inicio;
      if (filters.data_fim) params.data_fim = filters.data_fim;
      if (filters.atividade) params.atividade = filters.atividade;
      if (filters.utente) params.utente = filters.utente;
      const data = await api.getRelatorio(params);
      setResult(data);
    } catch {
      toast.error("Erro ao gerar relatorio");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    if (!result || result.servicos.length === 0) return;

    const doc = new jsPDF("landscape", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(0, 45, 114);
    doc.rect(0, 0, pageWidth, 3, "F");
    doc.setFillColor(218, 41, 28);
    doc.rect(0, 3, pageWidth, 1, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(0, 45, 114);
    doc.text("POLICIA MARITIMA - COMANDO LOCAL DA HORTA", pageWidth / 2, 12, { align: "center" });
    doc.setFontSize(9);
    doc.text("RELATORIO DE SERVICOS PRESTADOS", pageWidth / 2, 18, { align: "center" });

    // Filter info
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    let filterText = "Filtros: ";
    if (filters.tipo !== "todos") filterText += `Tipo: ${filters.tipo} | `;
    if (filters.comando !== "todos") filterText += `Posto: ${filters.comando} | `;
    if (filters.data_inicio) filterText += `De: ${filters.data_inicio} | `;
    if (filters.data_fim) filterText += `Ate: ${filters.data_fim} | `;
    if (filters.atividade) filterText += `Atividade: ${filters.atividade} | `;
    if (filters.utente) filterText += `Utente: ${filters.utente} | `;
    doc.text(filterText, 15, 24);

    // Summary
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(0, 45, 114);
    doc.text(`Total: ${result.total} servico(s)`, 15, 30);

    let summaryX = 60;
    if (result.por_tipo) {
      Object.entries(result.por_tipo).forEach(([k, v]) => {
        doc.text(`${k}: ${v}`, summaryX, 30);
        summaryX += 40;
      });
    }

    // Table
    const tableData = result.servicos.map(s => [
      s.numero_controlo,
      s.tipo_formulario === "navios" ? "Navios" : "Policia",
      s.comando_posto,
      s.data,
      s.utente,
      s.atividade,
      s.navio || "-",
      s.deslocacao_km || 0,
    ]);

    doc.autoTable({
      startY: 35,
      head: [["N. Controlo", "Tipo", "Posto", "Data", "Utente", "Atividade", "Navio", "Desloc."]],
      body: tableData,
      theme: "grid",
      styles: { fontSize: 6.5, cellPadding: 1.5 },
      headStyles: { fillColor: [0, 45, 114], textColor: [255, 255, 255], fontSize: 6.5, fontStyle: "bold" },
      margin: { left: 15, right: 15 },
    });

    doc.save("Relatorio_Servicos.pdf");
    toast.success("Relatorio PDF exportado");
  };

  const handleDownloadServicePDF = (servico) => {
    if (servico.tipo_formulario === "navios") generateNaviosPDF(servico);
    else generatePoliciamentosPDF(servico);
  };

  return (
    <div data-testid="relatorio-page" className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight uppercase" style={{ fontFamily: "Barlow, sans-serif", color: "#002D72" }}>
          Gerar Relatorio
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Selecione os criterios para gerar o relatorio pretendido</p>
      </div>

      {/* Filters */}
      <Card className="rounded-sm shadow-sm">
        <CardHeader className="bg-slate-50/50 border-b pb-4">
          <CardTitle className="text-sm font-bold uppercase tracking-wider" style={{ fontFamily: "Barlow, sans-serif", color: "#002D72" }}>
            Criterios de Pesquisa
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tipo de Servico</Label>
              <Select value={filters.tipo} onValueChange={v => updateFilter("tipo", v)}>
                <SelectTrigger className="rounded-sm mt-1.5" data-testid="rel-filter-tipo"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="navios">Navios</SelectItem>
                  <SelectItem value="policiamentos">Policiamentos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Comando / Posto</Label>
              <Select value={filters.comando} onValueChange={v => updateFilter("comando", v)}>
                <SelectTrigger className="rounded-sm mt-1.5" data-testid="rel-filter-comando"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="HT">HT - Horta</SelectItem>
                  <SelectItem value="VE">VE - Velas</SelectItem>
                  <SelectItem value="SR">SR - Sao Roque do Pico</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Atividade</Label>
              <Input value={filters.atividade} onChange={e => updateFilter("atividade", e.target.value.toUpperCase())} className="rounded-sm mt-1.5" placeholder="FILTRAR POR ATIVIDADE" style={{ textTransform: "uppercase" }} data-testid="rel-filter-atividade" />
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Data Inicio</Label>
              <Input type="date" value={filters.data_inicio} onChange={e => updateFilter("data_inicio", e.target.value)} className="rounded-sm mt-1.5" data-testid="rel-filter-data-inicio" />
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Data Fim</Label>
              <Input type="date" value={filters.data_fim} onChange={e => updateFilter("data_fim", e.target.value)} className="rounded-sm mt-1.5" data-testid="rel-filter-data-fim" />
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Utente</Label>
              <Input value={filters.utente} onChange={e => updateFilter("utente", e.target.value.toUpperCase())} className="rounded-sm mt-1.5" placeholder="FILTRAR POR UTENTE" style={{ textTransform: "uppercase" }} data-testid="rel-filter-utente" />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <Button onClick={handleSearch} disabled={loading} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm text-xs font-semibold uppercase tracking-wide" data-testid="rel-search-btn">
              <Search className="h-4 w-4 mr-1.5" strokeWidth={1.5} />
              {loading ? "A pesquisar..." : "Pesquisar"}
            </Button>
            {result && result.servicos.length > 0 && (
              <Button onClick={handleExportPDF} variant="outline" className="rounded-sm text-xs font-semibold uppercase tracking-wide" data-testid="rel-export-btn">
                <Download className="h-4 w-4 mr-1.5" strokeWidth={1.5} />
                Exportar Relatorio PDF
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="stat-card">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" style={{ fontFamily: "Barlow, sans-serif" }}>Total</p>
              <p className="text-3xl font-bold mt-1" style={{ color: "#002D72" }}>{result.total}</p>
            </div>
            {Object.entries(result.por_tipo || {}).map(([k, v]) => (
              <div key={k} className="stat-card">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" style={{ fontFamily: "Barlow, sans-serif" }}>{k}</p>
                <p className="text-3xl font-bold mt-1" style={{ color: "#002D72" }}>{v}</p>
              </div>
            ))}
            {Object.entries(result.por_posto || {}).map(([k, v]) => (
              <div key={k} className="stat-card">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" style={{ fontFamily: "Barlow, sans-serif" }}>Posto {k}</p>
                <p className="text-3xl font-bold mt-1" style={{ color: "#002D72" }}>{v}</p>
              </div>
            ))}
          </div>

          {/* Atividades breakdown */}
          {result.por_atividade && Object.keys(result.por_atividade).length > 0 && (
            <Card className="rounded-sm shadow-sm">
              <CardHeader className="bg-slate-50/50 border-b pb-4">
                <CardTitle className="text-sm font-bold uppercase tracking-wider" style={{ fontFamily: "Barlow, sans-serif", color: "#002D72" }}>
                  Por Atividade
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {Object.entries(result.por_atividade).map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-sm border border-slate-100">
                      <span className="text-sm font-medium uppercase text-slate-700">{k}</span>
                      <span className="text-sm font-bold" style={{ color: "#002D72" }}>{v}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results table */}
          <Card className="rounded-sm shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b pb-4">
              <CardTitle className="text-sm font-bold uppercase tracking-wider" style={{ fontFamily: "Barlow, sans-serif", color: "#002D72" }}>
                Resultados ({result.servicos.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="service-table w-full" data-testid="relatorio-table">
                  <thead>
                    <tr>
                      <th>N. Controlo</th>
                      <th>Tipo</th>
                      <th>Posto</th>
                      <th>Data</th>
                      <th>Utente</th>
                      <th>Atividade</th>
                      <th>Navio</th>
                      <th>Desloc.</th>
                      <th className="text-right">PDF</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.servicos.length === 0 ? (
                      <tr><td colSpan={9} className="text-center py-8 text-muted-foreground">Nenhum resultado encontrado</td></tr>
                    ) : (
                      result.servicos.map((s, i) => (
                        <tr key={i}>
                          <td className="font-mono font-bold whitespace-nowrap">{s.numero_controlo}</td>
                          <td>
                            <span className={s.tipo_formulario === "navios" ? "badge-navios" : "badge-policiamentos"}>
                              {s.tipo_formulario === "navios" ? "Navios" : "Policia"}
                            </span>
                          </td>
                          <td className="font-semibold">{s.comando_posto}</td>
                          <td className="whitespace-nowrap">{s.data}</td>
                          <td className="max-w-[200px] truncate uppercase">{s.utente}</td>
                          <td className="text-slate-500 max-w-[150px] truncate uppercase">{s.atividade}</td>
                          <td className="text-slate-500 uppercase">{s.navio || "-"}</td>
                          <td className="font-mono">{s.deslocacao_km || 0}</td>
                          <td className="text-right">
                            <button onClick={() => handleDownloadServicePDF(s)} className="p-1.5 rounded-sm hover:bg-blue-50 transition-colors" data-testid={`rel-pdf-btn-${i}`}>
                              <FileDown className="h-3.5 w-3.5 text-blue-600" strokeWidth={1.5} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
