import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Search,
  Store,
  Package,
  Users,
  Eye,
  ChevronLeft,
} from "lucide-react";
import { Link } from "wouter";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"stores" | "products">("stores");

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Por favor inicia sesión</p>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Solo administradores pueden acceder aquí</p>
      </div>
    );
  }

  const { data: allStores = [], isLoading: storesLoading } = trpc.admin.getAllStores.useQuery();
  const { data: allProducts = [], isLoading: productsLoading } = trpc.admin.getAllProducts.useQuery();

  const filteredStores = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allStores;

    return allStores.filter((store) => {
      return (
        store.name.toLowerCase().includes(q) ||
        (store.description?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [allStores, searchQuery]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allProducts;

    return allProducts.filter((product) => {
      return (
        product.name.toLowerCase().includes(q) ||
        (product.description?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [allProducts, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container py-6 md:py-8">
        <Link href="/">
          <span className="text-blue-600 hover:text-blue-700 flex items-center gap-1 mb-6 cursor-pointer">
            <ChevronLeft className="w-5 h-5" />
            Volver
          </span>
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Panel de Administración</h1>
          <p className="text-slate-600">
            Gestiona todas las tiendas y productos de Mercanto
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total de tiendas</p>
                <p className="text-3xl font-bold">{allStores.length}</p>
              </div>
              <Store className="w-10 h-10 text-blue-500" />
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total de productos</p>
                <p className="text-3xl font-bold">{allProducts.length}</p>
              </div>
              <Package className="w-10 h-10 text-green-500" />
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Tiendas activas</p>
                <p className="text-3xl font-bold">
                  {allStores.filter((s) => s.status === "active").length}
                </p>
              </div>
              <Eye className="w-10 h-10 text-purple-500" />
            </div>
          </Card>
        </div>

        <Card className="p-6 mb-8">
          <div className="flex gap-2 mb-6">
            <Button
              variant={activeTab === "stores" ? "default" : "outline"}
              onClick={() => setActiveTab("stores")}
            >
              <Store className="w-4 h-4 mr-2" />
              Tiendas ({allStores.length})
            </Button>
            <Button
              variant={activeTab === "products" ? "default" : "outline"}
              onClick={() => setActiveTab("products")}
            >
              <Package className="w-4 h-4 mr-2" />
              Productos ({allProducts.length})
            </Button>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeTab === "stores" ? "Buscar tienda..." : "Buscar producto..."}
              className="pl-9"
            />
          </div>

          {activeTab === "stores" ? (
            <>
              {storesLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : filteredStores.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold">Nombre</th>
                        <th className="text-left py-3 px-4 font-semibold">Estado</th>
                        <th className="text-left py-3 px-4 font-semibold">Visitas</th>
                        <th className="text-left py-3 px-4 font-semibold">Productos</th>
                        <th className="text-left py-3 px-4 font-semibold">Destacada</th>
                        <th className="text-left py-3 px-4 font-semibold">Creada</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStores.map((store) => (
                        <tr key={store.id} className="border-b hover:bg-slate-50">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{store.name}</p>
                              <p className="text-xs text-slate-500">{store.slug}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                store.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : store.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
                              {store.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">{store.total_visits}</td>
                          <td className="py-3 px-4">
                            {allProducts.filter((p) => p.store_id === store.id).length}
                          </td>
                          <td className="py-3 px-4">
                            {store.is_featured ? (
                              <span className="text-yellow-600 font-semibold">★</span>
                            ) : (
                              <span className="text-slate-300">☆</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-xs text-slate-500">
                            {new Date(store.created_at).toLocaleDateString("es-ES")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-600">No se encontraron tiendas</p>
                </div>
              )}
            </>
          ) : (
            <>
              {productsLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold">Nombre</th>
                        <th className="text-left py-3 px-4 font-semibold">Tienda</th>
                        <th className="text-left py-3 px-4 font-semibold">Precio</th>
                        <th className="text-left py-3 px-4 font-semibold">Stock</th>
                        <th className="text-left py-3 px-4 font-semibold">Estado</th>
                        <th className="text-left py-3 px-4 font-semibold">Vistas</th>
                        <th className="text-left py-3 px-4 font-semibold">Creado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => {
                        const store = allStores.find((s) => s.id === product.store_id);
                        return (
                          <tr key={product.id} className="border-b hover:bg-slate-50">
                            <td className="py-3 px-4">
                              <div>
                                <p className="font-medium line-clamp-1">{product.name}</p>
                                <p className="text-xs text-slate-500">{product.slug}</p>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <p className="text-sm">{store?.name || "Desconocida"}</p>
                            </td>
                            <td className="py-3 px-4 font-semibold">S/ {product.price}</td>
                            <td className="py-3 px-4">{product.stock}</td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  product.status === "active"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-slate-200 text-slate-700"
                                }`}
                              >
                                {product.status}
                              </span>
                            </td>
                            <td className="py-3 px-4">{product.total_views}</td>
                            <td className="py-3 px-4 text-xs text-slate-500">
                              {new Date(product.created_at).toLocaleDateString("es-ES")}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-600">No se encontraron productos</p>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
