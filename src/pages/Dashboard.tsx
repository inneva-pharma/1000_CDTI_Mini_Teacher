import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Target, Trophy } from "lucide-react";

const roleLabels: Record<number, string> = {
  1: "Administrador",
  2: "Profesor",
  3: "Alumno",
  4: "Independiente",
};

export default function Dashboard() {
  const { profile } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">
          Bienvenido/a, {profile?.nick ?? "Usuario"}!
        </h1>
        <Badge variant="secondary" className="mt-1">
          {roleLabels[profile?.role_id ?? 4]}
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Mis Tutores IA</CardTitle>
            <Bot className="h-5 w-5 text-secondary" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">—</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Mis Retos</CardTitle>
            <Target className="h-5 w-5 text-secondary" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">—</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Resultados</CardTitle>
            <Trophy className="h-5 w-5 text-secondary" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">—</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Tutores recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Aún no hay actividad reciente.</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Retos recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Aún no hay actividad reciente.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
