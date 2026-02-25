import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { CreateChallengeDialog } from "@/components/challenges/CreateChallengeDialog";
import { ChallengeCard } from "@/components/challenges/ChallengeCard";

export default function Challenges() {
  const { user } = useAuth();
  const [createOpen, setCreateOpen] = useState(false);

  const { data: myChallenges = [], refetch } = useQuery({
    queryKey: ["my-challenges", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("challenges")
        .select("*")
        .eq("user_id", user.id)
        .eq("isDeleted", false)
        .order("createDate", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });

  return (
    <div className="space-y-5">
      {/* Header row — back arrow left, buttons right */}
      <div className="flex items-center justify-between">
        <Link to="/dashboard">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
      </div>

      {/* Hero banner with buttons overlaid */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary/80 to-secondary shadow-lg">
        {/* Decorative confetti-like dots */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute left-[10%] top-[20%] h-2 w-2 rounded-full bg-cta" />
          <div className="absolute left-[25%] top-[60%] h-1.5 w-1.5 rounded-full bg-primary-foreground" />
          <div className="absolute left-[50%] top-[15%] h-2.5 w-2.5 rounded-full bg-cta" />
          <div className="absolute left-[70%] top-[70%] h-1 w-1 rounded-full bg-primary-foreground" />
          <div className="absolute left-[85%] top-[30%] h-2 w-2 rounded-full bg-cta" />
        </div>

        <div className="relative flex min-h-[180px] items-center justify-between px-8 py-6 md:min-h-[220px]">
          {/* Robot mascot area */}
          <div className="hidden flex-1 items-center justify-center md:flex">
            <svg viewBox="0 0 100 100" className="h-32 w-32 text-primary-foreground/30" fill="currentColor">
              <circle cx="50" cy="35" r="25" />
              <rect x="30" y="55" width="40" height="30" rx="8" />
              <circle cx="40" cy="32" r="5" fill="hsl(185, 90%, 55%)" />
              <circle cx="60" cy="32" r="5" fill="hsl(185, 90%, 55%)" />
              <text x="50" y="20" textAnchor="middle" fontSize="18" fill="hsl(var(--cta))">?</text>
            </svg>
          </div>

          {/* Buttons stacked on right */}
          <div className="ml-auto flex flex-col gap-3">
            <Button
              onClick={() => setCreateOpen(true)}
              className="gap-2 rounded-full bg-cta px-8 py-3 text-base font-bold text-cta-foreground shadow-md transition-transform hover:scale-105 hover:bg-cta/90"
            >
              Nuevo reto
            </Button>
            <Button
              variant="outline"
              className="gap-2 rounded-full border-primary-foreground/30 bg-primary-foreground/10 px-8 py-3 text-base font-semibold text-primary-foreground backdrop-blur-sm transition-transform hover:scale-105 hover:bg-primary-foreground/20"
            >
              <Search className="h-4 w-4" />
              Buscar reto
            </Button>
          </div>
        </div>
      </div>

      {/* Middle row: Teacher challenges + Introduce ID side by side */}
      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        {/* Teacher challenges */}
        <Card className="border-border bg-card shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg text-foreground">
                Retos de tu <span className="font-bold">profesor</span>
              </h2>
              <Button variant="default" size="sm" className="rounded-full px-5 text-xs font-semibold">
                Ver todos
              </Button>
            </div>
            <div className="mt-8 flex min-h-[80px] items-center justify-center">
              <p className="text-sm text-muted-foreground">No hay retos de profesor disponibles</p>
            </div>
          </CardContent>
        </Card>

        {/* Introduce ID */}
        <Card className="border-border bg-card shadow-sm">
          <CardContent className="flex flex-col items-center gap-2.5 p-5 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-xl font-bold text-primary-foreground">
              #
            </div>
            <h3 className="text-base font-bold text-foreground">Introducir ID</h3>
            <p className="text-xs text-muted-foreground leading-tight">
              Si tienes un código específico de un profesor o compañero introdúcelo aquí
            </p>
            <input
              type="text"
              placeholder="#"
              className="w-full rounded-full border border-input bg-muted/50 px-4 py-2 text-center text-sm outline-none transition-all focus:ring-2 focus:ring-cta"
            />
            <Button size="sm" className="rounded-full bg-cta px-6 text-sm font-semibold text-cta-foreground hover:bg-cta/90">
              Aceptar
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* My created challenges */}
      <Card className="overflow-hidden border-none bg-secondary/25 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg text-foreground">
              Retos <span className="font-bold italic">creados</span>
            </h2>
            <Button variant="default" size="sm" className="rounded-full px-5 text-xs font-semibold">
              Ver todos
            </Button>
          </div>

          {myChallenges.length === 0 ? (
            <div className="mt-6 flex min-h-[100px] items-center justify-center">
              <p className="text-sm text-muted-foreground">Aún no has creado ningún reto</p>
            </div>
          ) : (
            <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
              {myChallenges.map((ch, i) => (
                <div
                  key={ch.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${i * 60}ms`, animationFillMode: "both" }}
                >
                  <ChallengeCard challenge={ch} />
                </div>
              ))}
              {/* Create new card */}
              <button
                onClick={() => setCreateOpen(true)}
                className="flex min-w-[150px] shrink-0 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-secondary/40 bg-card/60 p-5 text-muted-foreground transition-all hover:scale-105 hover:border-cta hover:text-cta"
              >
                <Plus className="h-10 w-10" />
                <span className="text-xs font-semibold">Crear nuevo reto</span>
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateChallengeDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={() => refetch()}
      />
    </div>
  );
}
