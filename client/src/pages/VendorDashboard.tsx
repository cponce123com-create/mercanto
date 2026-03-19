import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Loader2,
  Package,
  Eye,
  Tag,
  FileText,
  Settings,
  Plus,
  Store,
  ArrowRight,
  Image as ImageIcon,
} from "lucide-react";
import { useLocation } from "wouter";

export default function VendorDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: store, isLoading: storeLoading, error: storeError } = trpc.stores.getMyStore.useQuery(undefined, {
    retry: false,
  });
  const { data: products = [], isLoading: productsLoading, error: productsError } = trpc.products.getMyProducts.useQuery(undefined, {
    retry: false,
  });
  const { data: orders = [], isLoading: ordersLoading, error: ordersError } = trpc.orders.getStoreOrders.useQuery(undefined, {
    retry: false,
  });
  const { data: tacoraPosts = [], isLoading: tacoraLoading, error: tacoraError } = trpc.tacora.getMyPosts.useQuery(undefined, {
    retry: false,
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Por favor inicia sesión</p>
      </div>
    );
  }

  if (user.role !== "vendor" && user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Solo vendedores pueden acceder aquí</p>
      </div>
    );
  }

  const isLoading = storeLoading || productsLoading || ordersLoading || tacoraLoading;
  const hasError = storeError || productsError || ordersError || tacoraError;

  const activeProducts = products.filter((p) => p.status === "active");
  const inactiveProducts = products.filter((p) => p.status !== "active");
  const productsWithImages = products.filter((p) => (p.images?.length || 0) > 0);
  const pendingOrders = orders.filter((o) => o.status === "pending");
  const processingOrders = orders.filter((o) => o.status === "processing");
  const completedOrders = orders.filter((o) => o.status === "completed");

  return (
    <div className="container py-6 md:py-8">
      <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Panel de Vendedor</h1>
          <p className="text-slate-600">
            Bienvenido, {store?.name || "Tienda"}
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button onClick={() => setLocation("/vendor/products")}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo producto
          </Button>
          <Button variant="outline" onClick={() => setLocation("/vendor/store")}>
            <Settings className="w-4 h-4 mr-2" />
            Configurar tienda
          </Button>
        </div>
      </div>

      {hasError ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
          <p className="text-red-800 font-semibold mb-2">Error al cargar el panel</p>
          <p className="text-red-700 text-sm mb-4">
            {storeError?.message || productsError?.message || ordersError?.message || tacoraError?.message || "Ocurrió un error al cargar los datos"}
          </p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="text-red-700 border-red-300 hover:bg-red-50"
          >
            Reintentar
          </Button>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Productos</p>
                  <p className="text-3xl font-bold">{products.length}</p>
                </div>
                <Package className="w-10 h-10 text-blue-500" />
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Visitas</p>
                  <p className="text-3xl font-bold">{store?.total_visits || 0}</p>
                </div>
                <Eye className="w-10 h-10 text-green-500" />
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Pedidos</p>
                  <p className="text-3xl font-bold">{orders.length}</p>
                </div>
                <Tag className="w-10 h-10 text-purple-500" />
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Tacora</p>
                  <p className="text-3xl font-bold">{tacoraPosts.length}</p>
                </div>
                <FileText className="w-10 h-10 text-orange-500" />
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="p-5">
              <h2 className="text-lg font-semibold mb-4">Resumen de productos</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Activos</span>
                  <span className="font-semibold">{activeProducts.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Inactivos</span>
                  <span className="font-semibold">{inactiveProducts.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Con imagen</span>
                  <span className="font-semibold">{productsWithImages.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Sin imagen</span>
                  <span className="font-semibold">{products.length - productsWithImages.length}</span>
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <h2 className="text-lg font-semibold mb-4">Resumen de pedidos</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Pendientes</span>
                  <span className="font-semibold">{pendingOrders.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">En proceso</span>
                  <span className="font-semibold">{processingOrders.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Completados</span>
                  <span className="font-semibold">{completedOrders.length}</span>
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <h2 className="text-lg font-semibold mb-4">Acciones rápidas</h2>
              <div className="grid grid-cols-1 gap-3">
                <Button
                  onClick={() => setLocation("/vendor/products")}
                  className="justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Mis Productos
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </Button>

                <Button
                  onClick={() => setLocation("/vendor/store")}
                  variant="outline"
                  className="justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Configurar Tienda
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </Button>

                <Button
                  onClick={() => setLocation("/vendor/products")}
                  variant="outline"
                  className="justify-between"
                >
                  <span className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Subir imágenes
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </div>

          {store && (
            <Card className="p-6 mb-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                <div className="flex items-center gap-4 min-w-0">
                  {store.logo_url ? (
                    <img
                      src={store.logo_url}
                      alt={store.name}
                      className="w-16 h-16 rounded-xl object-cover border"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-slate-200 flex items-center justify-center">
                      <Store className="w-6 h-6 text-slate-500" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <h2 className="text-xl font-semibold line-clamp-1">{store.name}</h2>
                    <div className="flex flex-wrap gap-2 mt-2">
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

                      {store.is_featured && (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                          Destacada
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <Button variant="outline" onClick={() => setLocation("/vendor/store")}>
                  Editar Tienda
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {store.description && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-slate-600 mb-1">Descripción</p>
                    <p className="whitespace-pre-line">{store.description}</p>
                  </div>
                )}

                {store.whatsapp && (
                  <div>
                    <p className="text-sm text-slate-600 mb-1">WhatsApp</p>
                    <p className="font-semibold">{store.whatsapp}</p>
                  </div>
                )}

                {store.location && (
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Ubicación</p>
                    <p className="font-semibold">{store.location}</p>
                  </div>
                )}

                {store.schedule && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-slate-600 mb-1">Horario</p>
                    <p className="whitespace-pre-line">{store.schedule}</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {products.length > 0 && (
            <Card className="p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Productos recientes</h2>
                <Button onClick={() => setLocation("/vendor/products")} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Ver todos
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {products.slice(0, 6).map((product) => {
                  const firstImage = product.images?.[0]?.url;
                  return (
                    <Card key={product.id} className="overflow-hidden">
                      <div className="h-40 bg-slate-100">
                        {firstImage ? (
                          <img
                            src={firstImage}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            Sin imagen
                          </div>
                        )}
                      </div>

                      <CardContent className="p-4">
                        <h3 className="font-semibold line-clamp-2 mb-2">{product.name}</h3>
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-bold text-blue-600">S/ {product.price}</span>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              product.status === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-slate-100 text-slate-800"
                            }`}
                          >
                            {product.status}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </Card>
          )}

          {orders.length > 0 && (
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Pedidos recientes</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2">ID</th>
                      <th className="text-left py-2 px-2">Cliente</th>
                      <th className="text-left py-2 px-2">Total</th>
                      <th className="text-left py-2 px-2">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map((order) => (
                      <tr key={order.id} className="border-b hover:bg-slate-50">
                        <td className="py-2 px-2 font-medium">#{order.id}</td>
                        <td className="py-2 px-2">Cliente #{order.buyer_id}</td>
                        <td className="py-2 px-2">S/ {order.total_amount}</td>
                        <td className="py-2 px-2">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              order.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : order.status === "processing"
                                  ? "bg-blue-100 text-blue-800"
                                  : order.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
