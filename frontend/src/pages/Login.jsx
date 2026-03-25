import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Anchor, LogIn } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const { user, login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) { toast.error("Preencha todos os campos"); return; }
    setLoading(true);
    try {
      await login(username, password);
      toast.success("Sessao iniciada com sucesso");
      navigate("/");
    } catch {
      toast.error("Credenciais invalidas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#002D72" }} data-testid="login-page">
      <div className="w-full max-w-sm mx-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 mb-4">
            <Anchor className="h-8 w-8 text-white" strokeWidth={1.5} />
          </div>
          <h1 className="text-white font-bold text-lg tracking-widest" style={{ fontFamily: "Barlow, sans-serif" }}>POLICIA MARITIMA</h1>
          <p className="text-white/50 text-xs mt-1 tracking-wider">CAPITANIA DO PORTO DA HORTA</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-sm p-6 shadow-xl space-y-4">
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Utilizador</Label>
            <Input value={username} onChange={e => setUsername(e.target.value.toUpperCase())} className="rounded-sm mt-1.5 uppercase" placeholder="HORTA / PICO / VELAS / ADMIN" style={{ textTransform: "uppercase" }} data-testid="login-username" autoFocus />
          </div>
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Palavra-passe</Label>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} className="rounded-sm mt-1.5" placeholder="Palavra-passe" data-testid="login-password" />
          </div>
          <Button type="submit" disabled={loading} className="w-full rounded-sm font-semibold uppercase tracking-wider text-xs" style={{ backgroundColor: "#002D72" }} data-testid="login-submit-btn">
            <LogIn className="h-4 w-4 mr-2" strokeWidth={1.5} />
            {loading ? "A entrar..." : "Entrar"}
          </Button>
        </form>

        <p className="text-white/30 text-xs text-center mt-6">Portaria 506/2018 | v2.0</p>
      </div>
    </div>
  );
}
