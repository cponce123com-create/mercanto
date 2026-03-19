import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Lock, Mail, Store, ChevronLeft, Shield } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const [, setLocation] = useLocation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    if (!email || !password) {
      toast.error("Completa correo y contraseña");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || "No se pudo iniciar sesión");
      }

      const role = data?.user?.role;

      toast.success("Sesión iniciada correctamente");

      if (role === "admin") {
        setLocation("/admin");
      } else if (role === "vendor") {
        setLocation("/vendor");
      } else {
        setLocation("/profile");
      }

      window.location.reload();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al iniciar sesión";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <Link href="/">
          <span className="text-blue-600 hover:text-blue-700 flex items-center gap-1 mb-6 cursor-pointer">
            <ChevronLeft className="w-5 h-5" />
            Volver
          </span>
        </Link>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mb-4">
                <Store className="w-7 h-7 text-blue-600" />
              </div>

              <h1 className="text-2xl font-bold">Iniciar sesión</h1>
              <p className="text-slate-600 mt-2">
                Accede a tu cuenta sin depender de Manus
              </p>

              <div className="mt-4 rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-600 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Administradores al panel de admin. Vendedores a su panel. Compradores a su perfil.
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Correo</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="correo@ejemplo.com"
                    className="pl-9"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="Tu contraseña"
                    className="pl-9"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Ingresando...
                  </>
                ) : (
                  "Ingresar"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-600">
              ¿No tienes cuenta?{" "}
              <Link href="/register">
                <span className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium">
                  Crear cuenta
                </span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
