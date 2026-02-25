import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Rocket } from "lucide-react";

export default function Login() {
  const { signIn, session, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);

  if (authLoading) return null;
  if (session) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: "Email o contraseña incorrectos",
        variant: "destructive",
      });
    } else {
      toast({ description: "Sesión iniciada correctamente" });
    }
  };

  return (
    <div className="login-bg flex min-h-screen items-center justify-center p-4">
      {/* Left side — branding area */}
      <div className="hidden flex-1 flex-col items-center justify-center lg:flex">
        <div className="relative">
          {/* Robot mascot placeholder — large circle with icon */}
          <div className="flex h-72 w-72 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-40 w-40 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
                <svg viewBox="0 0 100 100" className="h-28 w-28 text-white/80" fill="currentColor">
                  <circle cx="50" cy="35" r="25" opacity="0.9"/>
                  <rect x="30" y="55" width="40" height="30" rx="8" opacity="0.9"/>
                  <circle cx="40" cy="32" r="5" fill="hsl(185, 90%, 55%)"/>
                  <circle cx="60" cy="32" r="5" fill="hsl(185, 90%, 55%)"/>
                  <rect x="45" y="12" width="10" height="8" rx="3" opacity="0.7"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-white">
          mini teacher
        </h1>
        <div className="mt-1 flex items-center gap-1">
          <span className="text-xs text-white/60">Powered by AI</span>
          <span className="inline-block h-2 w-2 rounded-full bg-cta" />
        </div>
      </div>

      {/* Right side — login card */}
      <div className="w-full max-w-md">
        <div className="rounded-3xl bg-card p-8 shadow-2xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mb-2 flex items-center justify-center gap-1">
              <h2 className="text-3xl font-bold text-primary">¡Hola!</h2>
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-cta">
                <span className="text-lg font-bold text-cta">M</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Ingresa a tu cuenta para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 rounded-full border-border bg-muted/50 px-5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 rounded-full border-border bg-muted/50 px-5"
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={remember}
                onCheckedChange={(v) => setRemember(v === true)}
                className="rounded-full"
              />
              <Label htmlFor="remember" className="cursor-pointer text-sm text-muted-foreground">
                Recordar acceso
              </Label>
            </div>

            <div className="text-right">
              <Link to="/forgot-password" className="text-sm font-semibold text-primary hover:underline">
                ¿Contraseña olvidada?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-full bg-cta text-lg font-semibold text-cta-foreground shadow-lg hover:bg-cta/90"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Rocket className="mr-2 h-5 w-5" />
                  Entrar
                </>
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              ¿No tienes cuenta?{" "}
              <span className="cursor-pointer font-bold text-primary hover:underline">
                ¡Regístrate ahora!
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
