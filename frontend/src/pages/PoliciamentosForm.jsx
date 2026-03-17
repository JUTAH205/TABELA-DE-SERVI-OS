import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Save, Plus, Trash2, ArrowLeft } from "lucide-react";
import { UpperInput, DateInput, TimeInput } from "@/components/FormInputs";
import AtividadeCombobox from "@/components/AtividadeCombobox";

const emptyAgente = () => ({
  nome: "", gdh_inicio_dia: "", gdh_inicio_hora: "", gdh_fim_dia: "", gdh_fim_hora: "",
  gdh_servico: "",
  req_p_noturno_4h: 0, req_p_diurno_4h: 0, req_p_sdf: 0,
  req_np_noturno_4h: 0, req_np_diurno_4h: 0, req_np_sdf: 0,
  imp_p_noturno_4h: 0, imp_p_diurno_4h: 0, imp_p_sdf: 0,
  imp_np_noturno_4h: 0, imp_np_diurno_4h: 0, imp_np_sdf: 0,
});

export default function PoliciamentosForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [nextInfo, setNextInfo] = useState({});

  const [form, setForm] = useState({
    tipo_formulario: "policiamentos",
    comando_posto: "HT",
    data: new Date().toISOString().split("T")[0],
    utente: "",
    despacho: "",
    atividade: "",
    navio: "",
    deslocacao_km: 0,
    pol_req_p_diurno_4h: 0, pol_req_p_diurno_h: 0,
    pol_req_p_noturno_4h: 0, pol_req_p_noturno_h: 0,
    pol_req_np_diurno_4h: 0, pol_req_np_diurno_h: 0,
    pol_req_np_noturno_4h: 0, pol_req_np_noturno_h: 0,
    pol_imp_p_diurno_4h: 0, pol_imp_p_diurno_h: 0,
    pol_imp_p_noturno_4h: 0, pol_imp_p_noturno_h: 0,
    pol_imp_np_diurno_4h: 0, pol_imp_np_diurno_h: 0,
    pol_imp_np_noturno_4h: 0, pol_imp_np_noturno_h: 0,
    bote: 0, lancha: 0, moto_agua: 0, viatura_4x4: 0, moto_4: 0,
    agentes: [emptyAgente()],
    responsavel: "",
  });

  useEffect(() => {
    if (isEditing) {
      setLoading(true);
      api.getServico(id).then(data => {
        setForm({ ...data, tipo_formulario: "policiamentos" });
        setLoading(false);
      }).catch(() => { toast.error("Servico nao encontrado"); navigate("/servicos"); });
    } else {
      api.getProximoNumero().then(setNextInfo).catch(() => {});
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
  const removeAgente = (idx) => setForm(prev => ({ ...prev, agentes: prev.agentes.filter((_, i) => i !== idx) }));

  const handleSave = async () => {
    if (!form.utente.trim()) { toast.error("O campo Utente e obrigatorio"); return; }
    setSaving(true);
    try {
      if (isEditing) {
        await api.updateServico(id, form);
        toast.success("Servico atualizado com sucesso");
      } else {
        await api.createServico(form);
        toast.success("Servico criado com sucesso");
      }
      navigate("/servicos");
    } catch { toast.error("Erro ao gravar servico"); } finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground">A carregar...</div>;

  return (
    <div data-testid="policiamentos-form-page" className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-sm hover:bg-slate-100" data-testid="back-btn">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight uppercase" style={{ fontFamily: "Barlow, sans-serif", color: "#002D72" }}>
            {isEditing ? "Editar Servico - Policiamentos" : "Novo Servico - Servicos de Policia"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEditing ? `N. Controlo: ${form.numero_controlo}` : `Proximo N. Controlo: ${nextInfo?.proximo_numero_controlo || "..."}`}
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
              <SelectTrigger className="rounded-sm mt-1.5" data-testid="campo-comando-posto"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="HT">HT - Horta</SelectItem>
                <SelectItem value="VE">VE - Velas</SelectItem>
                <SelectItem value="SR">SR - Sao Roque do Pico</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Data</Label>
            <Input type="date" value={form.data} onChange={e => updateField("data", e.target.value)} className="rounded-sm mt-1.5" data-testid="campo-data" />
          </div>
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Atividade</Label>
            <AtividadeCombobox
              value={form.atividade}
              onChange={(v) => updateField("atividade", v)}
              tipo="policiamentos"
              className="rounded-sm mt-1.5"
            />
          </div>
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Utente</Label>
            <UpperInput value={form.utente} onChange={e => updateField("utente", e.target.value)} className="rounded-sm mt-1.5" placeholder="NOME DO UTENTE" data-testid="campo-utente" />
          </div>
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Despacho</Label>
            <UpperInput value={form.despacho} onChange={e => updateField("despacho", e.target.value)} className="rounded-sm mt-1.5" data-testid="campo-despacho" />
          </div>
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Responsavel</Label>
            <UpperInput value={form.responsavel} onChange={e => updateField("responsavel", e.target.value)} className="rounded-sm mt-1.5" data-testid="campo-responsavel" />
          </div>
        </div>
      </div>

      {/* Policiamento Requisitado */}
      <div className="form-section">
        <div className="form-section-title">Policiamento Requisitado</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { field: "pol_req_p_diurno_4h", label: "P Diurno 4H" },
            { field: "pol_req_p_diurno_h", label: "P Diurno H" },
            { field: "pol_req_p_noturno_4h", label: "P Noturno 4H" },
            { field: "pol_req_p_noturno_h", label: "P Noturno H" },
            { field: "pol_req_np_diurno_4h", label: "NP Diurno 4H" },
            { field: "pol_req_np_diurno_h", label: "NP Diurno H" },
            { field: "pol_req_np_noturno_4h", label: "NP Noturno 4H" },
            { field: "pol_req_np_noturno_h", label: "NP Noturno H" },
          ].map(({ field, label }) => (
            <div key={field}>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</Label>
              <Input type="number" value={form[field]} onChange={e => updateField(field, parseInt(e.target.value) || 0)} className="rounded-sm mt-1.5" data-testid={`campo-${field}`} />
            </div>
          ))}
        </div>
      </div>

      {/* Policiamento Imposto */}
      <div className="form-section">
        <div className="form-section-title">Policiamento Imposto</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { field: "pol_imp_p_diurno_4h", label: "P Diurno 4H" },
            { field: "pol_imp_p_diurno_h", label: "P Diurno H" },
            { field: "pol_imp_p_noturno_4h", label: "P Noturno 4H" },
            { field: "pol_imp_p_noturno_h", label: "P Noturno H" },
            { field: "pol_imp_np_diurno_4h", label: "NP Diurno 4H" },
            { field: "pol_imp_np_diurno_h", label: "NP Diurno H" },
            { field: "pol_imp_np_noturno_4h", label: "NP Noturno 4H" },
            { field: "pol_imp_np_noturno_h", label: "NP Noturno H" },
          ].map(({ field, label }) => (
            <div key={field}>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</Label>
              <Input type="number" value={form[field]} onChange={e => updateField(field, parseInt(e.target.value) || 0)} className="rounded-sm mt-1.5" data-testid={`campo-${field}`} />
            </div>
          ))}
        </div>
      </div>

      {/* Agentes */}
      <div className="form-section">
        <div className="flex items-center justify-between">
          <div className="form-section-title mb-0 pb-0 border-0">Agentes / Participantes</div>
          <Button variant="outline" size="sm" onClick={addAgente} className="rounded-sm text-xs" data-testid="add-agente-btn">
            <Plus className="h-3.5 w-3.5 mr-1" strokeWidth={1.5} /> Adicionar
          </Button>
        </div>
        <div className="space-y-3 mt-3">
          {form.agentes.map((ag, idx) => (
            <Card key={idx} className="rounded-sm border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground" style={{ fontFamily: "Barlow, sans-serif" }}>Agente {idx + 1}</span>
                  {form.agentes.length > 1 && (
                    <button onClick={() => removeAgente(idx)} className="p-1 rounded-sm hover:bg-red-50" data-testid={`remove-agente-${idx}`}>
                      <Trash2 className="h-3.5 w-3.5 text-red-500" strokeWidth={1.5} />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <div className="col-span-2">
                    <Label className="text-xs text-muted-foreground">Nome</Label>
                    <UpperInput value={ag.nome} onChange={e => updateAgente(idx, "nome", e.target.value)} className="rounded-sm mt-1" data-testid={`agente-nome-${idx}`} />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Inicio Dia</Label>
                    <DateInput value={ag.gdh_inicio_dia} onChange={e => updateAgente(idx, "gdh_inicio_dia", e.target.value)} className="rounded-sm mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Inicio Hora</Label>
                    <TimeInput value={ag.gdh_inicio_hora} onChange={e => updateAgente(idx, "gdh_inicio_hora", e.target.value)} className="rounded-sm mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Fim Dia</Label>
                    <DateInput value={ag.gdh_fim_dia} onChange={e => updateAgente(idx, "gdh_fim_dia", e.target.value)} className="rounded-sm mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Fim Hora</Label>
                    <TimeInput value={ag.gdh_fim_hora} onChange={e => updateAgente(idx, "gdh_fim_hora", e.target.value)} className="rounded-sm mt-1" />
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-blue-700 mb-2" style={{ fontFamily: "Barlow, sans-serif" }}>Requisitado</p>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {[
                      { field: "req_p_noturno_4h", label: "P 20-8h" },
                      { field: "req_p_diurno_4h", label: "P 8-20h" },
                      { field: "req_p_sdf", label: "P S/D/F" },
                      { field: "req_np_noturno_4h", label: "NP 20-8h" },
                      { field: "req_np_diurno_4h", label: "NP 8-20h" },
                      { field: "req_np_sdf", label: "NP S/D/F" },
                    ].map(({ field, label }) => (
                      <div key={field}>
                        <Label className="text-xs text-muted-foreground">{label}</Label>
                        <Input type="number" value={ag[field]} onChange={e => updateAgente(idx, field, parseInt(e.target.value) || 0)} className="rounded-sm mt-1" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-red-700 mb-2" style={{ fontFamily: "Barlow, sans-serif" }}>Imposto</p>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {[
                      { field: "imp_p_noturno_4h", label: "P 20-8h" },
                      { field: "imp_p_diurno_4h", label: "P 8-20h" },
                      { field: "imp_p_sdf", label: "P S/D/F" },
                      { field: "imp_np_noturno_4h", label: "NP 20-8h" },
                      { field: "imp_np_diurno_4h", label: "NP 8-20h" },
                      { field: "imp_np_sdf", label: "NP S/D/F" },
                    ].map(({ field, label }) => (
                      <div key={field}>
                        <Label className="text-xs text-muted-foreground">{label}</Label>
                        <Input type="number" value={ag[field]} onChange={e => updateAgente(idx, field, parseInt(e.target.value) || 0)} className="rounded-sm mt-1" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Empenhamento (sem deslocacao) */}
      <div className="form-section">
        <div className="form-section-title">Empenhamento Pessoal e Meios</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { field: "bote", label: "Bote" },
            { field: "lancha", label: "Lancha" },
            { field: "moto_agua", label: "Moto Agua" },
            { field: "viatura_4x4", label: "Viatura 4x4" },
            { field: "moto_4", label: "Moto 4" },
          ].map(({ field, label }) => (
            <div key={field}>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</Label>
              <Input type="number" value={form[field]} onChange={e => updateField(field, parseFloat(e.target.value) || 0)} className="rounded-sm mt-1.5" data-testid={`campo-${field}`} />
            </div>
          ))}
        </div>
      </div>

      {/* Deslocacao (final) */}
      <div className="form-section">
        <div className="form-section-title">Deslocacao</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Deslocacao (KM)</Label>
            <Input type="number" value={form.deslocacao_km} onChange={e => updateField("deslocacao_km", parseFloat(e.target.value) || 0)} className="rounded-sm mt-1.5" data-testid="campo-deslocacao-km" />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between py-4 border-t border-slate-200">
        <Button variant="outline" onClick={() => navigate("/servicos")} className="rounded-sm" data-testid="cancel-btn">Cancelar</Button>
        <Button onClick={handleSave} disabled={saving} className="rounded-sm text-xs font-semibold uppercase tracking-wide" style={{ backgroundColor: "#DA291C", color: "white" }} data-testid="save-btn">
          <Save className="h-4 w-4 mr-1.5" strokeWidth={1.5} />
          {saving ? "A gravar..." : isEditing ? "Atualizar" : "Gravar"}
        </Button>
      </div>
    </div>
  );
}
