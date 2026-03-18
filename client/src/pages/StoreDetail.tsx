import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, MapPin, Phone, Star, MessageCircle } from "lucide-react";
import { useState } from "react";

export default function StoreDetail() {
  const [route, params] = useRoute("/store/:slug");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!route || !params?.slug) {
    return <div>Tienda no encontrada</div>;
  }

  // Query store by slug
  const { data: store, isLoading } = trpc.stores.getStore.useQuery({
    slug: params.slug,
  });

  // Query products by store - using search with empty query to get all products from store
  // For now, we'll fetch all products and filter by store
  const { data: allProducts } = trpc.products.search.useQuery({
    query: "",
    limit: 100,
  });

  const products = allProducts?.filter((p: any) => p.store_id === store?.id) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Tienda no encontrada</h1>
          <p className="text-slate-600">La tienda que buscas no existe</p>
        </div>
      </div>
    );
  }

  const handleWhatsAppContact = () => {
    if (store.whatsapp) {
      const message = encodeURIComponent(`Hola, me interesa conocer más sobre tu tienda ${store.name}`);
      window.open(`https://wa.me/${store.whatsapp.replace(/\D/g, "")}?text=${message}`, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Banner */}
      {store.banner_url && (
        <div className="relative h-64 bg-slate-200 overflow-hidden">
          <img
            src={store.banner_url}
            alt="Banner"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Store Header */}
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Store Info */}
          <div className="md:col-span-2">
            <div className="flex items-start gap-6 mb-6">
              {store.logo_url && (
                <img
                  src={store.logo_url}
                  alt={store.name}
                  className="w-24 h-24 rounded-lg object-cover border-4 border-white shadow-lg"
                />
              )}
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{store.name}</h1>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-slate-600">4.8 (24 reseñas)</span>
                  </div>
                  <span className="text-sm text-slate-600">
                    {store.total_visits} visitas
                  </span>
                </div>
                {store.description && (
                  <p className="text-slate-700 mb-4">{store.description}</p>
                )}
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {store.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-600">Ubicación</p>
                    <p className="font-medium">{store.location}</p>
                  </div>
                </div>
              )}

              {store.whatsapp && (
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-600">WhatsApp</p>
                    <p className="font-medium">{store.whatsapp}</p>
                  </div>
                </div>
              )}

              {store.schedule && (
                <div className="sm:col-span-2">
                  <p className="text-sm text-slate-600 mb-1">Horario de Atención</p>
                  <div className="font-medium whitespace-pre-line text-sm">
                    {store.schedule}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {store.whatsapp && (
                <Button onClick={handleWhatsAppContact} className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Contactar por WhatsApp
                </Button>
              )}
            </div>
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-4">
            <Card className="p-4">
              <p className="text-sm text-slate-600 mb-1">Estado</p>
              <p className="text-lg font-bold capitalize">
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
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
            </Card>

            {store.is_featured && (
              <Card className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50">
                <p className="text-sm font-semibold text-orange-900">⭐ Tienda Destacada</p>
              </Card>
            )}

            <Card className="p-4">
              <p className="text-sm text-slate-600 mb-2">Productos</p>
              <p className="text-2xl font-bold">{products?.length || 0}</p>
            </Card>
          </div>
        </div>

        {/* Gallery */}
        {store.gallery && store.gallery.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Galería</h2>
            <div className="space-y-4">
              {/* Main Image */}
              <div className="bg-slate-200 rounded-lg overflow-hidden h-96">
                <img
                  src={selectedImage || store.gallery[0].url}
                  alt="Galería"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Thumbnails */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {store.gallery.map((image) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImage(image.url)}
                    className={`relative rounded-lg overflow-hidden h-24 border-2 transition-all ${
                      selectedImage === image.url
                        ? "border-blue-600"
                        : "border-slate-200 hover:border-slate-400"
                    }`}
                  >
                    <img
                      src={image.url}
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Products Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Productos</h2>

          {products && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {(products as any[]).map((product: any) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Product Image */}
                  <div className="relative aspect-square bg-slate-100 overflow-hidden group">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0].url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        Sin imagen
                      </div>
                    )}

                    {product.offer_price && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
                        Oferta
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                      {product.name}
                    </h3>

                    {product.description && (
                      <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                        {product.description}
                      </p>
                    )}

                    {/* Price */}
                    <div className="mb-3">
                      {product.offer_price ? (
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-blue-600">
                            ${product.offer_price}
                          </span>
                          <span className="text-sm text-slate-500 line-through">
                            ${product.price}
                          </span>
                        </div>
                      ) : (
                        <span className="text-2xl font-bold text-blue-600">
                          ${product.price}
                        </span>
                      )}
                    </div>

                    {/* Stock */}
                    <div className="mb-4">
                      <span
                        className={`text-sm font-medium ${
                          product.stock > 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {product.stock > 0 ? `${product.stock} disponibles` : "Agotado"}
                      </span>
                    </div>

                    {/* Action Button */}
                    <Button
                      onClick={handleWhatsAppContact}
                      disabled={!store.whatsapp}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Consultar
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <p className="text-slate-600 mb-4">Esta tienda aún no tiene productos</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
