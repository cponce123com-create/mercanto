import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Search, Store, ShoppingBag, TrendingUp, Heart } from "lucide-react";
import { getLoginUrl } from "@/const";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

export default function Home() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();

  const { data: categories, isLoading: categoriesLoading } = trpc.categories.list.useQuery();
  const { data: stores, isLoading: storesLoading } = trpc.stores.listStores.useQuery({
    limit: 6,
    offset: 0,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const value = searchQuery.trim();
    if (!value) return;
    setLocation(`/search?q=${encodeURIComponent(value)}`);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
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
            {isAuthenticated ? (
              <>
                {(user?.role === "vendor" || user?.role === "admin") && (
                  <Link href="/vendor">
                    <Button variant="outline" size="sm">
                      Mi Panel
                    </Button>
                  </Link>
                )}
                <Button variant="outline" size="sm">
                  {user?.name || "Perfil"}
                </Button>
              </>
            ) : (
              <a href={getLoginUrl()}>
                <Button size="sm">Ingresar</Button>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Tu Marketplace Local</h1>
            <p className="text-lg md:text-xl text-blue-100 mb-8">
              Compra y vende productos locales en un solo lugar
            </p>

            <form onSubmit={handleSearch} className="flex gap-2 mb-6">
              <Input
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 h-12 bg-white text-slate-900"
              />
              <Button type="submit" size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                <Search className="w-5 h-5" />
              </Button>
            </form>

            {!isAuthenticated && (
              <a href={getLoginUrl()}>
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                  Comienza a vender
                </Button>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">Categorías</h2>

          {categoriesLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin w-6 h-6" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories?.map((category) => (
                <Link key={category.id} href={`/categories`}>
                  <div className="block cursor-pointer">
                    <Card className="h-full hover:shadow-lg transition-shadow">
                      <CardContent className="p-4 text-center">
                        {category.icon && <div className="text-3xl mb-2">{category.icon}</div>}
                        <h3 className="font-semibold text-sm text-slate-900">{category.name}</h3>
                      </CardContent>
                    </Card>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Stores */}
      <section className="py-12 md:py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">Tiendas Destacadas</h2>

          {storesLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin w-6 h-6" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stores?.map((store) => (
                <Link key={store.id} href={`/store/${store.slug}`}>
                  <div className="block cursor-pointer">
                    <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden">
                      {store.banner_url && (
                        <img
                          src={store.banner_url}
                          alt={store.name}
                          className="w-full h-32 object-cover"
                        />
                      )}
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          {store.logo_url && (
                            <img
                              src={store.logo_url}
                              alt={store.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          )}
                          <div>
                            <h3 className="font-semibold text-slate-900">{store.name}</h3>
                            <p className="text-xs text-slate-500">{store.total_visits} visitas</p>
                          </div>
                        </div>
                        {store.description && (
                          <p className="text-sm text-slate-600 line-clamp-2">{store.description}</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">¿Por qué Mercanto?</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Store className="w-10 h-10 mx-auto mb-4 text-blue-600" />
                <h3 className="font-semibold mb-2">Tiendas Locales</h3>
                <p className="text-sm text-slate-600">
                  Apoya negocios locales y compra directamente de vendedores de tu zona
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-10 h-10 mx-auto mb-4 text-green-600" />
                <h3 className="font-semibold mb-2">Compara Opciones</h3>
                <p className="text-sm text-slate-600">
                  Encuentra productos de distintas tiendas de forma más simple
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <ShoppingBag className="w-10 h-10 mx-auto mb-4 text-purple-600" />
                <h3 className="font-semibold mb-2">Compra Fácil</h3>
                <p className="text-sm text-slate-600">
                  Descubre productos, visita tiendas y encuentra lo que necesitas rápido
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Heart className="w-10 h-10 mx-auto mb-4 text-red-600" />
                <h3 className="font-semibold mb-2">Favoritos</h3>
                <p className="text-sm text-slate-600">
                  Guarda tus productos y tiendas preferidas para revisarlas después
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      {!isAuthenticated && (
        <section className="bg-blue-600 text-white py-12 md:py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">¿Eres vendedor?</h2>
            <p className="text-lg text-blue-100 mb-6">
              Crea tu tienda en Mercanto y comienza a vender hoy mismo
            </p>
            <a href={getLoginUrl()}>
              <Button size="lg" variant="outline" className="text-blue-600 border-white hover:bg-white">
                Crear Tienda
              </Button>
            </a>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold mb-4">Mercanto</h3>
              <p className="text-sm">Tu marketplace local para comprar y vender</p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Navegación</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/categories">
                    <span className="hover:text-white cursor-pointer">Categorías</span>
                  </Link>
                </li>
                <li>
                  <Link href="/stores">
                    <span className="hover:text-white cursor-pointer">Tiendas</span>
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Ayuda</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <span className="hover:text-white cursor-pointer">Contacto</span>
                </li>
                <li>
                  <span className="hover:text-white cursor-pointer">Términos</span>
                </li>
                <li>
                  <span className="hover:text-white cursor-pointer">Privacidad</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-8 text-center text-sm">
            <p>&copy; 2026 Mercanto. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
