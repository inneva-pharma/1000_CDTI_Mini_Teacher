import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

interface ChallengeCardProps {
  challenge: Tables<"challenges">;
  onEdit: (challengeId: number) => void;
  onPlay: (challengeId: number) => void;
  onDelete: (challengeId: number) => void;
}

export function ChallengeCard({ challenge, onEdit, onPlay, onDelete }: ChallengeCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const openConfirm = () => {
    setConfirmOpen(true);
    setTimeout(() => setConfirmVisible(true), 30);
  };

  const closeConfirm = () => {
    setConfirmVisible(false);
    setTimeout(() => setConfirmOpen(false), 300);
  };

  return (
    <>
      {/*
       * aspect-square → la card es siempre cuadrada (alto = ancho del track).
       * w-full → ocupa el ancho de su celda de grid.
       */}
      <div className="aspect-square w-full min-w-0 flex flex-col justify-between rounded-2xl border border-border bg-card p-3 shadow-sm sm:p-3.5">

        {/* Parte superior: tag + delete + ID */}
        <div className="flex items-center justify-between gap-1 shrink-0">
          <span className="rounded-full bg-muted px-2 py-0.5 text-[9px] font-semibold text-muted-foreground sm:text-[10px]">
            Borrador
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={openConfirm}
              className="rounded-md p-0.5 text-muted-foreground/50 transition-colors hover:bg-destructive/10 hover:text-destructive"
              title="Borrar reto"
            >
              <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </button>
            <span className="text-[9px] font-medium text-muted-foreground/60 sm:text-[10px]">
              #{challenge.id}
            </span>
          </div>
        </div>

        {/* Parte central: nombre + conteo */}
        <div className="min-h-0 flex-1 flex flex-col justify-center py-1">
          <h4 className="line-clamp-3 text-xs font-bold leading-snug text-foreground sm:text-[13px]">
            {challenge.name}
          </h4>
          <p className="mt-1 text-[10px] text-muted-foreground sm:text-[11px]">
            {challenge.questionCount ?? 0} preguntas
          </p>
        </div>

        {/* Parte inferior: botones */}
        <div className="flex shrink-0 gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(challenge.id)}
            className="h-6 flex-1 rounded-full border-border px-1 text-[10px] font-semibold sm:h-7 sm:text-[11px]"
          >
            Editar
          </Button>
          <Button
            size="sm"
            onClick={() => onPlay(challenge.id)}
            className="h-6 flex-1 rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground hover:bg-primary/90 sm:h-7 sm:text-[11px]"
          >
            Empezar
          </Button>
        </div>
      </div>

      {/* ── CONFIRMATION POPUP ── */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
              confirmVisible ? "opacity-100" : "opacity-0"
            }`}
            onClick={closeConfirm}
          />
          <div
            className={`relative z-10 w-full max-w-sm rounded-2xl bg-card p-6 shadow-2xl transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              confirmVisible
                ? "translate-y-0 scale-100 opacity-100"
                : "translate-y-4 scale-95 opacity-0"
            }`}
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
              <Trash2 className="h-6 w-6 text-destructive" />
            </div>
            <h3 className="text-center text-base font-bold text-foreground">Borrar reto</h3>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Vas a borrar el reto{" "}
              <span className="font-semibold text-foreground">"{challenge.name}"</span>.
              Esta acción no se puede deshacer.
            </p>
            <div className="mt-5 flex gap-3">
              <Button
                variant="secondary"
                onClick={closeConfirm}
                className="flex-1 rounded-full text-xs font-semibold"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => { closeConfirm(); onDelete(challenge.id); }}
                className="flex-1 rounded-full bg-destructive text-xs font-bold text-white hover:bg-destructive/90"
              >
                Borrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
