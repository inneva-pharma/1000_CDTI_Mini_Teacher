import { Card, CardContent } from "@/components/ui/card";
import { Construction } from "lucide-react";

export default function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex flex-1 items-center justify-center">
      <Card className="max-w-sm shadow-sm">
        <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
          <Construction className="h-12 w-12 text-secondary" />
          <h2 className="text-xl font-bold text-primary">{title}</h2>
          <p className="text-sm text-muted-foreground">Próximamente</p>
        </CardContent>
      </Card>
    </div>
  );
}
