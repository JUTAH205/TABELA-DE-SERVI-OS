import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, NavLink, useLocation, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { Anchor, LayoutDashboard, Table2, Ship, Shield, Menu, X, FileBarChart, Search as SearchIcon, ClipboardList, PlusCircle, ChevronDown, LogOut, User } from "lucide-react";
import { useState } from "react";
import { AuthProvider, useAuth } from "@/lib/auth";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import ServicosTable from "@/pages/ServicosTable";
import NaviosForm from "@/pages/NaviosForm";
import PoliciamentosForm from "@/pages/PoliciamentosForm";
import Relatorio from "@/pages/Relatorio";
import FiscalizacaoNovo from "@/pages/FiscalizacaoNovo";
import FiscalizacaoMapa from "@/pages/FiscalizacaoMapa";
import FiscalizacaoConsulta from "@/pages/FiscalizacaoConsulta";

function NavGroup({ label, icon: Icon, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button onClick={() => setOpen(!open)} className="sidebar-link text-white/70 w-full justify-between" data-testid={`nav-group-${label.toLowerCase()}`}>
        <span className="flex items-center gap-3">
          <Icon className="h-4 w-4" strokeWidth={1.5} />
          <span className="tracking-wide text-sm font-medium">{label}</span>
        </span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="ml-7 space-y-0.5 mt-0.5">{children}</div>}
    </div>
  );
}

function Sidebar({ mobileOpen, setMobileOpen }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <>
      {mobileOpen && <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setMobileOpen(false)} />}
      <aside className={`fixed top-0 left-0 z-50 h-full w-64 flex flex-col transition-transform duration-300 md:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`} style={{ backgroundColor: "#002D72" }} data-testid="sidebar">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
          <Anchor className="h-6 w-6 text-white" strokeWidth={1.5} />
          <div>
            <div className="text-white font-bold text-xs tracking-widest" style={{ fontFamily: "Barlow, sans-serif" }}>POLICIA MARITIMA</div>
            <div className="text-white/50 text-xs">{user?.nome || "Capitania da Horta"}</div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          <NavLink to="/" onClick={() => setMobileOpen(false)} className={`sidebar-link ${isActive("/") && location.pathname === "/" ? "active bg-white/15 text-white" : "text-white/70"}`} data-testid="nav-painel">
            <LayoutDashboard className="h-4 w-4" strokeWidth={1.5} /><span className="tracking-wide text-sm">Painel</span>
          </NavLink>

          <NavGroup label="Servicos" icon={ClipboardList} defaultOpen={location.pathname.includes("servico") || location.pathname.includes("navio") || location.pathname.includes("policiamento") || location.pathname.includes("relatorio")}>
            <NavLink to="/servicos/navios/novo" onClick={() => setMobileOpen(false)} className={`sidebar-link text-xs py-1.5 ${isActive("/servicos/navios") ? "active bg-white/15 text-white" : "text-white/60"}`} data-testid="nav-navios">
              <Ship className="h-3.5 w-3.5" strokeWidth={1.5} /><span>Navios</span>
            </NavLink>
            <NavLink to="/servicos/policiamentos/novo" onClick={() => setMobileOpen(false)} className={`sidebar-link text-xs py-1.5 ${isActive("/servicos/policiamentos") ? "active bg-white/15 text-white" : "text-white/60"}`} data-testid="nav-policiamentos">
              <Shield className="h-3.5 w-3.5" strokeWidth={1.5} /><span>Policiamentos</span>
            </NavLink>
            <NavLink to="/servicos/mapa" onClick={() => setMobileOpen(false)} className={`sidebar-link text-xs py-1.5 ${isActive("/servicos/mapa") ? "active bg-white/15 text-white" : "text-white/60"}`} data-testid="nav-mapa-servicos">
              <Table2 className="h-3.5 w-3.5" strokeWidth={1.5} /><span>Mapa de Servicos</span>
            </NavLink>
            <NavLink to="/servicos/relatorio" onClick={() => setMobileOpen(false)} className={`sidebar-link text-xs py-1.5 ${isActive("/servicos/relatorio") ? "active bg-white/15 text-white" : "text-white/60"}`} data-testid="nav-relatorio">
              <FileBarChart className="h-3.5 w-3.5" strokeWidth={1.5} /><span>Relatorios</span>
            </NavLink>
          </NavGroup>

          <NavGroup label="Fiscalizacao" icon={SearchIcon} defaultOpen={location.pathname.includes("fiscalizacao")}>
            <NavLink to="/fiscalizacao/novo" onClick={() => setMobileOpen(false)} className={`sidebar-link text-xs py-1.5 ${isActive("/fiscalizacao/novo") ? "active bg-white/15 text-white" : "text-white/60"}`} data-testid="nav-fisc-novo">
              <PlusCircle className="h-3.5 w-3.5" strokeWidth={1.5} /><span>Novo Registo</span>
            </NavLink>
            <NavLink to="/fiscalizacao/mapa" onClick={() => setMobileOpen(false)} className={`sidebar-link text-xs py-1.5 ${isActive("/fiscalizacao/mapa") ? "active bg-white/15 text-white" : "text-white/60"}`} data-testid="nav-fisc-mapa">
              <Table2 className="h-3.5 w-3.5" strokeWidth={1.5} /><span>Mapa de Fiscalizacoes</span>
            </NavLink>
            <NavLink to="/fiscalizacao/consulta" onClick={() => setMobileOpen(false)} className={`sidebar-link text-xs py-1.5 ${isActive("/fiscalizacao/consulta") ? "active bg-white/15 text-white" : "text-white/60"}`} data-testid="nav-fisc-consulta">
              <SearchIcon className="h-3.5 w-3.5" strokeWidth={1.5} /><span>Consulta</span>
            </NavLink>
          </NavGroup>
        </nav>

        <div className="px-3 py-3 border-t border-white/10 space-y-2">
          <div className="flex items-center gap-2 px-3 py-2">
            <User className="h-4 w-4 text-white/50" strokeWidth={1.5} />
            <div className="flex-1 min-w-0">
              <p className="text-white/80 text-xs font-semibold truncate">{user?.username}</p>
              <p className="text-white/40 text-xs">{user?.role === "admin" ? "Administrador" : user?.unidade}</p>
            </div>
          </div>
          <button onClick={logout} className="sidebar-link text-white/50 hover:text-white w-full text-xs" data-testid="logout-btn">
            <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} /><span>Terminar Sessao</span>
          </button>
        </div>
      </aside>
    </>
  );
}

function ProtectedLayout({ children }) {
  const { user, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) return <div className="h-screen flex items-center justify-center text-muted-foreground">A carregar...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="md:ml-64">
        <header className="sticky top-0 z-30 h-12 flex items-center px-4 bg-white/80 backdrop-blur-md border-b border-slate-200 md:hidden">
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-sm hover:bg-slate-100" data-testid="mobile-menu-btn">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <span className="ml-3 font-bold text-xs tracking-widest" style={{ fontFamily: "Barlow, sans-serif", color: "#002D72" }}>POLICIA MARITIMA</span>
        </header>
        <main className="p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={
            <ProtectedLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/servicos/mapa" element={<ServicosTable />} />
                <Route path="/servicos/navios/novo" element={<NaviosForm />} />
                <Route path="/servicos/navios/editar/:id" element={<NaviosForm />} />
                <Route path="/servicos/policiamentos/novo" element={<PoliciamentosForm />} />
                <Route path="/servicos/policiamentos/editar/:id" element={<PoliciamentosForm />} />
                <Route path="/servicos/relatorio" element={<Relatorio />} />
                <Route path="/fiscalizacao/novo" element={<FiscalizacaoNovo />} />
                <Route path="/fiscalizacao/novo/:tipo" element={<FiscalizacaoNovo />} />
                <Route path="/fiscalizacao/editar/:id" element={<FiscalizacaoNovo />} />
                <Route path="/fiscalizacao/mapa" element={<FiscalizacaoMapa />} />
                <Route path="/fiscalizacao/consulta" element={<FiscalizacaoConsulta />} />
              </Routes>
            </ProtectedLayout>
          } />
        </Routes>
        <Toaster position="top-right" />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
