import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { StoreCard } from "@/components/StoreCard";
import { Loader2, Search, MapPin } from "lucide-react";
import { demoStores } from "@/lib/demo-content";

export default function Stores() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterFeatured, setFilterFeatured] = useState(false);

  const { data: stores = [], isLoading } = trpc.stores.listStores.useQuery({
    limit: 100,
    offset: 0,
  });

  const visualStores = useMemo(() => {
    if (stores.length > 0) return stores;
    return demoStores;
  }, [stores]);

  const isDemoMode = !isLoading && stores.length === 0;

  const normalizedSearch = searchQuery.trim().toLowerCase();

  const filteredStores = useMemo(() => {
    return visualStores.filter((store) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        store.name.toLowerCase().includes(normalizedSearch) ||
        (store.description?.toLowerCase().includes(normalizedSearch) ?? false) ||
        (store.location?.toLowerCase().includes(normalizedSearch) ?? false);

      const matchesFeatured = !filterFeatured || store.is_featured;

      return matchesSearch && matchesFeatured;
    });
  }, [visualStores, normalizedSearch, filterFeatured]);

  return (
    <div className="bg-slate-50">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="container">
          <h1 className="text-4xl font-bold mb-4">Tiendas</h1>
          <p className="text-blue-100 text-lg">
            Descubre las mejores tiendas locales en nuestro marketplace
          </p>
        </div>
      </div>

      <div className="container py-8">
        {isDemoMode && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
            Aún no hay tiendas activas en tu base de datos. Por eso te muestro tarjetas demo con imágenes
            referenciales para que el diseño no se vea vacío.
          </div>
        )}

        <Card className="p-6 mb-8">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Buscar por tienda, descripción o ubicación..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-3 flex-wrap">
              <Button
                variant={filterFeatured ? "default" : "outline"}
                onClick={() => setFilterFeatured(!filterFeatured)}
              >
                ⭐ Destacadas
              </Button>

              {searchQuery && (
                <Button variant="outline" onClick={() => setSearchQuery("")}>
                  Limpiar búsqueda
                </Button>
              )}
            </div>
          </div>
        </Card>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : filteredStores.length > 0 ? (
          <>
            <div className="mb-4">
              <p className="text-slate-600">
                Se encontraron <span className="font-bold">{filteredStores.length}</span> tiendas
                {isDemoMode ? " demo" : ""}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredStores.map((store) => (
                <StoreCard
                  key={store.id}
                  id={store.id}
                  name={store.name}
                  slug={store.slug}
                  description={store.description}
                  logo_url={store.logo_url}
                  banner_url={store.banner_url}
                  location={store.location}
                  whatsapp={store.whatsapp}
                  total_visits={store.total_visits}
                  is_featured={store.is_featured}
                  demoMode={isDemoMode}
                />
              ))}
            </div>
          </>
        ) : (
          <Card className="p-12 text-center">
            <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No se encontraron tiendas</h3>
            <p className="text-slate-600 mb-4">
              {searchQuery
                ? "Intenta con otro término de búsqueda o limpia el filtro actual."
                : "Aún no hay tiendas disponibles"}
            </p>
            {searchQuery && (
              <Button onClick={() => setSearchQuery("")} variant="outline">
                Limpiar búsqueda
              </Button>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
