import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ship, Shield, FileText, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MESES = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentes, setRecentes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.getDashboardStats().then(setStats).catch(console.error);
    api.listServicos({}).then(data => setRecentes(data.slice(0, 8))).catch(console.error);
  }, []);

  const statCards = [
    {
      title: "Total de Servicos",
      value: stats?.total || 0,
      icon: FileText,
      color: "text-primary",
      bg: "bg-blue-50",
    },
    {
      title: "Policiamento a Navios",
      value: stats?.navios || 0,
      icon: Ship,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Servicos de Policia",
      value: stats?.policiamentos || 0,
      icon: Shield,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      title: "Postos Activos",
      value: stats?.por_posto ? Object.keys(stats.por_posto).length : 0,
      icon: MapPin,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
  ];

  const maxMonthly = stats?.mensal ? Math.max(...stats.mensal.map(m => m.count), 1) : 1;

  return (
    <div data-testid="dashboard-page" className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight uppercase" style={{ fontFamily: "Barlow, sans-serif", color: "#002D72" }}>
          Painel de Controlo
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Comando Local da Horta - Mapa de Servicos Prestados
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="stats-cards">
        {statCards.map((card) => (
          <div key={card.title} className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" style={{ fontFamily: "Barlow, sans-serif" }}>
                  {card.title}
                </p>
                <p className="text-3xl font-bold mt-2" style={{ color: "#002D72" }}>
                  {card.value}
                </p>
              </div>
              <div className={`${card.bg} p-3 rounded-sm`}>
                <card.icon className={`h-5 w-5 ${card.color}`} strokeWidth={1.5} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Chart */}
        <Card className="lg:col-span-2 rounded-sm shadow-sm">
          <CardHeader className="bg-slate-50/50 border-b pb-4">
            <CardTitle className="text-sm font-bold uppercase tracking-wider" style={{ fontFamily: "Barlow, sans-serif", color: "#002D72" }}>
              Servicos por Mes ({new Date().getFullYear()})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-end gap-2 h-40" data-testid="monthly-chart">
              {stats?.mensal?.map((m, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-semibold" style={{ color: "#002D72" }}>
                    {m.count > 0 ? m.count : ""}
                  </span>
                  <div
                    className="w-full rounded-t-sm transition-all duration-500"
                    style={{
                      height: `${Math.max((m.count / maxMonthly) * 120, 4)}px`,
                      backgroundColor: m.count > 0 ? "#002D72" : "#E2E8F0",
                    }}
                  />
                  <span className="text-xs text-muted-foreground font-medium" style={{ fontFamily: "Barlow, sans-serif" }}>
                    {MESES[idx]}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* By Post */}
        <Card className="rounded-sm shadow-sm">
          <CardHeader className="bg-slate-50/50 border-b pb-4">
            <CardTitle className="text-sm font-bold uppercase tracking-wider" style={{ fontFamily: "Barlow, sans-serif", color: "#002D72" }}>
              Por Comando / Posto
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {stats?.por_posto && Object.keys(stats.por_posto).length > 0 ? (
              <div className="space-y-3" data-testid="postos-list">
                {Object.entries(stats.por_posto).map(([posto, count]) => (
                  <div key={posto} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-sm border border-slate-100">
                    <span className="text-sm font-bold tracking-wide" style={{ fontFamily: "Barlow, sans-serif", color: "#002D72" }}>
                      {posto}
                    </span>
                    <span className="text-sm font-semibold text-slate-600">{count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">Sem dados disponíveis</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Services */}
      <Card className="rounded-sm shadow-sm">
        <CardHeader className="bg-slate-50/50 border-b pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold uppercase tracking-wider" style={{ fontFamily: "Barlow, sans-serif", color: "#002D72" }}>
              Servicos Recentes
            </CardTitle>
            <button
              onClick={() => navigate("/servicos")}
              className="text-xs font-semibold uppercase tracking-wider hover:underline"
              style={{ color: "#002D72" }}
              data-testid="view-all-services-btn"
            >
              Ver todos
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="service-table w-full" data-testid="recent-services-table">
              <thead>
                <tr>
                  <th>N. Controlo</th>
                  <th>Tipo</th>
                  <th>Posto</th>
                  <th>Data</th>
                  <th>Utente</th>
                  <th>Atividade</th>
                </tr>
              </thead>
              <tbody>
                {recentes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhum servico registado
                    </td>
                  </tr>
                ) : (
                  recentes.map((s) => (
                    <tr
                      key={s.id}
                      className="cursor-pointer"
                      onClick={() => navigate(`/${s.tipo_formulario}/editar/${s.id}`)}
                      data-testid={`service-row-${s.numero_servico}`}
                    >
                      <td className="font-mono font-bold whitespace-nowrap">{s.numero_controlo}</td>
                      <td>
                        <span className={s.tipo_formulario === "navios" ? "badge-navios" : "badge-policiamentos"}>
                          {s.tipo_formulario === "navios" ? "Navios" : "Policia"}
                        </span>
                      </td>
                      <td className="font-semibold">{s.comando_posto}</td>
                      <td>{s.data}</td>
                      <td>{s.utente}</td>
                      <td className="text-slate-500">{s.atividade}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
