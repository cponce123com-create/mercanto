import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Package, Eye, Tag, FileText, Settings, Plus } from "lucide-react";
import { useLocation } from "wouter";

export default function VendorDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Queries
  const { data: store } = trpc.stores.getMyStore.useQuery();
  const { data: products } = trpc.products.getMyProducts.useQuery();
  const { data: orders } = trpc.orders.getStoreOrders.useQuery();
  const { data: tacoraPosts } = trpc.tacora.getMyPosts.useQuery();

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

  const isLoading = !store || !products || !orders || !tacoraPosts;

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Panel de Vendedor</h1>
        <p className="text-slate-600">Bienvenido, {store?.name || "Tienda"}</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Productos</p>
                  <p className="text-3xl font-bold">{products?.length || 0}</p>
                </div>
                <Package className="w-10 h-10 text-blue-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Visitas</p>
                  <p className="text-3xl font-bold">{store?.total_visits || 0}</p>
                </div>
                <Eye className="w-10 h-10 text-green-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Pedidos</p>
                  <p className="text-3xl font-bold">{orders?.length || 0}</p>
                </div>
                <Tag className="w-10 h-10 text-purple-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Publicaciones</p>
                  <p className="text-3xl font-bold">{tacoraPosts?.length || 0}</p>
                </div>
                <FileText className="w-10 h-10 text-orange-500" />
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Acciones Rápidas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                onClick={() => setLocation("/vendor/products")}
                className="flex items-center gap-2"
              >
                <Package className="w-4 h-4" />
                Mis Productos
              </Button>
              <Button
                onClick={() => setLocation("/vendor/store")}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Configurar Tienda
              </Button>
              <Button
                onClick={() => setLocation("/vendor/tacora")}
                variant="outline"
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Mi Tacora
              </Button>
              <Button
                onClick={() => setLocation("/vendor/orders")}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Tag className="w-4 h-4" />
                Mis Pedidos
              </Button>
            </div>
          </Card>

          {/* Store Info */}
          {store && (
            <Card className="p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Información de Tienda</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Nombre</p>
                  <p className="font-semibold">{store.name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Estado</p>
                  <p className="font-semibold capitalize">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        store.status === "active"
                          ? "bg-green-100 text-green-800"
                          : store.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {store.status}
                    </span>
                  </p>
                </div>
                {store.description && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-slate-600 mb-1">Descripción</p>
                    <p>{store.description}</p>
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
              </div>
              <Button
                onClick={() => setLocation("/vendor/store")}
                className="mt-4"
                variant="outline"
              >
                Editar Tienda
              </Button>
            </Card>
          )}

          {/* Recent Products */}
          {products && products.length > 0 && (
            <Card className="p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Productos Recientes</h2>
                <Button onClick={() => setLocation("/vendor/products")} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Ver Todos
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2">Producto</th>
                      <th className="text-left py-2 px-2">Precio</th>
                      <th className="text-left py-2 px-2">Stock</th>
                      <th className="text-left py-2 px-2">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.slice(0, 5).map((product) => (
                      <tr key={product.id} className="border-b hover:bg-slate-50">
                        <td className="py-2 px-2 font-medium">{product.name}</td>
                        <td className="py-2 px-2">${product.price}</td>
                        <td className="py-2 px-2">{product.stock}</td>
                        <td className="py-2 px-2">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              product.status === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-slate-100 text-slate-800"
                            }`}
                          >
                            {product.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Recent Orders */}
          {orders && orders.length > 0 && (
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Pedidos Recientes</h2>
                <Button onClick={() => setLocation("/vendor/orders")} size="sm">
                  Ver Todos
                </Button>
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
                        <td className="py-2 px-2">${order.total_amount}</td>
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
