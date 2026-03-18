import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { StoreCard } from "@/components/StoreCard";
import { Loader2, Search, MapPin } from "lucide-react";

export default function Stores() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterFeatured, setFilterFeatured] = useState(false);

  // Query all stores
  const { data: stores, isLoading } = trpc.stores.listStores.useQuery({
    limit: 100,
    offset: 0,
  });  // Filter stores based on search and featured filter
  const filteredStores = stores?.filter((store) => {
    const matchesSearch =
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (store.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

    const matchesFeatured = !filterFeatured || store.is_featured;

    return matchesSearch && matchesFeatured;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="container">
          <h1 className="text-4xl font-bold mb-4">Tiendas</h1>
          <p className="text-blue-100 text-lg">
            Descubre las mejores tiendas locales en nuestro marketplace
          </p>
        </div>
      </div>

      <div className="container py-8">
        {/* Search and Filters */}
        <Card className="p-6 mb-8">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Buscar tiendas..."
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
            </div>
          </div>
        </Card>

        {/* Results */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : filteredStores && filteredStores.length > 0 ? (
          <>
            <div className="mb-4">
              <p className="text-slate-600">
                Se encontraron <span className="font-bold">{filteredStores.length}</span> tiendas
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
                  location={store.location}
                  whatsapp={store.whatsapp}
                  total_visits={store.total_visits}
                  is_featured={store.is_featured}
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
                ? "Intenta con otro término de búsqueda"
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
