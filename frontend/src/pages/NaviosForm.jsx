import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/lib/api";
import { generateNaviosPDF } from "@/lib/pdfGenerator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Save, FileDown, Plus, Trash2, ArrowLeft } from "lucide-react";

const ATIVIDADES_NAVIOS = [
  "ESCALA",
  "ABASTECIMENTO",
  "DESCARGA",
  "CARGA",
  "REPARACAO",
  "DOCAGEM",
  "OUTRA",
];

const emptyAgente = () => ({
  nome: "", gdh_inicio_dia: "", gdh_inicio_hora: "", gdh_fim_dia: "", gdh_fim_hora: "",
  visita_entrada: 0, visita_saida: 0, svc_p_req: 0, svc_p_imp: 0, svc_np_req: 0, svc_np_imp: 0,
});

export default function NaviosForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [nextNum, setNextNum] = useState(null);

  const [form, setForm] = useState({
    tipo_formulario: "navios",
    comando_posto: "HT",
    data: new Date().toISOString().split("T")[0],
    utente: "",
    despacho: "",
    numero_controlo: "",
    atividade: "ESCALA",
    navio: "",
    deslocacao_km: 0,
    visita: 0,
    p_req: 0,
    p_imp: 0,
    np_req: 0,
    np_imp: 0,
    pericias: 0,
    agravamento: 0,
    bote: 0,
    lancha: 0,
    moto_agua: 0,
    viatura_4x4: 0,
    moto_4: 0,
    deslocacao: 0,
    agentes: [emptyAgente()],
    responsavel: "",
  });

  useEffect(() => {
    if (isEditing) {
      setLoading(true);
      api.getServico(id).then(data => {
        setForm({ ...data, tipo_formulario: "navios" });
        setLoading(false);
      }).catch(() => {
        toast.error("Servico nao encontrado");
        navigate("/servicos");
      });
    } else {
      api.getProximoNumero().then(data => setNextNum(data.proximo_numero)).catch(() => {});
    }
  }, [id, isEditing, navigate]);

  const updateField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const updateAgente = (idx, field, value) => {
    setForm(prev => {
      const agentes = [...prev.agentes];
      agentes[idx] = { ...agentes[idx], [field]: value };
      return { ...prev, agentes };
    });
  };

  const addAgente = () => setForm(prev => ({ ...prev, agentes: [...prev.agentes, emptyAgente()] }));
  const removeAgente = (idx) => setForm(prev => ({
    ...prev,
    agentes: prev.agentes.filter((_, i) => i !== idx),
  }));

  const handleSave = async () => {
    if (!form.utente.trim()) {
      toast.error("O campo Utente e obrigatorio");
      return;
    }
    setSaving(true);
    try {
      let result;
      if (isEditing) {
        result = await api.updateServico(id, form);
        toast.success("Servico atualizado com sucesso");
      } else {
        result = await api.createServico(form);
        toast.success("Servico criado com sucesso");
      }
      // Generate PDF
      generateNaviosPDF(result);
      toast.success("PDF gerado com sucesso");
      navigate("/servicos");
    } catch (err) {
      toast.error("Erro ao gravar servico");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">A carregar...</div>;
  }

  return (
    <div data-testid="navios-form-page" className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-sm hover:bg-slate-100" data-testid="back-btn">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight uppercase" style={{ fontFamily: "Barlow, sans-serif", color: "#002D72" }}>
            {isEditing ? "Editar Servico - Navios" : "Novo Servico - Policiamento a Navios"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEditing ? `Servico N.o ${form.numero_servico}` : `Proximo N.o: ${nextNum || "..."}`}
          </p>
        </div>
      </div>

      {/* Info Section */}
      <div className="form-section">
        <div className="form-section-title">Informacao Geral</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Comando / Posto</Label>
            <Select value={form.comando_posto} onValueChange={v => updateField("comando_posto", v)}>
              <SelectTrigger className="rounded-sm mt-1.5" data-testid="campo-comando-posto">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HT">HT - Horta</SelectItem>
                <SelectItem value="VE">VE - Velas</SelectItem>
                <SelectItem value="SR">SR - Santa Cruz</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Data</Label>
            <Input type="date" value={form.data} onChange={e => updateField("data", e.target.value)} className="rounded-sm mt-1.5" data-testid="campo-data" />
          </div>
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Atividade</Label>
            <Select value={form.atividade} onValueChange={v => updateField("atividade", v)}>
              <SelectTrigger className="rounded-sm mt-1.5" data-testid="campo-atividade">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ATIVIDADES_NAVIOS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Utente</Label>
            <Input value={form.utente} onChange={e => updateField("utente", e.target.value)} className="rounded-sm mt-1.5" placeholder="Nome do utente" data-testid="campo-utente" />
          </div>
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Navio</Label>
            <Input value={form.navio} onChange={e => updateField("navio", e.target.value)} className="rounded-sm mt-1.5" placeholder="Nome do navio" data-testid="campo-navio" />
          </div>
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Despacho</Label>
            <Input value={form.despacho} onChange={e => updateField("despacho", e.target.value)} className="rounded-sm mt-1.5" data-testid="campo-despacho" />
          </div>
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">N. Controlo</Label>
            <Input value={form.numero_controlo} onChange={e => updateField("numero_controlo", e.target.value)} className="rounded-sm mt-1.5" data-testid="campo-numero-controlo" />
          </div>
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Deslocacao (KM)</Label>
            <Input type="number" value={form.deslocacao_km} onChange={e => updateField("deslocacao_km", parseFloat(e.target.value) || 0)} className="rounded-sm mt-1.5" data-testid="campo-deslocacao-km" />
          </div>
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Responsavel</Label>
            <Input value={form.responsavel} onChange={e => updateField("responsavel", e.target.value)} className="rounded-sm mt-1.5" data-testid="campo-responsavel" />
          </div>
        </div>
      </div>

      {/* Escala de Navios */}
      <div className="form-section">
        <div className="form-section-title">Escala de Navios</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { field: "visita", label: "Visita" },
            { field: "p_req", label: "P. Requisitado" },
            { field: "p_imp", label: "P. Imposto" },
            { field: "np_req", label: "NP Requisitado" },
            { field: "np_imp", label: "NP Imposto" },
          ].map(({ field, label }) => (
            <div key={field}>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</Label>
              <Input
                type="number"
                value={form[field]}
                onChange={e => updateField(field, parseInt(e.target.value) || 0)}
                className="rounded-sm mt-1.5"
                data-testid={`campo-${field}`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Empenhamento */}
      <div className="form-section">
        <div className="form-section-title">Empenhamento Pessoal e Meios</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { field: "bote", label: "Bote" },
            { field: "lancha", label: "Lancha" },
            { field: "moto_agua", label: "Moto Agua" },
            { field: "viatura_4x4", label: "Viatura 4x4" },
            { field: "moto_4", label: "Moto 4" },
            { field: "deslocacao", label: "Deslocacao" },
          ].map(({ field, label }) => (
            <div key={field}>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</Label>
              <Input
                type="number"
                value={form[field]}
                onChange={e => updateField(field, parseFloat(e.target.value) || 0)}
                className="rounded-sm mt-1.5"
                data-testid={`campo-${field}`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Agentes */}
      <div className="form-section">
        <div className="flex items-center justify-between">
          <div className="form-section-title mb-0 pb-0 border-0">Agentes / Participantes</div>
          <Button variant="outline" size="sm" onClick={addAgente} className="rounded-sm text-xs" data-testid="add-agente-btn">
            <Plus className="h-3.5 w-3.5 mr-1" strokeWidth={1.5} />
            Adicionar
          </Button>
        </div>
        <div className="space-y-3 mt-3">
          {form.agentes.map((ag, idx) => (
            <Card key={idx} className="rounded-sm border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground" style={{ fontFamily: "Barlow, sans-serif" }}>
                    Agente {idx + 1}
                  </span>
                  {form.agentes.length > 1 && (
                    <button onClick={() => removeAgente(idx)} className="p-1 rounded-sm hover:bg-red-50" data-testid={`remove-agente-${idx}`}>
                      <Trash2 className="h-3.5 w-3.5 text-red-500" strokeWidth={1.5} />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <div className="col-span-2 sm:col-span-3 lg:col-span-2">
                    <Label className="text-xs text-muted-foreground">Nome</Label>
                    <Input value={ag.nome} onChange={e => updateAgente(idx, "nome", e.target.value)} className="rounded-sm mt-1" data-testid={`agente-nome-${idx}`} />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Inicio Dia</Label>
                    <Input value={ag.gdh_inicio_dia} onChange={e => updateAgente(idx, "gdh_inicio_dia", e.target.value)} className="rounded-sm mt-1" placeholder="DD/MM" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Inicio Hora</Label>
                    <Input value={ag.gdh_inicio_hora} onChange={e => updateAgente(idx, "gdh_inicio_hora", e.target.value)} className="rounded-sm mt-1" placeholder="HH:MM" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Fim Dia</Label>
                    <Input value={ag.gdh_fim_dia} onChange={e => updateAgente(idx, "gdh_fim_dia", e.target.value)} className="rounded-sm mt-1" placeholder="DD/MM" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Fim Hora</Label>
                    <Input value={ag.gdh_fim_hora} onChange={e => updateAgente(idx, "gdh_fim_hora", e.target.value)} className="rounded-sm mt-1" placeholder="HH:MM" />
                  </div>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Visita Ent.</Label>
                    <Input type="number" value={ag.visita_entrada} onChange={e => updateAgente(idx, "visita_entrada", parseInt(e.target.value) || 0)} className="rounded-sm mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Visita Saida</Label>
                    <Input type="number" value={ag.visita_saida} onChange={e => updateAgente(idx, "visita_saida", parseInt(e.target.value) || 0)} className="rounded-sm mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">SVC P Req</Label>
                    <Input type="number" value={ag.svc_p_req} onChange={e => updateAgente(idx, "svc_p_req", parseInt(e.target.value) || 0)} className="rounded-sm mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">SVC P Imp</Label>
                    <Input type="number" value={ag.svc_p_imp} onChange={e => updateAgente(idx, "svc_p_imp", parseInt(e.target.value) || 0)} className="rounded-sm mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">SVC NP Req</Label>
                    <Input type="number" value={ag.svc_np_req} onChange={e => updateAgente(idx, "svc_np_req", parseInt(e.target.value) || 0)} className="rounded-sm mt-1" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between py-4 border-t border-slate-200">
        <Button variant="outline" onClick={() => navigate("/servicos")} className="rounded-sm" data-testid="cancel-btn">
          Cancelar
        </Button>
        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm text-xs font-semibold uppercase tracking-wide"
            data-testid="save-btn"
          >
            <Save className="h-4 w-4 mr-1.5" strokeWidth={1.5} />
            {saving ? "A gravar..." : isEditing ? "Atualizar e Gerar PDF" : "Gravar e Gerar PDF"}
          </Button>
        </div>
      </div>
    </div>
  );
}
