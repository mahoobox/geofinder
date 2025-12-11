"use client";

import { useState } from "react";
import { checkEnvironmentVariables } from "@/ai/flows/environment-variable-assistant";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2, ShieldCheck } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function EnvChecker() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCheck = async () => {
    setIsLoading(true);
    try {
      const result = await checkEnvironmentVariables();
      const hasIssues =
        result.missingVariables.length > 0 ||
        result.misconfiguredVariables.length > 0;

      toast({
        variant: hasIssues ? "destructive" : "default",
        title: (
          <div className="flex items-center gap-2">
            {hasIssues ? (
              <AlertTriangle className="h-5 w-5" />
            ) : (
              <ShieldCheck className="h-5 w-5" />
            )}
            <span>Revisión de Entorno</span>
          </div>
        ),
        description: result.summary,
        duration: 9000,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo realizar la verificación de entorno.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCheck}
            disabled={isLoading}
            aria-label="Verificar variables de entorno"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <ShieldCheck />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Verificar variables de entorno</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
