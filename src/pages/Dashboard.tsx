import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, Target, BookOpen, Rocket, Search } from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { profile } = useAuth();

  return (
    <div className="space-y-6">
      {/* Hero card — matches reference */}
      <Card className="overflow-hidden border-border shadow-sm">
        <CardContent className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-primary md:text-3xl">
              ¿Qué te apetece{" "}
              <span className="text-secondary">aprender</span> hoy?
            </h1>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to="/knowledge">
                <Button className="h-11 gap-2 rounded-full bg-secondary/80 px-6 font-semibold text-secondary-foreground hover:bg-secondary">
                  <BookOpen className="h-4 w-4" />
                  Mi conocimiento
                </Button>
              </Link>
              <Link to="/explore">
                <Button className="h-11 gap-2 rounded-full bg-primary px-6 font-semibold text-primary-foreground hover:bg-primary/90">
                  <Rocket className="h-4 w-4" />
                  Explorar
                </Button>
              </Link>
            </div>
          </div>
          <div className="hidden md:block">
            {/* Robot mascot placeholder */}
            <div className="flex h-40 w-40 items-center justify-center rounded-2xl bg-muted/50">
              <svg viewBox="0 0 100 100" className="h-28 w-28 text-secondary/40" fill="currentColor">
                <circle cx="50" cy="35" r="25"/>
                <rect x="30" y="55" width="40" height="30" rx="8"/>
                <circle cx="40" cy="32" r="5" fill="hsl(185, 90%, 55%)"/>
                <circle cx="60" cy="32" r="5" fill="hsl(185, 90%, 55%)"/>
                <text x="50" y="20" textAnchor="middle" fontSize="18" fill="hsl(var(--cta))">?</text>
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature cards row — matches reference */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link to="/challenges">
          <Card className="group cursor-pointer border-border shadow-sm transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-5 p-6">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center">
                <Target className="h-12 w-12 text-cta" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-primary">Retos</h3>
                <p className="text-sm text-muted-foreground">
                  Estudia y aprende resolviendo divertidos retos
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/chatbots">
          <Card className="group cursor-pointer border-border shadow-sm transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-5 p-6">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center">
                <Bot className="h-12 w-12 text-cta" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-primary">Chat Bot</h3>
                <p className="text-sm text-muted-foreground">
                  Pregunta lo que quieras a tu profe robot inteligente
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
