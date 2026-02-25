import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, X } from "lucide-react";

export default function ForgotPassword() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setSent(true);
    }
  };

  return (
    <div className="login-bg flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="relative rounded-3xl bg-card p-8 shadow-2xl">
          <Link to="/login" className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:bg-muted">
            <X className="h-5 w-5" />
          </Link>

          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-primary">Recuperar contraseña</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Ingresa tu correo y te enviaremos un email con los pasos a seguir.
            </p>
          </div>

          {sent ? (
            <div className="space-y-4 text-center">
              <p className="text-muted-foreground">
                Revisa tu email, te hemos enviado el enlace de recuperación.
              </p>
              <Link to="/login">
                <Button className="h-12 w-full rounded-full bg-cta font-semibold text-cta-foreground hover:bg-cta/90">
                  Volver al inicio de sesión
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 rounded-full border-border bg-muted/50 px-5"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="h-12 w-full rounded-full bg-cta font-semibold text-cta-foreground hover:bg-cta/90"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Recuperar"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
