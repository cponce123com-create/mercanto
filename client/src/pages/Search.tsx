import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Search, ChevronLeft } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

export default function SearchPage() {
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [offset, setOffset] = useState(0);

  // Extract query from URL
  useEffect(() => {
    const params = new URLSearchParams(location.split("?")[1]);
    const q = params.get("q") || "";
    setSearchQuery(q);
    setOffset(0);
  }, [location]);

  const { data: results, isLoading } = trpc.products.search.useQuery(
    {
      query: searchQuery,
      limit: 20,
      offset,
    },
    {
      enabled: searchQuery.length > 0,
    }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/">
              <a className="text-blue-600 hover:text-blue-700 flex items-center gap-1">
                <ChevronLeft className="w-5 h-5" />
                Volver
              </a>
            </Link>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 h-10"
              autoFocus
            />
            <Button type="submit" size="sm">
              <Search className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </header>

      {/* Results */}
      <div className="container mx-auto px-4 py-8">
        {!searchQuery ? (
          <div className="text-center py-12">
            <p className="text-slate-600">Ingresa un término de búsqueda</p>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin w-6 h-6" />
          </div>
        ) : results && results.length > 0 ? (
          <>
            <h2 className="text-2xl font-bold mb-6">
              Resultados para "{searchQuery}" ({results.length} productos)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {results.map((product) => (
                <Link key={product.id} href={`/producto/${product.slug}`}>
                  <a className="block">
                    <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden">
                      <div className="bg-slate-200 h-40 flex items-center justify-center">
                        <span className="text-slate-400">Sin imagen</span>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-slate-900 line-clamp-2 mb-2">
                          {product.name}
                        </h3>
                        <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div>
                            {product.offer_price ? (
                              <>
                                <span className="text-lg font-bold text-green-600">
                                  ${product.offer_price}
                                </span>
                                <span className="text-sm text-slate-500 line-through ml-2">
                                  ${product.price}
                                </span>
                              </>
                            ) : (
                              <span className="text-lg font-bold text-slate-900">
                                ${product.price}
                              </span>
                            )}
                          </div>
                          {product.unit && (
                            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                              {product.unit}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </a>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center gap-4 mt-8">
              <Button
                variant="outline"
                onClick={() => setOffset(Math.max(0, offset - 20))}
                disabled={offset === 0}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                onClick={() => setOffset(offset + 20)}
                disabled={results.length < 20}
              >
                Siguiente
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-600">No se encontraron productos</p>
          </div>
        )}
      </div>
    </div>
  );
}
