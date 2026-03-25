import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ship, Shield, FileText, MapPin, ClipboardCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";

const MESES = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentes, setRecentes] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.getDashboardStats().then(setStats).catch(console.error);
    api.listServicos({}).then(data => setRecentes(data.slice(0, 6))).catch(console.error);
  }, []);

  const statCards = [
    { title: "Total Servicos", value: stats?.total || 0, icon: FileText, color: "text-blue-700", bg: "bg-blue-50" },
    { title: "Navios", value: stats?.navios || 0, icon: Ship, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Policiamentos", value: stats?.policiamentos || 0, icon: Shield, color: "text-red-600", bg: "bg-red-50" },
    { title: "Fiscalizacoes", value: stats?.fiscalizacoes || 0, icon: ClipboardCheck, color: "text-amber-600", bg: "bg-amber-50" },
    { title: "Postos", value: stats?.por_posto ? Object.keys(stats.por_posto).length : 0, icon: MapPin, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  const maxM = stats?.mensal ? Math.max(...stats.mensal.map(m => m.count), 1) : 1;

  return (
    <div data-testid="dashboard-page" className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight uppercase" style={{ fontFamily: "Barlow, sans-serif", color: "#002D72" }}>Painel de Controlo</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {user?.role === "admin" ? "Visao Global - Administrador" : `${user?.nome} (${user?.unidade})`}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3" data-testid="stats-cards">
        {statCards.map(c => (
          <div key={c.title} className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" style={{ fontFamily: "Barlow, sans-serif" }}>{c.title}</p>
                <p className="text-2xl font-bold mt-1" style={{ color: "#002D72" }}>{c.value}</p>
              </div>
              <div className={`${c.bg} p-2 rounded-sm`}><c.icon className={`h-4 w-4 ${c.color}`} strokeWidth={1.5} /></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 rounded-sm shadow-sm">
          <CardHeader className="bg-slate-50/50 border-b pb-3"><CardTitle className="text-xs font-bold uppercase tracking-wider" style={{ fontFamily: "Barlow, sans-serif", color: "#002D72" }}>Servicos por Mes ({new Date().getFullYear()})</CardTitle></CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-end gap-1.5 h-32" data-testid="monthly-chart">
              {stats?.mensal?.map((m, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                  <span className="text-xs font-bold" style={{ color: "#002D72" }}>{m.count > 0 ? m.count : ""}</span>
                  <div className="w-full rounded-t-sm" style={{ height: `${Math.max((m.count / maxM) * 100, 3)}px`, backgroundColor: m.count > 0 ? "#002D72" : "#E2E8F0" }} />
                  <span className="text-xs text-muted-foreground" style={{ fontFamily: "Barlow, sans-serif", fontSize: "0.6rem" }}>{MESES[i]}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-sm shadow-sm">
          <CardHeader className="bg-slate-50/50 border-b pb-3"><CardTitle className="text-xs font-bold uppercase tracking-wider" style={{ fontFamily: "Barlow, sans-serif", color: "#002D72" }}>Por Posto</CardTitle></CardHeader>
          <CardContent className="pt-4">
            {stats?.por_posto && Object.keys(stats.por_posto).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(stats.por_posto).map(([p, c]) => (
                  <div key={p} className="flex items-center justify-between p-2 bg-slate-50 rounded-sm border border-slate-100">
                    <span className="text-sm font-bold" style={{ fontFamily: "Barlow, sans-serif", color: "#002D72" }}>{p}</span>
                    <span className="text-sm font-semibold text-slate-600">{c}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground text-center py-4">Sem dados</p>}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-sm shadow-sm">
        <CardHeader className="bg-slate-50/50 border-b pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-bold uppercase tracking-wider" style={{ fontFamily: "Barlow, sans-serif", color: "#002D72" }}>Servicos Recentes</CardTitle>
            <button onClick={() => navigate("/servicos/mapa")} className="text-xs font-semibold uppercase tracking-wider hover:underline" style={{ color: "#002D72" }} data-testid="view-all-btn">Ver todos</button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="service-table w-full">
              <thead><tr><th>N. Controlo</th><th>Tipo</th><th>Posto</th><th>Data</th><th>Utente</th><th>Atividade</th></tr></thead>
              <tbody>
                {recentes.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-6 text-muted-foreground">Sem servicos</td></tr>
                ) : recentes.map(s => (
                  <tr key={s.id} className="cursor-pointer" onClick={() => navigate(`/servicos/${s.tipo_formulario === "navios" ? "navios" : "policiamentos"}/editar/${s.id}`)}>
                    <td className="font-mono font-bold">{s.numero_controlo}</td>
                    <td><span className={s.tipo_formulario === "navios" ? "badge-navios" : "badge-policiamentos"}>{s.tipo_formulario === "navios" ? "Navios" : "Policia"}</span></td>
                    <td className="font-semibold">{s.comando_posto}</td>
                    <td>{s.data}</td>
                    <td className="uppercase">{s.utente}</td>
                    <td className="text-slate-500 uppercase">{s.atividade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
