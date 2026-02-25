import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Award, X } from "lucide-react";

const DIFFICULTIES = [
  { value: "Fácil", color: "bg-green-500" },
  { value: "Medio", color: "bg-yellow-400" },
  { value: "Difícil", color: "bg-orange-500" },
  { value: "Experto", color: "bg-red-500" },
];

const LANGUAGES = ["Español", "English", "Français"];

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: () => void;
}

export function CreateChallengeDialog({ open, onOpenChange, onCreated }: Props) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [animState, setAnimState] = useState<"closed" | "entering" | "open" | "leaving">("closed");

  const [name, setName] = useState("");
  const [topic, setTopic] = useState("");
  const [gradeId, setGradeId] = useState<string>("");
  const [subjectId, setSubjectId] = useState<string>("");
  const [language, setLanguage] = useState("Español");
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState("Fácil");
  const [shareWithStudents, setShareWithStudents] = useState(false);

  useEffect(() => {
    if (open) {
      setAnimState("entering");
      const t = setTimeout(() => setAnimState("open"), 30);
      return () => clearTimeout(t);
    } else if (animState === "open" || animState === "entering") {
      setAnimState("leaving");
      const t = setTimeout(() => setAnimState("closed"), 400);
      return () => clearTimeout(t);
    }
  }, [open]);

  const { data: grades = [] } = useQuery({
    queryKey: ["grades"],
    queryFn: async () => {
      const { data } = await supabase.from("grades").select("*").order("id");
      return data ?? [];
    },
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const { data } = await supabase.from("subjects").select("*").order("name");
      return data ?? [];
    },
  });

  const resetForm = () => {
    setName("");
    setTopic("");
    setGradeId("");
    setSubjectId("");
    setLanguage("Español");
    setQuestionCount(5);
    setDifficulty("Fácil");
    setShareWithStudents(false);
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleGenerate = async () => {
    if (!user) return;
    if (!name.trim() || !gradeId || !subjectId) {
      toast.error("Completa al menos el nombre, curso y asignatura");
      return;
    }

    setLoading(true);
    try {
      const accessPermissions = shareWithStudents ? 1 : 0;
      const { data: challenge, error } = await supabase
        .from("challenges")
        .insert({
          name: name.trim(),
          topic: topic.trim() || null,
          grade_id: parseInt(gradeId),
          subject_id: parseInt(subjectId),
          language: language === "Español" ? "ES" : language === "English" ? "EN" : "FR",
          questionCount,
          difficulty,
          accessPermissions,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      const webhookUrl = import.meta.env.VITE_N8N_CHALLENGE_WEBHOOK;
      if (webhookUrl) {
        try {
          const session = await supabase.auth.getSession();
          const token = session.data.session?.access_token;
          await fetch(`${webhookUrl}/generar`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              challenge_id: challenge.id,
              user_id: user.id,
              name: name.trim(),
              topic: topic.trim(),
              grade: grades.find((g) => g.id === parseInt(gradeId))?.name ?? "",
              subject: subjects.find((s) => s.id === parseInt(subjectId))?.name ?? "",
              language,
              questionCount,
              difficulty,
            }),
          });
        } catch (webhookErr) {
          console.warn("n8n webhook error:", webhookErr);
        }
      }

      toast.success("Reto creado correctamente");
      resetForm();
      onOpenChange(false);
      onCreated();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error al crear el reto");
    } finally {
      setLoading(false);
    }
  };

  if (animState === "closed") return null;

  const isVisible = animState === "open";
  const isLeaving = animState === "leaving";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isVisible ? "opacity-100" : isLeaving ? "opacity-0" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      {/* Dialog panel — slides from right, exits to left */}
      <div
        className={`relative z-10 mx-4 w-full max-w-2xl overflow-hidden rounded-2xl bg-card shadow-2xl transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isVisible
            ? "translate-x-0 scale-100 opacity-100"
            : isLeaving
              ? "-translate-x-[30%] scale-95 opacity-0"
              : "translate-x-[40%] scale-95 opacity-0"
        }`}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 z-20 rounded-full p-1.5 text-primary-foreground/60 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Dark header */}
        <div className="flex items-center gap-4 bg-primary px-8 py-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cta shadow-lg">
            <Award className="h-8 w-8 text-cta-foreground" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-primary-foreground">
              Crear <span className="font-extrabold">nuevo reto</span>
            </h2>
            <p className="text-sm text-primary-foreground/60">
              Configura los parámetros para generar un nuevo desafío educativo
            </p>
          </div>
        </div>

        {/* Form body */}
        <div className="space-y-5 px-8 py-6">
          {/* Row 1: Name + Topic */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="font-bold text-primary">Nombre del reto</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-full border-none bg-muted/60 shadow-inner"
                placeholder="Ej: Multiplicaciones"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="font-bold text-primary">Temática</Label>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="rounded-full border-none bg-muted/60 shadow-inner"
                placeholder="Ej: Tablas del 1 al 5"
              />
            </div>
          </div>

          {/* Row 2: Grade + Subject + Language */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label className="font-bold text-primary">Curso</Label>
              <Select value={gradeId} onValueChange={setGradeId}>
                <SelectTrigger className="rounded-full border-none bg-muted/60 shadow-inner">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {grades.map((g) => (
                    <SelectItem key={g.id} value={String(g.id)}>{g.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="font-bold text-primary">Asignatura</Label>
              <Select value={subjectId} onValueChange={setSubjectId}>
                <SelectTrigger className="rounded-full border-none bg-muted/60 shadow-inner">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="font-bold text-primary">Idioma</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="rounded-full border-none bg-muted/60 shadow-inner">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((l) => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 3: Question count + Difficulty */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="font-bold text-primary">Número de preguntas</Label>
              <Input
                type="number"
                min={1}
                max={50}
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value) || 1)}
                className="w-36 rounded-full border-none bg-muted/60 shadow-inner"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="font-bold text-primary">Dificultad</Label>
              <div className="flex flex-wrap gap-2">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setDifficulty(d.value)}
                    className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm transition-all duration-200 ${
                      difficulty === d.value
                        ? "border-primary bg-primary/10 font-bold text-primary shadow-sm"
                        : "border-transparent bg-muted/50 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {d.value}
                    <span className={`h-3.5 w-3.5 rounded-full ${d.color} shadow-sm`} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Share toggle */}
          <div className="flex items-center justify-between rounded-2xl bg-muted/40 p-4">
            <div>
              <p className="font-bold text-primary">Compartir con compañeros</p>
              <p className="text-xs text-muted-foreground">Permitir visibilidad entre alumnos</p>
            </div>
            <Switch checked={shareWithStudents} onCheckedChange={setShareWithStudents} />
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-4 pt-1 pb-2">
            <Button
              variant="secondary"
              className="min-w-[140px] rounded-full font-semibold transition-transform hover:scale-105"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="min-w-[160px] rounded-full border-2 border-cta bg-cta font-bold text-cta-foreground shadow-md transition-transform hover:scale-105 hover:bg-cta/90"
            >
              {loading ? "Generando..." : "Generar reto"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
