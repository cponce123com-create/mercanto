import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Search, Store, ShoppingBag, TrendingUp, Heart, Sparkles } from "lucide-react";
import { getLoginUrl } from "@/const";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useMemo, useState } from "react";
import { demoCategories, demoStores } from "@/lib/demo-content";

export default function Home() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();

  const { data: categories, isLoading: categoriesLoading } = trpc.categories.list.useQuery();
  const { data: stores, isLoading: storesLoading } = trpc.stores.listStores.useQuery({
    limit: 6,
    offset: 0,
  });

  const visualCategories = useMemo(() => {
    if (categories && categories.length > 0) return categories;
    return demoCategories;
  }, [categories]);

  const visualStores = useMemo(() => {
    if (stores && stores.length > 0) return stores;
    return demoStores;
  }, [stores]);

  const usingDemoCategories = !categoriesLoading && (!categories || categories.length === 0);
  const usingDemoStores = !storesLoading && (!stores || stores.length === 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const value = searchQuery.trim();
    if (!value) return;
    setLocation(`/search?q=${encodeURIComponent(value)}`);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-slate-50 to-white">
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm mb-5">
              <Sparkles className="w-4 h-4" />
              Marketplace local con vista demo cuando aún no hay datos
            </div>

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

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between gap-4 mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Categorías</h2>
            {usingDemoCategories && (
              <span className="text-sm bg-amber-100 text-amber-900 px-3 py-1 rounded-full font-medium">
                Mostrando categorías demo
              </span>
            )}
          </div>

          {categoriesLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin w-6 h-6" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {visualCategories.map((category) => (
                <Link key={category.id} href="/categories">
                  <div className="block cursor-pointer">
                    <Card className="h-full hover:shadow-lg transition-shadow border-slate-200">
                      <CardContent className="p-4 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-3xl mx-auto mb-3">
                          {category.icon || "📦"}
                        </div>
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

      <section className="py-12 md:py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between gap-4 mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Tiendas Destacadas</h2>
            {usingDemoStores && (
              <span className="text-sm bg-amber-100 text-amber-900 px-3 py-1 rounded-full font-medium">
                Mostrando tiendas demo
              </span>
            )}
          </div>

          {storesLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin w-6 h-6" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visualStores.map((store) => (
                <Card
                  key={store.id}
                  className="h-full hover:shadow-lg transition-shadow overflow-hidden border-slate-200"
                >
                  <div className="relative">
                    <img
                      src={store.banner_url || "https://placehold.co/1200x500/E2E8F0/0F172A?text=Mercanto"}
                      alt={store.name}
                      className="w-full h-36 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/45 via-transparent to-transparent" />
                    <img
                      src={store.logo_url || "https://placehold.co/100x100/F8FAFC/0F172A?text=M"}
                      alt={store.name}
                      className="absolute left-4 bottom-4 w-14 h-14 rounded-2xl object-cover border-4 border-white bg-white shadow-lg"
                    />
                  </div>

                  <CardContent className="p-4">
                    <div className="mb-3">
                      <h3 className="font-semibold text-slate-900">{store.name}</h3>
                      <p className="text-xs text-slate-500">{store.total_visits} visitas</p>
                    </div>

                    {store.description && (
                      <p className="text-sm text-slate-600 line-clamp-2">{store.description}</p>
                    )}

                    {usingDemoStores && (
                      <div className="mt-4 text-xs text-slate-500">
                        Vista referencial para que el diseño no se vea vacío.
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

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
    </div>
  );
}
