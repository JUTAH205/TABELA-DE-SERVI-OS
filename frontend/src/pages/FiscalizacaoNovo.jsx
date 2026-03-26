import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Save, ArrowLeft, MapPin, Plus, Trash2 } from "lucide-react";
import { UpperInput, DateInput, TimeInput, GPSInput, NIFInput } from "@/components/FormInputs";

const TIPOS = {
  pesca_ludica: "Pesca Ludica", caca_submarina: "Caca Submarina", pesca_profissional: "Pesca Profissional",
  recreio: "Recreio", maritimo_turistica: "Maritimo-Turistica", operador_mt: "Operador MT",
  apanha_profissional: "Apanha Profissional", tl_reb_auxl: "TL / Reboque / Aux. Local",
};

const TABS_CONFIG = {
  pesca_ludica: ["identificacao", "atividade", "observacoes"],
  caca_submarina: ["identificacao", "atividade", "observacoes"],
  apanha_profissional: ["identificacao", "atividade", "observacoes"],
  pesca_profissional: ["identificacao", "embarcacao", "documentos", "palamenta", "atividade", "observacoes", "apoio"],
  recreio: ["identificacao", "embarcacao", "documentos", "palamenta", "observacoes", "apoio"],
  maritimo_turistica: ["identificacao", "embarcacao", "documentos", "palamenta", "atividade", "observacoes", "apoio"],
  operador_mt: ["identificacao", "atividade", "observacoes"],
  tl_reb_auxl: ["identificacao", "embarcacao", "documentos", "palamenta", "atividade", "observacoes", "apoio"],
};

const TAB_LABELS = { identificacao: "Identificacao", embarcacao: "Embarcacao/Motor", documentos: "Documentos", palamenta: "Palamenta/Seguranca", atividade: "Atividade/Capturas", observacoes: "Observacoes", apoio: "Apoio" };
const TAB_LABELS_LICENCA = { ...TAB_LABELS, atividade: "Licenca/Capturas" };

const MEIOS_COM_VALIDADE = ["f_mao", "paraq", "fumig", "extintor", "jangada"];

const DOC_FIELDS = ["titulo_prop", "c_arqueacao", "c_lotacao_seguranca", "seguro", "c_nav_vistoria", "rol_tripulacao", "c_agulhas", "cedulas_marit", "l_estacao", "cert_insp_balsas", "diario_pesca"];
const DOC_LABELS = {"titulo_prop":"Titulo Prop.", "c_arqueacao":"C. Arqueacao", "c_lotacao_seguranca":"C. Lotacao Seg.", "seguro":"Seguro", "c_nav_vistoria":"C. Nav/Vistoria", "rol_tripulacao":"Rol Tripulacao", "c_agulhas":"C. Agulhas", "cedulas_marit":"Cedulas Marit.", "l_estacao":"L. Estacao", "cert_insp_balsas":"Cert. Insp. Balsas", "diario_pesca":"Diario Pesca"};

const DOC_FIELDS_RECREIO = ["seguro", "c_nav_vistoria", "taxa_farolagem", "cert_insp_balsas", "l_estacao"];
const DOC_LABELS_RECREIO = {"seguro":"Seguro", "c_nav_vistoria":"Livrete / Vistoria", "taxa_farolagem":"Taxa de Farolagem", "cert_insp_balsas":"Cert. Insp. Balsas", "l_estacao":"L. Estacao"};

const MEIOS_FIELDS = ["f_mao", "paraq", "fumig", "extintor", "jangada", "coletes", "inscricoes", "primeiros_socorros", "lanterna_pilhas", "faca_ponta_redond", "bussola", "ferro_fundear", "ap_sonoro", "bandeira_nacional", "cabo_reboque", "boia_circular", "agulha_magnetica", "espelho", "luzes_navegacao", "cartas_publicacoes"];
const MEIOS_LABELS = {"f_mao":"F. Mao", "paraq":"Paraq.", "fumig":"Fumig.", "extintor":"Extintor", "jangada":"Jangada", "coletes":"Coletes", "inscricoes":"Inscricoes", "primeiros_socorros":"1.os Socorros", "lanterna_pilhas":"Lanterna+Pilhas", "faca_ponta_redond":"Faca P. Redond.", "bussola":"Bussola", "ferro_fundear":"Ferro Fundear", "ap_sonoro":"Ap. Sonoro", "bandeira_nacional":"Band. Nacional", "cabo_reboque":"Cabo Reboque", "boia_circular":"Boia Circular", "agulha_magnetica":"Agulha Magn.", "espelho":"Espelho", "luzes_navegacao":"Luzes Nav.", "cartas_publicacoes":"Cartas/Pub."};

const defaultForm = () => ({
  tipo_atividade: "", data: "", hora: new Date().toTimeString().slice(0,5), gps_n: "", gps_w: "", local: "", status: "legal",
  // Timoneiro / Arrais / Mestre
  timoneiro_nome: "", timoneiro_estado_civil: "", timoneiro_morada: "", timoneiro_id: "", timoneiro_id_validade: "", timoneiro_data_nasc: "", timoneiro_contato: "", timoneiro_naturalidade: "", timoneiro_profissao: "", timoneiro_nif: "", timoneiro_filiacao: "", timoneiro_carta: "", timoneiro_im: "", timoneiro_categoria: "", timoneiro_carta_validade: "",
  // Proprietario
  mesmo_proprietario: false,
  proprietario_nome: "", proprietario_nif: "", proprietario_morada: "", proprietario_id: "", proprietario_id_validade: "", proprietario_data_nasc: "", proprietario_contato: "",
  // Operador (independente)
  mesmo_operador_proprietario: false,
  operador_nome: "", operador_nif: "", operador_morada: "", operador_cartao_num: "", operador_cartao_validade: "", operador_cae: "", operador_contato: "", operador_licenca_num: "", operador_licenca_validade: "",
  // Embarcacao
  embarcacao_nome: "", embarcacao_con_id: "", embarcacao_call_sign: "",
  motor1_marca: "", motor1_serie: "", motor1_potencia: "", motor2_marca: "", motor2_serie: "", motor2_potencia: "",
  documentos: {}, meios_salvacao: {},
  licenca_num: "", licenca_validade: "", licenca_tipo: "", especies: [{ nome: "", peso_kg: "" }], artes: [{ nome: "" }], infracoes: {},
  radio_op_nome: "", radio_op_num: "", radio_op_categoria: "", radio_op_validade: "",
  licenca_mt_num: "", licenca_mt_validade: "", atividades_autorizadas: "", seguros: [], autorizacao_cetaceos_validade: "",
  embarcacoes_associadas: [],
  observacoes: "",
  // Pesca Ludica Embarcada
  pesca_ludica_embarcada: false,
});

// Format today as DD/MM/AAAA
function todayFormatted() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
}

export default function FiscalizacaoNovo() {
  const { tipo: urlTipo, id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const [step, setStep] = useState(urlTipo ? "form" : "select");
  const [selectedTipo, setSelectedTipo] = useState(urlTipo || "");
  const [activeTab, setActiveTab] = useState("identificacao");
  const [form, setForm] = useState({ ...defaultForm(), data: todayFormatted() });
  const [nextNum, setNextNum] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditing) {
      setLoading(true);
      api.getFisc(id).then(data => { setForm(data); setSelectedTipo(data.tipo_atividade); setStep("form"); setLoading(false); })
        .catch(() => { toast.error("Nao encontrado"); navigate("/fiscalizacao/mapa"); });
    }
  }, [id, isEditing, navigate]);

  useEffect(() => {
    if (urlTipo && !isEditing) {
      setSelectedTipo(urlTipo); setStep("form");
      setForm(prev => ({ ...prev, tipo_atividade: urlTipo }));
      api.getFiscProximoNumero(urlTipo).then(d => setNextNum(d.proximo_numero)).catch(() => {});
    }
  }, [urlTipo, isEditing]);

  // GPS auto
  useEffect(() => {
    if (step === "form" && !isEditing && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = Math.abs(pos.coords.longitude);
          const latD = Math.floor(lat); const latM = ((lat - latD) * 60).toFixed(3);
          const lonD = Math.floor(lon); const lonM = ((lon - lonD) * 60).toFixed(3);
          setForm(prev => ({ ...prev, gps_n: `${latD} ${latM}`, gps_w: `${lonD} ${lonM}` }));
        }, () => {}
      );
    }
  }, [step, isEditing]);

  const selectTipo = (t) => {
    setSelectedTipo(t); setForm({ ...defaultForm(), data: todayFormatted(), tipo_atividade: t }); setStep("form"); setActiveTab("identificacao");
    api.getFiscProximoNumero(t).then(d => setNextNum(d.proximo_numero)).catch(() => {});
  };

  const u = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const uDoc = (field, key, value) => setForm(prev => ({ ...prev, documentos: { ...prev.documentos, [field]: { ...(prev.documentos[field] || {}), [key]: value } } }));
  const uMeio = (field, value) => setForm(prev => ({ ...prev, meios_salvacao: { ...prev.meios_salvacao, [field]: value } }));

  // Auto-copy proprietario when checkbox "mesmo_proprietario" is toggled
  useEffect(() => {
    if (form.mesmo_proprietario) {
      setForm(prev => ({ ...prev, proprietario_nome: prev.timoneiro_nome, proprietario_nif: prev.timoneiro_nif, proprietario_morada: prev.timoneiro_morada, proprietario_id: prev.timoneiro_id, proprietario_id_validade: prev.timoneiro_id_validade, proprietario_data_nasc: prev.timoneiro_data_nasc, proprietario_contato: prev.timoneiro_contato }));
    }
  }, [form.mesmo_proprietario, form.timoneiro_nome, form.timoneiro_nif, form.timoneiro_morada, form.timoneiro_id, form.timoneiro_id_validade, form.timoneiro_data_nasc, form.timoneiro_contato]);

  // Auto-copy operador when checkbox "mesmo_operador_proprietario" is toggled
  useEffect(() => {
    if (form.mesmo_operador_proprietario) {
      setForm(prev => ({ ...prev, operador_nome: prev.proprietario_nome, operador_nif: prev.proprietario_nif, operador_morada: prev.proprietario_morada, operador_contato: prev.proprietario_contato }));
    }
  }, [form.mesmo_operador_proprietario, form.proprietario_nome, form.proprietario_nif, form.proprietario_morada, form.proprietario_contato]);

  const handleSave = async () => {
    // Validation for Pesca Ludica required fields
    if (selectedTipo === "pesca_ludica") {
      const missing = [];
      if (!form.timoneiro_nome?.trim()) missing.push("Nome");
      if (!form.timoneiro_nif || form.timoneiro_nif.length !== 9) missing.push("NIF (9 digitos)");
      if (!form.timoneiro_id?.trim()) missing.push("NR ID");
      if (!form.timoneiro_data_nasc || form.timoneiro_data_nasc.length !== 10) missing.push("Data de Nascimento");
      if (missing.length > 0) {
        toast.error(`Campos obrigatorios em falta: ${missing.join(", ")}`);
        setSaving(false);
        return;
      }
    }
    // Validation for Pesca Profissional required fields
    if (selectedTipo === "pesca_profissional") {
      const missing = [];
      if (!form.timoneiro_nome?.trim()) missing.push("Nome Mestre/Arrais");
      if (!form.timoneiro_carta?.trim()) missing.push("Carta / I.M.");
      if (!form.embarcacao_nome?.trim()) missing.push("Nome Embarcacao");
      if (!form.embarcacao_con_id?.trim()) missing.push("C.I.");
      if (missing.length > 0) {
        toast.error(`Campos obrigatorios em falta: ${missing.join(", ")}`);
        setSaving(false);
        return;
      }
    }
    // Validation for Recreio required fields
    if (selectedTipo === "recreio") {
      const missing = [];
      if (!form.timoneiro_nome?.trim()) missing.push("Nome Timoneiro");
      if (!form.embarcacao_nome?.trim()) missing.push("Nome Embarcacao");
      if (!form.embarcacao_con_id?.trim()) missing.push("C.I.");
      if (missing.length > 0) {
        toast.error(`Campos obrigatorios em falta: ${missing.join(", ")}`);
        setSaving(false);
        return;
      }
    }
    setSaving(true);
    try {
      if (isEditing) { await api.updateFisc(id, form); toast.success("Registo atualizado"); }
      else { await api.createFisc(form); toast.success("Registo criado"); }
      navigate("/fiscalizacao/mapa");
    } catch { toast.error("Erro ao gravar"); } finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground">A carregar...</div>;

  if (step === "select") {
    return (
      <div data-testid="fisc-select-page" className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold tracking-tight uppercase" style={{ fontFamily: "Barlow, sans-serif", color: "#002D72" }}>Nova Fiscalizacao - Selecionar Tipo</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(TIPOS).map(([key, label]) => (
            <button key={key} onClick={() => selectTipo(key)} className="p-4 bg-white border border-slate-200 rounded-sm hover:border-blue-300 hover:shadow-md transition-all text-left" data-testid={`fisc-tipo-${key}`}>
              <p className="text-sm font-bold uppercase tracking-wide" style={{ color: "#002D72", fontFamily: "Barlow, sans-serif" }}>{label}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const tabs = TABS_CONFIG[selectedTipo] || ["identificacao", "observacoes"];
  const isPescaLudica = selectedTipo === "pesca_ludica";
  const isPescaProf = selectedTipo === "pesca_profissional";
  const isRecreio = selectedTipo === "recreio";
  const hasPropSection = !["operador_mt", "pesca_ludica"].includes(selectedTipo);
  const hasOperadorSection = ["maritimo_turistica", "operador_mt", "tl_reb_auxl"].includes(selectedTipo);
  const currentTabLabels = (isPescaLudica || isPescaProf) ? TAB_LABELS_LICENCA : TAB_LABELS;
  const showRequiredMestre = isPescaProf || isRecreio;

  return (
    <div data-testid="fisc-form-page" className="max-w-5xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => isEditing ? navigate("/fiscalizacao/mapa") : setStep("select")} className="p-2 rounded-sm hover:bg-slate-100" data-testid="back-btn">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
        </button>
        <div>
          <h1 className="text-xl font-bold tracking-tight uppercase" style={{ fontFamily: "Barlow, sans-serif", color: "#002D72" }}>
            {isEditing ? "Editar" : "Nova"} Fiscalizacao - {TIPOS[selectedTipo]}
          </h1>
        </div>
      </div>

      {/* Sticky header */}
      <div className="sticky top-0 z-20 bg-white border border-slate-200 rounded-sm p-3 shadow-sm" data-testid="fisc-sticky-header">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="font-mono font-bold" style={{ color: "#002D72" }}>{isEditing ? form.numero_fiscalizacao : (nextNum || "...")}</div>
          <div className="flex items-center gap-1">
            <Label className="text-xs text-muted-foreground">Data:</Label>
            <DateInput value={form.data} onChange={e => u("data", e.target.value)} className="rounded-sm h-7 text-xs w-28" />
          </div>
          <div className="flex items-center gap-1">
            <Label className="text-xs text-muted-foreground">Hora:</Label>
            <TimeInput value={form.hora} onChange={e => u("hora", e.target.value)} className="rounded-sm h-7 text-xs w-16" />
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
            <Label className="text-xs text-muted-foreground">N:</Label>
            <GPSInput value={form.gps_n} onChange={e => u("gps_n", e.target.value)} hemisferio="N" className="rounded-sm h-7 text-xs w-28" />
            <Label className="text-xs text-muted-foreground">W:</Label>
            <GPSInput value={form.gps_w} onChange={e => u("gps_w", e.target.value)} hemisferio="W" className="rounded-sm h-7 text-xs w-28" />
          </div>
          <div className="flex items-center gap-1">
            <Label className="text-xs text-muted-foreground">Local:</Label>
            <UpperInput value={form.local} onChange={e => u("local", e.target.value)} className="rounded-sm h-7 text-xs w-28" />
          </div>
          <Select value={form.status} onValueChange={v => u("status", v)}>
            <SelectTrigger className={`h-7 text-xs w-28 rounded-sm font-bold ${form.status === "legal" ? "bg-green-50 text-green-700 border-green-300" : "bg-red-50 text-red-700 border-red-300"}`} data-testid="campo-status"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="legal">LEGAL</SelectItem><SelectItem value="infracao">INFRACAO</SelectItem></SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-slate-200 pb-1" data-testid="fisc-tabs">
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)} className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-t-sm transition-colors ${activeTab === t ? "bg-white border border-b-0 border-slate-200" : "text-slate-400 hover:text-slate-600"}`} data-testid={`tab-${t}`} style={activeTab === t ? { fontFamily: "Barlow, sans-serif", color: "#002D72" } : {}}>
            {currentTabLabels[t]}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="form-section min-h-[300px]">
        {activeTab === "identificacao" && (
          <div className="space-y-5">
            {/* Timoneiro / Arrais / Mestre — ou "Pescador" para Pesca Ludica */}
            <div>
              <div className="form-section-title">{isPescaLudica ? "Pescador" : isRecreio ? "Timoneiro" : "Timoneiro / Arrais / Mestre"}</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="sm:col-span-2"><Label className="text-xs text-muted-foreground">Nome {(isPescaLudica || showRequiredMestre) && <span className="text-red-500">*</span>}</Label><UpperInput value={form.timoneiro_nome} onChange={e => u("timoneiro_nome", e.target.value)} className="rounded-sm mt-1" data-testid="campo-timoneiro-nome" /></div>
                <div><Label className="text-xs text-muted-foreground">NIF {isPescaLudica && <span className="text-red-500">*</span>}</Label><NIFInput value={form.timoneiro_nif} onChange={e => u("timoneiro_nif", e.target.value)} className="rounded-sm mt-1" /></div>
                <div className="sm:col-span-2"><Label className="text-xs text-muted-foreground">Morada</Label><UpperInput value={form.timoneiro_morada} onChange={e => u("timoneiro_morada", e.target.value)} className="rounded-sm mt-1" /></div>
                <div><Label className="text-xs text-muted-foreground">NR ID {isPescaLudica && <span className="text-red-500">*</span>}</Label><Input value={form.timoneiro_id} onChange={e => u("timoneiro_id", e.target.value)} className="rounded-sm mt-1" /></div>
                <div><Label className="text-xs text-muted-foreground">Validade ID</Label><DateInput value={form.timoneiro_id_validade} onChange={e => u("timoneiro_id_validade", e.target.value)} className="rounded-sm mt-1" /></div>
                <div><Label className="text-xs text-muted-foreground">Data Nasc. {isPescaLudica && <span className="text-red-500">*</span>}</Label><DateInput value={form.timoneiro_data_nasc} onChange={e => u("timoneiro_data_nasc", e.target.value)} className="rounded-sm mt-1" /></div>
                <div><Label className="text-xs text-muted-foreground">Contato</Label><Input value={form.timoneiro_contato} onChange={e => u("timoneiro_contato", e.target.value)} className="rounded-sm mt-1" /></div>
                {!isPescaLudica && (
                  <>
                    <div><Label className="text-xs text-muted-foreground">Naturalidade</Label><UpperInput value={form.timoneiro_naturalidade} onChange={e => u("timoneiro_naturalidade", e.target.value)} className="rounded-sm mt-1" /></div>
                    <div><Label className="text-xs text-muted-foreground">Profissao</Label><UpperInput value={form.timoneiro_profissao} onChange={e => u("timoneiro_profissao", e.target.value)} className="rounded-sm mt-1" /></div>
                    <div><Label className="text-xs text-muted-foreground">N. Carta / I.M. {showRequiredMestre && <span className="text-red-500">*</span>}</Label><Input value={form.timoneiro_carta} onChange={e => u("timoneiro_carta", e.target.value)} className="rounded-sm mt-1" /></div>
                    <div><Label className="text-xs text-muted-foreground">Categoria</Label><UpperInput value={form.timoneiro_categoria} onChange={e => u("timoneiro_categoria", e.target.value)} className="rounded-sm mt-1" /></div>
                    <div><Label className="text-xs text-muted-foreground">Validade Carta</Label><DateInput value={form.timoneiro_carta_validade} onChange={e => u("timoneiro_carta_validade", e.target.value)} className="rounded-sm mt-1" /></div>
                  </>
                )}
              </div>
            </div>

            {/* Pesca Ludica Embarcada */}
            {isPescaLudica && (
              <>
                <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-sm border border-blue-100">
                  <Checkbox checked={form.pesca_ludica_embarcada} onCheckedChange={v => u("pesca_ludica_embarcada", v)} data-testid="pesca-ludica-embarcada" />
                  <Label className="text-xs font-semibold">Pesca Ludica Embarcada</Label>
                </div>
                {form.pesca_ludica_embarcada && (
                  <div>
                    <div className="form-section-title">Embarcacao</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div><Label className="text-xs text-muted-foreground">Nome da Embarcacao</Label><UpperInput value={form.embarcacao_nome} onChange={e => u("embarcacao_nome", e.target.value)} className="rounded-sm mt-1" data-testid="campo-embarcacao-nome-ludica" /></div>
                      <div><Label className="text-xs text-muted-foreground">C.I.</Label><UpperInput value={form.embarcacao_con_id} onChange={e => u("embarcacao_con_id", e.target.value)} className="rounded-sm mt-1" data-testid="campo-ci-ludica" /></div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Proprietario */}
            {hasPropSection && (
              <>
                <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-sm border border-blue-100">
                  <Checkbox checked={form.mesmo_proprietario} onCheckedChange={v => u("mesmo_proprietario", v)} data-testid="mesmo-proprietario" />
                  <Label className="text-xs font-semibold">Proprietario e o mesmo</Label>
                </div>
                <div>
                  <div className="form-section-title">Proprietario</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="sm:col-span-2"><Label className="text-xs text-muted-foreground">Nome</Label><UpperInput value={form.proprietario_nome} onChange={e => u("proprietario_nome", e.target.value)} className="rounded-sm mt-1" readOnly={form.mesmo_proprietario} /></div>
                    <div><Label className="text-xs text-muted-foreground">NIF</Label><NIFInput value={form.proprietario_nif} onChange={e => u("proprietario_nif", e.target.value)} className="rounded-sm mt-1" readOnly={form.mesmo_proprietario} /></div>
                    <div className="sm:col-span-2"><Label className="text-xs text-muted-foreground">Morada</Label><UpperInput value={form.proprietario_morada} onChange={e => u("proprietario_morada", e.target.value)} className="rounded-sm mt-1" readOnly={form.mesmo_proprietario} /></div>
                    <div><Label className="text-xs text-muted-foreground">NR ID</Label><Input value={form.proprietario_id} onChange={e => u("proprietario_id", e.target.value)} className="rounded-sm mt-1" readOnly={form.mesmo_proprietario} /></div>
                    <div><Label className="text-xs text-muted-foreground">Validade ID</Label><DateInput value={form.proprietario_id_validade} onChange={e => u("proprietario_id_validade", e.target.value)} className="rounded-sm mt-1" readOnly={form.mesmo_proprietario} /></div>
                    <div><Label className="text-xs text-muted-foreground">Data Nasc.</Label><DateInput value={form.proprietario_data_nasc} onChange={e => u("proprietario_data_nasc", e.target.value)} className="rounded-sm mt-1" readOnly={form.mesmo_proprietario} /></div>
                    <div><Label className="text-xs text-muted-foreground">Contato</Label><Input value={form.proprietario_contato} onChange={e => u("proprietario_contato", e.target.value)} className="rounded-sm mt-1" readOnly={form.mesmo_proprietario} /></div>
                  </div>
                </div>
              </>
            )}

            {/* Operador (independente, com checkbox ligacao ao proprietario) */}
            {hasOperadorSection && (
              <>
                <div className="flex items-center gap-2 p-2 bg-amber-50 rounded-sm border border-amber-100">
                  <Checkbox checked={form.mesmo_operador_proprietario} onCheckedChange={v => u("mesmo_operador_proprietario", v)} data-testid="mesmo-operador" />
                  <Label className="text-xs font-semibold">Operador e o mesmo que o Proprietario</Label>
                </div>
                <div>
                  <div className="form-section-title">Operador</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="sm:col-span-2"><Label className="text-xs text-muted-foreground">Nome</Label><UpperInput value={form.operador_nome} onChange={e => u("operador_nome", e.target.value)} className="rounded-sm mt-1" readOnly={form.mesmo_operador_proprietario} /></div>
                    <div><Label className="text-xs text-muted-foreground">NIF</Label><NIFInput value={form.operador_nif} onChange={e => u("operador_nif", e.target.value)} className="rounded-sm mt-1" readOnly={form.mesmo_operador_proprietario} /></div>
                    <div className="sm:col-span-2"><Label className="text-xs text-muted-foreground">Morada</Label><UpperInput value={form.operador_morada} onChange={e => u("operador_morada", e.target.value)} className="rounded-sm mt-1" readOnly={form.mesmo_operador_proprietario} /></div>
                    <div><Label className="text-xs text-muted-foreground">N. Cartao Operador</Label><Input value={form.operador_cartao_num} onChange={e => u("operador_cartao_num", e.target.value)} className="rounded-sm mt-1" /></div>
                    <div><Label className="text-xs text-muted-foreground">Validade Cartao</Label><DateInput value={form.operador_cartao_validade} onChange={e => u("operador_cartao_validade", e.target.value)} className="rounded-sm mt-1" /></div>
                    <div><Label className="text-xs text-muted-foreground">CAE</Label><Input value={form.operador_cae} onChange={e => u("operador_cae", e.target.value)} className="rounded-sm mt-1" /></div>
                    <div><Label className="text-xs text-muted-foreground">Contato</Label><Input value={form.operador_contato} onChange={e => u("operador_contato", e.target.value)} className="rounded-sm mt-1" readOnly={form.mesmo_operador_proprietario} /></div>
                    <div><Label className="text-xs text-muted-foreground">N. Licenca</Label><Input value={form.operador_licenca_num} onChange={e => u("operador_licenca_num", e.target.value)} className="rounded-sm mt-1" /></div>
                    <div><Label className="text-xs text-muted-foreground">Validade Licenca</Label><DateInput value={form.operador_licenca_validade} onChange={e => u("operador_licenca_validade", e.target.value)} className="rounded-sm mt-1" /></div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "embarcacao" && (
          <div className="space-y-5">
            <div>
              <div className="form-section-title">Embarcacao</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div><Label className="text-xs text-muted-foreground">Nome {(isPescaProf || isRecreio) && <span className="text-red-500">*</span>}</Label><UpperInput value={form.embarcacao_nome} onChange={e => u("embarcacao_nome", e.target.value)} className="rounded-sm mt-1" data-testid="campo-embarcacao-nome" /></div>
                <div><Label className="text-xs text-muted-foreground">C.I. {(isPescaProf || isRecreio) && <span className="text-red-500">*</span>}</Label><UpperInput value={form.embarcacao_con_id} onChange={e => u("embarcacao_con_id", e.target.value)} className="rounded-sm mt-1" /></div>
                <div><Label className="text-xs text-muted-foreground">Call Sign</Label><UpperInput value={form.embarcacao_call_sign} onChange={e => u("embarcacao_call_sign", e.target.value)} className="rounded-sm mt-1" /></div>
              </div>
            </div>
            <div>
              <div className="form-section-title">Motor 1</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div><Label className="text-xs text-muted-foreground">Marca</Label><UpperInput value={form.motor1_marca} onChange={e => u("motor1_marca", e.target.value)} className="rounded-sm mt-1" /></div>
                <div><Label className="text-xs text-muted-foreground">N. Serie</Label><Input value={form.motor1_serie} onChange={e => u("motor1_serie", e.target.value)} className="rounded-sm mt-1" /></div>
                <div><Label className="text-xs text-muted-foreground">Potencia</Label><Input value={form.motor1_potencia} onChange={e => u("motor1_potencia", e.target.value)} className="rounded-sm mt-1" /></div>
              </div>
            </div>
            <div>
              <div className="form-section-title">Motor 2</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div><Label className="text-xs text-muted-foreground">Marca</Label><UpperInput value={form.motor2_marca} onChange={e => u("motor2_marca", e.target.value)} className="rounded-sm mt-1" /></div>
                <div><Label className="text-xs text-muted-foreground">N. Serie</Label><Input value={form.motor2_serie} onChange={e => u("motor2_serie", e.target.value)} className="rounded-sm mt-1" /></div>
                <div><Label className="text-xs text-muted-foreground">Potencia</Label><Input value={form.motor2_potencia} onChange={e => u("motor2_potencia", e.target.value)} className="rounded-sm mt-1" /></div>
              </div>
            </div>
            <div>
              <div className="form-section-title">Radio Operador</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div><Label className="text-xs text-muted-foreground">Nome</Label><UpperInput value={form.radio_op_nome} onChange={e => u("radio_op_nome", e.target.value)} className="rounded-sm mt-1" /></div>
                <div><Label className="text-xs text-muted-foreground">N. Radio Op.</Label><Input value={form.radio_op_num} onChange={e => u("radio_op_num", e.target.value)} className="rounded-sm mt-1" /></div>
                <div><Label className="text-xs text-muted-foreground">Categoria</Label><UpperInput value={form.radio_op_categoria} onChange={e => u("radio_op_categoria", e.target.value)} className="rounded-sm mt-1" /></div>
                <div><Label className="text-xs text-muted-foreground">Validade</Label><DateInput value={form.radio_op_validade} onChange={e => u("radio_op_validade", e.target.value)} className="rounded-sm mt-1" /></div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "documentos" && (
          <div>
            <div className="form-section-title">Documentos</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(isRecreio ? DOC_FIELDS_RECREIO : DOC_FIELDS).map(f => {
                const labels = isRecreio ? DOC_LABELS_RECREIO : DOC_LABELS;
                const hideValidade = !isRecreio && f === "diario_pesca";
                return (
                  <div key={f} className="flex items-center gap-2 p-2 bg-slate-50 rounded-sm border border-slate-100">
                    <Checkbox checked={form.documentos[f]?.presente || false} onCheckedChange={v => uDoc(f, "presente", v)} />
                    <div className="flex-1">
                      <Label className="text-xs font-semibold">{labels[f]}</Label>
                      {!hideValidade && (
                        <DateInput value={form.documentos[f]?.validade || ""} onChange={e => uDoc(f, "validade", e.target.value)} className="rounded-sm mt-1 h-7 text-xs" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "palamenta" && (
          <div className="space-y-5">
            {/* Equipamentos com validade obrigatoria */}
            <div>
              <div className="form-section-title">Equipamentos com Validade</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {MEIOS_COM_VALIDADE.map(f => (
                  <div key={f} className="p-3 bg-slate-50 rounded-sm border border-slate-100 space-y-2">
                    <div className="flex items-center gap-2">
                      <Checkbox checked={form.meios_salvacao[f]?.presente || false} onCheckedChange={v => uMeio(f, { ...(form.meios_salvacao[f] || {}), presente: v })} />
                      <Label className="text-xs font-semibold">{MEIOS_LABELS[f]}</Label>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs text-muted-foreground">Estado</Label>
                        <Select value={form.meios_salvacao[f]?.estado || ""} onValueChange={v => uMeio(f, { ...(form.meios_salvacao[f] || {}), estado: v })}>
                          <SelectTrigger className="h-7 text-xs rounded-sm"><SelectValue placeholder="--" /></SelectTrigger>
                          <SelectContent><SelectItem value="OK">OK</SelectItem><SelectItem value="NAO_OK">Nao OK</SelectItem><SelectItem value="EM_FALTA">Em falta</SelectItem></SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Validade</Label>
                        <DateInput value={form.meios_salvacao[f]?.validade || ""} onChange={e => uMeio(f, { ...(form.meios_salvacao[f] || {}), validade: e.target.value })} className="rounded-sm h-7 text-xs" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Restantes equipamentos (checkbox simples) */}
            <div>
              <div className="form-section-title">Outros Meios de Salvacao e Equipamentos</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {MEIOS_FIELDS.filter(f => !MEIOS_COM_VALIDADE.includes(f)).map(f => (
                  <div key={f} className="flex items-center gap-2 p-2 bg-slate-50 rounded-sm border border-slate-100">
                    <Checkbox checked={form.meios_salvacao[f] || false} onCheckedChange={v => uMeio(f, v)} />
                    <Label className="text-xs">{MEIOS_LABELS[f]}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "atividade" && (
          <div className="space-y-5">
            <div>
              <div className="form-section-title">Licenca</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div><Label className="text-xs text-muted-foreground">Licenca N.</Label><Input value={form.licenca_num} onChange={e => u("licenca_num", e.target.value)} className="rounded-sm mt-1" data-testid="campo-licenca-num" /></div>
                <div><Label className="text-xs text-muted-foreground">Validade</Label><DateInput value={form.licenca_validade} onChange={e => u("licenca_validade", e.target.value)} className="rounded-sm mt-1" /></div>
                <div><Label className="text-xs text-muted-foreground">Tipo</Label><UpperInput value={form.licenca_tipo} onChange={e => u("licenca_tipo", e.target.value)} className="rounded-sm mt-1" /></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <div className="form-section-title mb-0 pb-0 border-0">Especies Capturadas</div>
                <Button variant="outline" size="sm" onClick={() => setForm(prev => ({ ...prev, especies: [...prev.especies, { nome: "", peso_kg: "" }] }))} className="rounded-sm text-xs"><Plus className="h-3 w-3 mr-1" /> Adicionar</Button>
              </div>
              <div className="space-y-2 mt-2">
                {(form.especies || []).map((esp, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <UpperInput value={esp.nome} onChange={e => { const s = [...form.especies]; s[i] = { ...s[i], nome: e.target.value }; u("especies", s); }} className="rounded-sm text-xs flex-1" placeholder="NOME ESPECIE" />
                    <Input value={esp.peso_kg} onChange={e => { const s = [...form.especies]; s[i] = { ...s[i], peso_kg: e.target.value }; u("especies", s); }} className="rounded-sm text-xs w-24" placeholder="KG" type="number" />
                    {form.especies.length > 1 && <button onClick={() => u("especies", form.especies.filter((_, j) => j !== i))} className="p-1 hover:bg-red-50 rounded-sm"><Trash2 className="h-3 w-3 text-red-500" /></button>}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <div className="form-section-title mb-0 pb-0 border-0">Artes Utilizadas</div>
                <Button variant="outline" size="sm" onClick={() => setForm(prev => ({ ...prev, artes: [...prev.artes, { nome: "" }] }))} className="rounded-sm text-xs"><Plus className="h-3 w-3 mr-1" /> Adicionar</Button>
              </div>
              <div className="space-y-2 mt-2">
                {(form.artes || []).map((art, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <UpperInput value={art.nome} onChange={e => { const s = [...form.artes]; s[i] = { ...s[i], nome: e.target.value }; u("artes", s); }} className="rounded-sm text-xs flex-1" placeholder="ARTE UTILIZADA" />
                    {form.artes.length > 1 && <button onClick={() => u("artes", form.artes.filter((_, j) => j !== i))} className="p-1 hover:bg-red-50 rounded-sm"><Trash2 className="h-3 w-3 text-red-500" /></button>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "observacoes" && (
          <div>
            <div className="form-section-title">Observacoes</div>
            <Textarea value={form.observacoes} onChange={e => u("observacoes", e.target.value.toUpperCase())} className="rounded-sm min-h-[200px] uppercase" placeholder="OBSERVACOES..." style={{ textTransform: "uppercase" }} data-testid="campo-observacoes" />
          </div>
        )}

        {activeTab === "apoio" && (
          <div>
            <div className="form-section-title">Checklist Auxiliar - Dotacao Minima por Zona de Navegacao</div>
            <div className="overflow-x-auto">
              <table className="service-table w-full text-xs">
                <thead><tr><th>Equipamento</th><th>Zona 1</th><th>Zona 2</th><th>Zona 3</th><th>Zona 4</th><th>Zona 5</th></tr></thead>
                <tbody>
                  {[["Coletes (1 por pessoa)","Sim","Sim","Sim","Sim","Sim"],["Boia circular c/ retenida","1","1","1","-","-"],["Extintor","1","1","1","1","-"],["Foguetes paraq.","6","4","2","-","-"],["Fachos mao","6","4","2","-","-"],["Sinais fumig.","2","2","1","-","-"],["Espelho sinalizacao","1","1","1","-","-"],["Jangada/Balsa","Sim","Sim","-","-","-"],["Agulha magnetica","Sim","Sim","-","-","-"],["Luzes navegacao","Sim","Sim","Sim","Sim","Sim"],["Apito/Buzina","Sim","Sim","Sim","Sim","Sim"],["Bussola","-","-","Sim","Sim","-"],["Lanterna estanque","Sim","Sim","Sim","-","-"],["1.os socorros","Sim","Sim","Sim","-","-"]].map((row, i) => (
                    <tr key={i}><td className="font-semibold">{row[0]}</td>{row.slice(1).map((c, j) => <td key={j} className="text-center">{c}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between py-4 border-t border-slate-200">
        <Button variant="outline" onClick={() => isEditing ? navigate("/fiscalizacao/mapa") : setStep("select")} className="rounded-sm" data-testid="cancel-btn">Cancelar</Button>
        <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm text-xs font-semibold uppercase tracking-wide" data-testid="save-btn">
          <Save className="h-4 w-4 mr-1.5" strokeWidth={1.5} />{saving ? "A gravar..." : isEditing ? "Atualizar" : "Gravar"}
        </Button>
      </div>
    </div>
  );
}
