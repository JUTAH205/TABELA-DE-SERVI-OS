import React, { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil, Trash2, FileDown, Search } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const TIPOS_LABEL = { pesca_ludica: "Pesca Ludica", caca_submarina: "Caca Submarina", pesca_profissional: "Pesca Profissional", recreio: "Recreio", maritimo_turistica: "Maritimo-Turistica", operador_mt: "Operador MT", apanha_profissional: "Apanha Profissional", tl_reb_auxl: "TL/Reb./Aux.L" };

export default function FiscalizacaoMapa() {
  const [fiscalizacoes, setFiscalizacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tipoFilter, setTipoFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const navigate = useNavigate();

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (tipoFilter !== "todos") params.tipo = tipoFilter;
      if (statusFilter !== "todos") params.status = statusFilter;
      if (search) params.search = search;
      if (dataInicio) params.data_inicio = dataInicio;
      if (dataFim) params.data_fim = dataFim;
      const data = await api.listFisc(params);
      setFiscalizacoes(data);
    } catch { toast.error("Erro ao carregar"); }
    finally { setLoading(false); }
  }, [tipoFilter, statusFilter, search, dataInicio, dataFim]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await api.deleteFisc(deleteId); toast.success("Eliminado"); setDeleteId(null); fetch(); }
    catch { toast.error("Erro"); }
  };

  return (
    <div data-testid="fisc-mapa-page" className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight uppercase" style={{ fontFamily: "Barlow, sans-serif", color: "#002D72" }}>Mapa de Fiscalizacoes</h1>
        <p className="text-sm text-muted-foreground mt-1">{fiscalizacoes.length} registo(s)</p>
      </div>

      <Card className="rounded-sm shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Pesquisar nome, embarcacao, n. fiscalizacao..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 rounded-sm" data-testid="fisc-search" />
            </div>
            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger className="w-full sm:w-44 rounded-sm"><SelectValue placeholder="Tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os tipos</SelectItem>
                {Object.entries(TIPOS_LABEL).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-36 rounded-sm"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="legal">Legal</SelectItem>
                <SelectItem value="infracao">Infracao</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Label className="text-xs font-semibold uppercase text-muted-foreground mb-1 block">Data Inicio</Label>
              <Input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} className="rounded-sm" />
            </div>
            <div className="flex-1">
              <Label className="text-xs font-semibold uppercase text-muted-foreground mb-1 block">Data Fim</Label>
              <Input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} className="rounded-sm" />
            </div>
            <div className="flex items-end">
              <Button variant="outline" size="sm" onClick={() => { setSearch(""); setTipoFilter("todos"); setStatusFilter("todos"); setDataInicio(""); setDataFim(""); }} className="rounded-sm text-xs">Limpar</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-sm shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="service-table w-full" data-testid="fisc-table">
              <thead>
                <tr>
                  <th>N. Fiscalizacao</th>
                  <th>Data</th>
                  <th>Tipo</th>
                  <th>Nome</th>
                  <th>Embarcacao</th>
                  <th>Local</th>
                  <th>Unidade</th>
                  <th>Status</th>
                  <th className="text-right">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={9} className="text-center py-12 text-muted-foreground">A carregar...</td></tr>
                ) : fiscalizacoes.length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-12 text-muted-foreground">Nenhum registo</td></tr>
                ) : (
                  fiscalizacoes.map(f => (
                    <tr key={f.id}>
                      <td className="font-mono font-bold whitespace-nowrap">{f.numero_fiscalizacao}</td>
                      <td className="whitespace-nowrap">{f.data}</td>
                      <td><span className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">{TIPOS_LABEL[f.tipo_atividade] || f.tipo_atividade}</span></td>
                      <td className="uppercase max-w-[150px] truncate">{f.timoneiro_nome || f.operador_nome || "-"}</td>
                      <td className="uppercase">{f.embarcacao_nome || "-"}</td>
                      <td className="uppercase text-slate-500">{f.local || "-"}</td>
                      <td className="font-semibold">{f.unidade}</td>
                      <td>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-bold ${f.status === "legal" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                          {f.status === "legal" ? "LEGAL" : "INFRACAO"}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => navigate(`/fiscalizacao/editar/${f.id}`)} className="p-1.5 rounded-sm hover:bg-slate-100" title="Editar" data-testid={`fisc-edit-${f.numero_fiscalizacao}`}>
                            <Pencil className="h-3.5 w-3.5 text-slate-500" strokeWidth={1.5} />
                          </button>
                          <button onClick={() => setDeleteId(f.id)} className="p-1.5 rounded-sm hover:bg-red-50" title="Eliminar" data-testid={`fisc-delete-${f.numero_fiscalizacao}`}>
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
            <AlertDialogTitle>Eliminar Fiscalizacao</AlertDialogTitle>
            <AlertDialogDescription>Tem a certeza? Esta acao nao pode ser revertida.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
