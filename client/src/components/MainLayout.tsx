import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";
import { Loader2 } from "lucide-react";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <span className="text-2xl font-bold text-blue-600 cursor-pointer hover:text-blue-700">
              Mercanto
            </span>
          </Link>

          <nav className="hidden md:flex gap-6 items-center">
            <Link href="/categories">
              <span className="text-sm font-medium text-slate-600 cursor-pointer hover:text-slate-900">
                Categorías
              </span>
            </Link>
            <Link href="/stores">
              <span className="text-sm font-medium text-slate-600 cursor-pointer hover:text-slate-900">
                Tiendas
              </span>
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {authLoading ? (
              <Loader2 className="animate-spin w-5 h-5 text-slate-400" />
            ) : isAuthenticated ? (
              <>
                {(user?.role === "vendor" || user?.role === "admin") && (
                  <Link href="/vendor">
                    <Button variant="outline" size="sm">
                      Mi Panel
                    </Button>
                  </Link>
                )}
                <Link href="/profile">
                  <Button variant="outline" size="sm">
                    {user?.name || "Perfil"}
                  </Button>
                </Link>
              </>
            ) : (
              <a href={getLoginUrl()}>
                <Button size="sm">Ingresar</Button>
              </a>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-slate-900 text-slate-300 py-12 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-4">© 2024 Mercanto - Tu Marketplace Local</p>
          <div className="flex justify-center gap-6 text-sm">
            <Link href="/categories" className="hover:text-white transition-colors">Categorías</Link>
            <Link href="/stores" className="hover:text-white transition-colors">Tiendas</Link>
            <Link href="/search" className="hover:text-white transition-colors">Búsqueda</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
