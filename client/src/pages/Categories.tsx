import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, Search, Folder } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";

export default function CategoriesPage() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [offset, setOffset] = useState(0);
  const [categorySearch, setCategorySearch] = useState("");

  const { data: categories = [], isLoading: categoriesLoading } = trpc.categories.list.useQuery();

  const { data: products = [], isLoading: productsLoading } = trpc.products.getByCategory.useQuery(
    {
      categoryId: selectedCategory || 0,
      limit: 20,
      offset,
    },
    {
      enabled: selectedCategory !== null,
    }
  );

  const selectedCategoryData = categories.find((c) => c.id === selectedCategory);

  const filteredCategories = useMemo(() => {
    const q = categorySearch.trim().toLowerCase();
    if (!q) return categories;

    return categories.filter((category) => {
      return (
        category.name.toLowerCase().includes(q) ||
        (category.description?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [categories, categorySearch]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <Link href="/">
            <span className="text-blue-600 hover:text-blue-700 flex items-center gap-1 mb-4 cursor-pointer">
              <ChevronLeft className="w-5 h-5" />
              Volver
            </span>
          </Link>
          <h1 className="text-2xl font-bold">Categorías</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <h2 className="font-semibold mb-4">Categorías</h2>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  placeholder="Buscar categoría..."
                  className="pl-9"
                />
              </div>

              {categoriesLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="animate-spin w-5 h-5" />
                </div>
              ) : filteredCategories.length > 0 ? (
                <div className="space-y-2 max-h-[540px] overflow-auto pr-1">
                  {filteredCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        setSelectedCategory(category.id);
                        setOffset(0);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                        selectedCategory === category.id
                          ? "bg-blue-100 text-blue-900 font-semibold"
                          : "hover:bg-slate-100 text-slate-700"
                      }`}
                    >
                      <span className="mr-2">{category.icon || "📦"}</span>
                      {category.name}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-slate-500">No se encontraron categorías</div>
              )}
            </div>
          </div>

          <div className="lg:col-span-3">
            {selectedCategory === null ? (
              <Card className="p-12 text-center">
                <Folder className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">Selecciona una categoría para ver productos</p>
              </Card>
            ) : productsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin w-6 h-6" />
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold">{selectedCategoryData?.name}</h2>
                  {selectedCategoryData?.description && (
                    <p className="text-slate-600 mt-2">{selectedCategoryData.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {products.map((product) => (
                    <Link key={product.id} href={`/product/${product.slug}`}>
                      <div className="block cursor-pointer">
                        <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden">
                          <div className="bg-slate-200 h-40 flex items-center justify-center">
                            <span className="text-slate-400">Sin imagen</span>
                          </div>

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

                            <div className="flex items-center justify-between gap-3">
                              <div>
                                {product.offer_price ? (
                                  <div className="flex flex-col">
                                    <span className="text-lg font-bold text-green-600">
                                      S/ {product.offer_price}
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
                  ))}
                </div>

                <div className="flex justify-center gap-4">
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
                    disabled={products.length < 20}
                  >
                    Siguiente
                  </Button>
                </div>
              </>
            ) : (
              <Card className="p-12 text-center">
                <p className="text-slate-600">No hay productos en esta categoría</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
