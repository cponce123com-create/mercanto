import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Search, ChevronLeft, Store } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function SearchPage() {
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const queryString = location.includes("?") ? location.split("?")[1] : "";
    const params = new URLSearchParams(queryString);
    const q = params.get("q") || "";
    setSearchQuery(q);
    setSubmittedQuery(q);
    setOffset(0);
  }, [location]);

  const { data: results = [], isLoading } = trpc.products.search.useQuery(
    {
      query: submittedQuery,
      limit: 20,
      offset,
    },
    {
      enabled: submittedQuery.trim().length > 0,
    }
  );

  const hasResults = results.length > 0;
  const canGoPrev = offset > 0;
  const canGoNext = results.length === 20;

  const titleText = useMemo(() => {
    if (!submittedQuery.trim()) return "Buscar productos";
    return `Resultados para "${submittedQuery}"`;
  }, [submittedQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const value = searchQuery.trim();
    if (!value) return;
    setLocation(`/search?q=${encodeURIComponent(value)}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/">
              <span className="text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer">
                <ChevronLeft className="w-5 h-5" />
                Volver
              </span>
            </Link>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              placeholder="Buscar productos, descripción o tienda..."
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

      <div className="container mx-auto px-4 py-8">
        {!submittedQuery.trim() ? (
          <div className="text-center py-12">
            <p className="text-slate-600">Ingresa un término de búsqueda</p>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin w-6 h-6" />
          </div>
        ) : hasResults ? (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold">{titleText}</h2>
              <p className="text-slate-600 mt-1">
                {offset + 1}-{offset + results.length} resultados mostrados
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {results.map((product) => {
                const finalPrice = product.offer_price || product.price;
                return (
                  <Link key={product.id} href={`/product/${product.slug}`}>
                    <div className="block cursor-pointer">
                      <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-44 object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="bg-slate-200 h-44 flex items-center justify-center">
                            <span className="text-slate-400">Sin imagen</span>
                          </div>
                        )}

                        <CardContent className="p-4">
                          <h3 className="font-semibold text-slate-900 line-clamp-2 mb-2 min-h-[3rem]">
                            {product.name}
                          </h3>

                          {product.description ? (
                            <p className="text-sm text-slate-600 line-clamp-2 mb-3 min-h-[2.5rem]">
                              {product.description}
                            </p>
                          ) : (
                            <div className="mb-3 min-h-[2.5rem]" />
                          )}

                          {product.store_name && (
                            <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                              <Store className="w-3.5 h-3.5" />
                              <span className="line-clamp-1">{product.store_name}</span>
                            </div>
                          )}

                          <div className="flex items-end justify-between gap-3">
                            <div className="min-w-0">
                              {product.offer_price ? (
                                <div className="flex flex-col">
                                  <span className="text-lg font-bold text-green-600">
                                    S/ {finalPrice}
                                  </span>
                                  <span className="text-sm text-slate-500 line-through">
                                    S/ {product.price}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-lg font-bold text-slate-900">
                                  S/ {product.price}
                                </span>
                              )}
                            </div>

                            {product.unit && (
                              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded shrink-0">
                                {product.unit}
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="flex justify-center gap-4 mt-8">
              <Button
                variant="outline"
                onClick={() => setOffset(Math.max(0, offset - 20))}
                disabled={!canGoPrev}
              >
                Anterior
              </Button>

              <Button
                variant="outline"
                onClick={() => setOffset(offset + 20)}
                disabled={!canGoNext}
              >
                Siguiente
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">No se encontraron productos</h2>
            <p className="text-slate-600">
              Prueba con otro nombre, una descripción o el nombre de una tienda.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
