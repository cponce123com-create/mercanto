import { useEffect, useMemo, useState } from "react";
import { Link, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Loader2,
  MapPin,
  Phone,
  MessageCircle,
  ChevronLeft,
  Store,
} from "lucide-react";

export default function StoreDetail() {
  const [route, params] = useRoute("/store/:slug");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!route || !params?.slug) {
    return <div className="p-8">Tienda no encontrada</div>;
  }

  const { data: store, isLoading } = trpc.stores.getStore.useQuery({
    slug: params.slug,
  });

  const galleryImages = useMemo(() => {
    if (!store?.gallery?.length) return [];
    return store.gallery.map((image) => image.url).filter(Boolean);
  }, [store]);

  useEffect(() => {
    if (galleryImages.length > 0) {
      setSelectedImage(galleryImages[0]);
    } else {
      setSelectedImage(null);
    }
  }, [galleryImages]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center px-4">
          <h1 className="text-2xl font-bold mb-2">Tienda no encontrada</h1>
          <p className="text-slate-600">La tienda que buscas no existe</p>
        </div>
      </div>
    );
  }

  const whatsappClean = store.whatsapp?.replace(/\D/g, "");
  const whatsappUrl = whatsappClean
    ? `https://wa.me/${whatsappClean}?text=${encodeURIComponent(
        `Hola, me interesa conocer más sobre tu tienda ${store.name}`
      )}`
    : null;

  const products = store.products || [];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <Link href="/stores">
            <span className="text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer">
              <ChevronLeft className="w-5 h-5" />
              Volver
            </span>
          </Link>
        </div>
      </header>

      {store.banner_url && (
        <div className="relative h-52 md:h-72 bg-slate-200 overflow-hidden">
          <img src={store.banner_url} alt={store.name} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <div className="flex flex-col sm:flex-row items-start gap-5 mb-6">
              {store.logo_url ? (
                <img
                  src={store.logo_url}
                  alt={store.name}
                  className="w-24 h-24 rounded-xl object-cover border-4 border-white shadow-lg shrink-0"
                />
              ) : (
                <div className="w-24 h-24 rounded-xl bg-slate-200 flex items-center justify-center shrink-0">
                  <Store className="w-8 h-8 text-slate-500" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h1 className="text-3xl font-bold mb-2">{store.name}</h1>
                <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-slate-600">
                  <span>{store.total_visits} visitas</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
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
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                      ⭐ Destacada
                    </span>
                  )}
                </div>

                {store.description && (
                  <p className="text-slate-700 whitespace-pre-line">{store.description}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {store.location && (
                <div className="rounded-lg bg-white border border-slate-200 p-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-600">Ubicación</p>
                      <p className="font-medium">{store.location}</p>
                    </div>
                  </div>
                </div>
              )}

              {store.whatsapp && (
                <div className="rounded-lg bg-white border border-slate-200 p-4">
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-600">WhatsApp</p>
                      <p className="font-medium">{store.whatsapp}</p>
                    </div>
                  </div>
                </div>
              )}

              {store.schedule && (
                <div className="sm:col-span-2 rounded-lg bg-white border border-slate-200 p-4">
                  <p className="text-sm text-slate-600 mb-1">Horario de atención</p>
                  <div className="font-medium whitespace-pre-line text-sm">{store.schedule}</div>
                </div>
              )}
            </div>

            {whatsappUrl && (
              <Button asChild className="mb-2">
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contactar por WhatsApp
                </a>
              </Button>
            )}
          </div>

          <div className="space-y-4">
            <Card className="p-4">
              <p className="text-sm text-slate-600 mb-2">Productos</p>
              <p className="text-2xl font-bold">{products.length}</p>
            </Card>

            <Card className="p-4">
              <p className="text-sm text-slate-600 mb-2">Visitas</p>
              <p className="text-2xl font-bold">{store.total_visits}</p>
            </Card>
          </div>
        </div>

        {galleryImages.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Galería</h2>

            <div className="space-y-4">
              <div className="bg-slate-200 rounded-lg overflow-hidden h-72 md:h-96">
                <img
                  src={selectedImage || galleryImages[0]}
                  alt={store.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {galleryImages.length > 1 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {galleryImages.map((imageUrl, index) => {
                    const active = selectedImage === imageUrl;
                    return (
                      <button
                        key={`${imageUrl}-${index}`}
                        onClick={() => setSelectedImage(imageUrl)}
                        className={`relative rounded-lg overflow-hidden h-24 border-2 transition-all ${
                          active ? "border-blue-600" : "border-slate-200 hover:border-slate-400"
                        }`}
                      >
                        <img
                          src={imageUrl}
                          alt={`${store.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-2xl font-bold mb-6">Productos</h2>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product: any) => {
                const firstImage = product.images?.[0]?.url;
                const finalPrice = product.offer_price || product.price;

                return (
                  <Link key={product.id} href={`/product/${product.slug}`}>
                    <div className="cursor-pointer">
                      <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                        <div className="relative aspect-square bg-slate-100 overflow-hidden">
                          {firstImage ? (
                            <img
                              src={firstImage}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              Sin imagen
                            </div>
                          )}

                          {product.offer_price && (
                            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                              Oferta
                            </div>
                          )}
                        </div>

                        <CardContent className="p-4">
                          <h3 className="font-semibold text-lg mb-2 line-clamp-2 min-h-[3.5rem]">
                            {product.name}
                          </h3>

                          {product.description ? (
                            <p className="text-sm text-slate-600 mb-3 line-clamp-2 min-h-[2.5rem]">
                              {product.description}
                            </p>
                          ) : (
                            <div className="mb-3 min-h-[2.5rem]" />
                          )}

                          <div className="mb-3">
                            {product.offer_price ? (
                              <div className="flex flex-col">
                                <span className="text-2xl font-bold text-blue-600">
                                  S/ {finalPrice}
                                </span>
                                <span className="text-sm text-slate-500 line-through">
                                  S/ {product.price}
                                </span>
                              </div>
                            ) : (
                              <span className="text-2xl font-bold text-blue-600">
                                S/ {product.price}
                              </span>
                            )}
                          </div>

                          <div className="mb-4">
                            <span
                              className={`text-sm font-medium ${
                                product.stock > 0 ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {product.stock > 0 ? `${product.stock} disponibles` : "Agotado"}
                            </span>
                          </div>

                          <Button className="w-full" variant="outline">
                            Ver producto
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </Link>
                );
              })}
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
