import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, NavLink, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { Anchor, LayoutDashboard, Table2, Ship, Shield, Menu, X, FileBarChart } from "lucide-react";
import { useState } from "react";
import Dashboard from "@/pages/Dashboard";
import ServicosTable from "@/pages/ServicosTable";
import NaviosForm from "@/pages/NaviosForm";
import PoliciamentosForm from "@/pages/PoliciamentosForm";
import Relatorio from "@/pages/Relatorio";

const navItems = [
  { path: "/", label: "Painel", icon: LayoutDashboard },
  { path: "/servicos", label: "Servicos", icon: Table2 },
  { path: "/navios/novo", label: "Navios", icon: Ship },
  { path: "/policiamentos/novo", label: "Policiamentos", icon: Shield },
  { path: "/relatorio", label: "Relatorio", icon: FileBarChart },
];

function Sidebar({ mobileOpen, setMobileOpen }) {
  const location = useLocation();
  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path.replace("/novo", ""));
  };

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
      )}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-60 flex flex-col transition-transform duration-300 md:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ backgroundColor: "#002D72" }}
        data-testid="sidebar"
      >
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <Anchor className="h-7 w-7 text-white" strokeWidth={1.5} />
          <div>
            <div className="text-white font-bold text-sm tracking-wide" style={{ fontFamily: "Barlow, sans-serif" }}>
              POLICIA MARITIMA
            </div>
            <div className="text-white/60 text-xs tracking-wide">Comando Local da Horta</div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`sidebar-link ${isActive(item.path) ? "active bg-white/15 text-white" : "text-white/70"}`}
              data-testid={`nav-${item.path.replace(/\//g, "-").replace(/^-/, "")}`}
            >
              <item.icon className="h-4 w-4" strokeWidth={1.5} />
              <span className="tracking-wide">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-5 py-4 border-t border-white/10">
          <p className="text-white/40 text-xs">Portaria 506/2018</p>
          <p className="text-white/30 text-xs mt-0.5">v1.1</p>
        </div>
      </aside>
    </>
  );
}

function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="md:ml-60">
        <header className="sticky top-0 z-30 h-14 flex items-center px-4 md:px-8 bg-white/80 backdrop-blur-md border-b border-slate-200 md:hidden">
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-sm hover:bg-slate-100" data-testid="mobile-menu-btn">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <span className="ml-3 font-bold text-sm tracking-wide" style={{ fontFamily: "Barlow, sans-serif", color: "#002D72" }}>
            POLICIA MARITIMA
          </span>
        </header>
        <main className="p-4 md:p-8 lg:p-10">{children}</main>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/servicos" element={<ServicosTable />} />
          <Route path="/navios/novo" element={<NaviosForm />} />
          <Route path="/navios/editar/:id" element={<NaviosForm />} />
          <Route path="/policiamentos/novo" element={<PoliciamentosForm />} />
          <Route path="/policiamentos/editar/:id" element={<PoliciamentosForm />} />
          <Route path="/relatorio" element={<Relatorio />} />
        </Routes>
      </Layout>
      <Toaster position="top-right" />
    </BrowserRouter>
  );
}

export default App;
