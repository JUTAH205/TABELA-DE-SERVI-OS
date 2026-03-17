import React, { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Search, Pencil, Trash2, FileDown, Ship, Shield } from "lucide-react";
import { toast } from "sonner";
import { generateNaviosPDF, generatePoliciamentosPDF } from "@/lib/pdfGenerator";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ServicosTable() {
  const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tipoFilter, setTipoFilter] = useState("todos");
  const [comandoFilter, setComandoFilter] = useState("todos");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const navigate = useNavigate();

  const fetchServicos = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (tipoFilter !== "todos") params.tipo = tipoFilter;
      if (comandoFilter !== "todos") params.comando = comandoFilter;
      if (search) params.search = search;
      if (dataInicio) params.data_inicio = dataInicio;
      if (dataFim) params.data_fim = dataFim;
      const data = await api.listServicos(params);
      setServicos(data);
    } catch { toast.error("Erro ao carregar servicos"); }
    finally { setLoading(false); }
  }, [tipoFilter, comandoFilter, search, dataInicio, dataFim]);

  useEffect(() => { fetchServicos(); }, [fetchServicos]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.deleteServico(deleteId);
      toast.success("Servico eliminado com sucesso");
      setDeleteId(null);
      fetchServicos();
    } catch { toast.error("Erro ao eliminar servico"); }
  };

  const handleDownloadPDF = (servico) => {
    if (servico.tipo_formulario === "navios") generateNaviosPDF(servico);
    else generatePoliciamentosPDF(servico);
    toast.success("PDF gerado com sucesso");
  };

  return (
    <div data-testid="servicos-table-page" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight uppercase" style={{ fontFamily: "Barlow, sans-serif", color: "#002D72" }}>
            Servicos Prestados
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{servicos.length} servico(s) registado(s)</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate("/navios/novo")} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm text-xs font-semibold uppercase tracking-wide" data-testid="new-navios-btn">
            <Ship className="h-4 w-4 mr-1.5" strokeWidth={1.5} /> Novo Navios
          </Button>
          <Button onClick={() => navigate("/policiamentos/novo")} className="rounded-sm text-xs font-semibold uppercase tracking-wide" style={{ backgroundColor: "#DA291C", color: "white" }} data-testid="new-policiamentos-btn">
            <Shield className="h-4 w-4 mr-1.5" strokeWidth={1.5} /> Novo Policiamento
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="rounded-sm shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Pesquisar por utente, navio ou n. controlo..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 rounded-sm" data-testid="search-input" />
              </div>
              <Select value={tipoFilter} onValueChange={setTipoFilter}>
                <SelectTrigger className="w-full sm:w-44 rounded-sm" data-testid="filter-tipo"><SelectValue placeholder="Tipo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os tipos</SelectItem>
                  <SelectItem value="navios">Navios</SelectItem>
                  <SelectItem value="policiamentos">Policiamentos</SelectItem>
                </SelectContent>
              </Select>
              <Select value={comandoFilter} onValueChange={setComandoFilter}>
                <SelectTrigger className="w-full sm:w-48 rounded-sm" data-testid="filter-comando"><SelectValue placeholder="Posto" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os postos</SelectItem>
                  <SelectItem value="HT">HT - Horta</SelectItem>
                  <SelectItem value="VE">VE - Velas</SelectItem>
                  <SelectItem value="SR">SR - Sao Roque do Pico</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">Data Inicio</Label>
                <Input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} className="rounded-sm" data-testid="filter-data-inicio" />
              </div>
              <div className="flex-1">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">Data Fim</Label>
                <Input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} className="rounded-sm" data-testid="filter-data-fim" />
              </div>
              <div className="flex items-end">
                <Button variant="outline" size="sm" onClick={() => { setSearch(""); setTipoFilter("todos"); setComandoFilter("todos"); setDataInicio(""); setDataFim(""); }} className="rounded-sm text-xs" data-testid="clear-filters-btn">
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="rounded-sm shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="service-table w-full" data-testid="services-table">
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
                  <th className="text-right">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={9} className="text-center py-12 text-muted-foreground">A carregar...</td></tr>
                ) : servicos.length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-12 text-muted-foreground">Nenhum servico encontrado</td></tr>
                ) : (
                  servicos.map((s) => (
                    <tr key={s.id} data-testid={`service-row-${s.numero_servico}`}>
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
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => navigate(`/${s.tipo_formulario}/editar/${s.id}`)} className="p-1.5 rounded-sm hover:bg-slate-100 transition-colors" title="Editar" data-testid={`edit-btn-${s.numero_servico}`}>
                            <Pencil className="h-3.5 w-3.5 text-slate-500" strokeWidth={1.5} />
                          </button>
                          <button onClick={() => handleDownloadPDF(s)} className="p-1.5 rounded-sm hover:bg-blue-50 transition-colors" title="Descarregar PDF" data-testid={`pdf-btn-${s.numero_servico}`}>
                            <FileDown className="h-3.5 w-3.5 text-blue-600" strokeWidth={1.5} />
                          </button>
                          <button onClick={() => setDeleteId(s.id)} className="p-1.5 rounded-sm hover:bg-red-50 transition-colors" title="Eliminar" data-testid={`delete-btn-${s.numero_servico}`}>
                            <Trash2 className="h-3.5 w-3.5 text-red-500" strokeWidth={1.5} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Servico</AlertDialogTitle>
            <AlertDialogDescription>Tem a certeza que pretende eliminar este servico? Esta acao nao pode ser revertida.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="cancel-delete-btn">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700" data-testid="confirm-delete-btn">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
