import React, { useState } from "react";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Search, Download, FileDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";

const TIPOS_LABEL = { pesca_ludica: "Pesca Ludica", caca_submarina: "Caca Submarina", pesca_profissional: "Pesca Profissional", recreio: "Recreio", maritimo_turistica: "Maritimo-Turistica", operador_mt: "Operador MT", apanha_profissional: "Apanha Profissional", tl_reb_auxl: "TL/Reb./Aux.L" };

export default function FiscalizacaoConsulta() {
  const [filters, setFilters] = useState({ tipo: "todos", unidade: "todos", status: "todos", data_inicio: "", data_fim: "", search: "" });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.tipo !== "todos") params.tipo = filters.tipo;
      if (filters.unidade !== "todos") params.unidade = filters.unidade;
      if (filters.status !== "todos") params.status = filters.status;
      if (filters.data_inicio) params.data_inicio = filters.data_inicio;
      if (filters.data_fim) params.data_fim = filters.data_fim;
      if (filters.search) params.search = filters.search;
      const data = await api.listFisc(params);
      setResult(data);
    } catch { toast.error("Erro"); } finally { setLoading(false); }
  };

  const exportPDF = () => {
    if (!result || result.length === 0) return;
    const doc = new jsPDF("landscape", "mm", "a4");
    const pw = doc.internal.pageSize.getWidth();
    doc.setFillColor(0, 45, 114);
    doc.rect(0, 0, pw, 3, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(0, 45, 114);
    doc.text("POLICIA MARITIMA - CONSULTA DE FISCALIZACOES", pw / 2, 12, { align: "center" });
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text(`Total: ${result.length} registo(s) | Data: ${new Date().toLocaleDateString("pt-PT")}`, pw / 2, 18, { align: "center" });

    doc.autoTable({
      startY: 24,
      head: [["N. Fisc.", "Data", "Tipo", "Nome", "Embarcacao", "Local", "Un.", "Status"]],
      body: result.map(f => [f.numero_fiscalizacao, f.data, TIPOS_LABEL[f.tipo_atividade] || f.tipo_atividade, f.timoneiro_nome || f.operador_nome || "-", f.embarcacao_nome || "-", f.local || "-", f.unidade, f.status === "legal" ? "LEGAL" : "INFRACAO"]),
      theme: "grid",
      styles: { fontSize: 6.5, cellPadding: 1.5 },
      headStyles: { fillColor: [0, 45, 114], textColor: [255, 255, 255], fontSize: 6.5, fontStyle: "bold" },
      margin: { left: 10, right: 10 },
    });
    doc.save("Consulta_Fiscalizacoes.pdf");
    toast.success("PDF exportado");
  };

  const uf = (k, v) => setFilters(prev => ({ ...prev, [k]: v }));

  return (
    <div data-testid="fisc-consulta-page" className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight uppercase" style={{ fontFamily: "Barlow, sans-serif", color: "#002D72" }}>Consulta de Fiscalizacoes</h1>

      <Card className="rounded-sm shadow-sm">
        <CardHeader className="bg-slate-50/50 border-b pb-4">
          <CardTitle className="text-sm font-bold uppercase tracking-wider" style={{ fontFamily: "Barlow, sans-serif", color: "#002D72" }}>Criterios</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div><Label className="text-xs font-semibold uppercase text-muted-foreground">Pesquisa</Label><Input value={filters.search} onChange={e => uf("search", e.target.value)} className="rounded-sm mt-1.5" placeholder="Nome, embarcacao, n. fisc..." data-testid="consulta-search" /></div>
            <div><Label className="text-xs font-semibold uppercase text-muted-foreground">Tipo</Label>
              <Select value={filters.tipo} onValueChange={v => uf("tipo", v)}><SelectTrigger className="rounded-sm mt-1.5"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="todos">Todos</SelectItem>{Object.entries(TIPOS_LABEL).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select>
            </div>
            <div><Label className="text-xs font-semibold uppercase text-muted-foreground">Unidade</Label>
              <Select value={filters.unidade} onValueChange={v => uf("unidade", v)}><SelectTrigger className="rounded-sm mt-1.5"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="todos">Todas</SelectItem><SelectItem value="HT">HT</SelectItem><SelectItem value="SR">SR</SelectItem><SelectItem value="VE">VE</SelectItem></SelectContent></Select>
            </div>
            <div><Label className="text-xs font-semibold uppercase text-muted-foreground">Status</Label>
              <Select value={filters.status} onValueChange={v => uf("status", v)}><SelectTrigger className="rounded-sm mt-1.5"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="todos">Todos</SelectItem><SelectItem value="legal">Legal</SelectItem><SelectItem value="infracao">Infracao</SelectItem></SelectContent></Select>
            </div>
            <div><Label className="text-xs font-semibold uppercase text-muted-foreground">Data Inicio</Label><Input type="date" value={filters.data_inicio} onChange={e => uf("data_inicio", e.target.value)} className="rounded-sm mt-1.5" /></div>
            <div><Label className="text-xs font-semibold uppercase text-muted-foreground">Data Fim</Label><Input type="date" value={filters.data_fim} onChange={e => uf("data_fim", e.target.value)} className="rounded-sm mt-1.5" /></div>
          </div>
          <div className="flex gap-3 mt-5">
            <Button onClick={handleSearch} disabled={loading} className="bg-primary text-primary-foreground rounded-sm text-xs font-semibold uppercase" data-testid="consulta-search-btn">
              <Search className="h-4 w-4 mr-1.5" />{loading ? "A pesquisar..." : "Pesquisar"}
            </Button>
            {result && result.length > 0 && (
              <Button onClick={exportPDF} variant="outline" className="rounded-sm text-xs font-semibold uppercase" data-testid="consulta-export-btn">
                <Download className="h-4 w-4 mr-1.5" />Exportar PDF
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card className="rounded-sm shadow-sm">
          <CardHeader className="bg-slate-50/50 border-b pb-4">
            <CardTitle className="text-sm font-bold uppercase tracking-wider" style={{ fontFamily: "Barlow, sans-serif", color: "#002D72" }}>Resultados ({result.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="service-table w-full" data-testid="consulta-table">
                <thead><tr><th>N. Fisc.</th><th>Data</th><th>Tipo</th><th>Nome</th><th>Embarcacao</th><th>Local</th><th>Un.</th><th>Status</th><th className="text-right">Acoes</th></tr></thead>
                <tbody>
                  {result.length === 0 ? (
                    <tr><td colSpan={9} className="text-center py-8 text-muted-foreground">Sem resultados</td></tr>
                  ) : result.map(f => (
                    <tr key={f.id}>
                      <td className="font-mono font-bold whitespace-nowrap">{f.numero_fiscalizacao}</td>
                      <td className="whitespace-nowrap">{f.data}</td>
                      <td><span className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">{TIPOS_LABEL[f.tipo_atividade] || f.tipo_atividade}</span></td>
                      <td className="uppercase">{f.timoneiro_nome || f.operador_nome || "-"}</td>
                      <td className="uppercase">{f.embarcacao_nome || "-"}</td>
                      <td className="uppercase text-slate-500">{f.local || "-"}</td>
                      <td className="font-semibold">{f.unidade}</td>
                      <td><span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-bold ${f.status === "legal" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>{f.status === "legal" ? "LEGAL" : "INFRACAO"}</span></td>
                      <td className="text-right">
                        <button onClick={() => navigate(`/fiscalizacao/editar/${f.id}`)} className="p-1.5 rounded-sm hover:bg-slate-100"><FileDown className="h-3.5 w-3.5 text-blue-600" strokeWidth={1.5} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
