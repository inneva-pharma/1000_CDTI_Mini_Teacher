import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export function TopBar() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    await signOut();
    toast({ description: "Sesión cerrada" });
    navigate("/login");
  };

  const initials = profile
    ? ((profile.name?.[0] ?? "") + (profile.lastname?.[0] ?? profile.nick?.[0] ?? "")).toUpperCase() || "U"
    : "U";

  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {initials}
          </div>
          <span className="hidden text-sm font-medium sm:block">{profile?.nick ?? "Usuario"}</span>
        </div>
        <Button variant="ghost" size="icon" onClick={handleLogout} title="Cerrar sesión">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
