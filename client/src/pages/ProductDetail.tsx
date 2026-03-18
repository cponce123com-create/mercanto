import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  ChevronLeft,
  Heart,
  ShoppingCart,
  MessageCircle,
  Minus,
  Plus,
  Store,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated } = useAuth();

  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { data: product, isLoading } = trpc.products.getBySlug.useQuery({
    slug: slug || "",
  });

  const addFavoriteMutation = trpc.favorites.add.useMutation();
  const removeFavoriteMutation = trpc.favorites.remove.useMutation();

  const galleryImages = useMemo(() => {
    if (!product?.images?.length) return [];
    return product.images.map((image) => image.url).filter(Boolean);
  }, [product]);

  useEffect(() => {
    if (galleryImages.length > 0) {
      setSelectedImage(galleryImages[0]);
    } else {
      setSelectedImage(null);
    }
  }, [galleryImages]);

  const finalPrice = product?.offer_price || product?.price;
  const stock = product?.stock ?? 0;

  const decreaseQty = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const increaseQty = () => {
    setQuantity((prev) => {
      if (!stock) return prev;
      return Math.min(stock, prev + 1);
    });
  };

  const onManualQtyChange = (value: string) => {
    const parsed = Number(value);
    if (!parsed || parsed < 1) {
      setQuantity(1);
      return;
    }

    if (stock > 0) {
      setQuantity(Math.min(stock, parsed));
      return;
    }

    setQuantity(parsed);
  };

  const handleToggleFavorite = async () => {
    if (!product?.id) return;

    if (!isAuthenticated) {
      toast.error("Debes ingresar para agregar favoritos");
      return;
    }

    try {
      if (isFavorite) {
        await removeFavoriteMutation.mutateAsync({
          productId: product.id,
        });
      } else {
        await addFavoriteMutation.mutateAsync({
          productId: product.id,
        });
      }

      setIsFavorite(!isFavorite);
      toast.success(isFavorite ? "Removido de favoritos" : "Agregado a favoritos");
    } catch {
      toast.error("No se pudo actualizar favoritos");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto px-4 py-8">
          <Link href="/">
            <span className="text-blue-600 hover:text-blue-700 flex items-center gap-1 mb-4 cursor-pointer">
              <ChevronLeft className="w-5 h-5" />
              Volver
            </span>
          </Link>

          <div className="text-center py-12">
            <p className="text-slate-600">Producto no encontrado</p>
          </div>
        </div>
      </div>
    );
  }

  const whatsappUrl = product.store?.whatsapp
    ? `https://wa.me/${product.store.whatsapp}?text=${encodeURIComponent(
        `Hola, me interesa el producto: ${product.name}`
      )}`
    : null;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <Link href="/">
            <span className="text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer">
              <ChevronLeft className="w-5 h-5" />
              Volver
            </span>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Galería */}
          <div>
            <Card className="overflow-hidden">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="w-full h-[320px] md:h-[420px] object-cover"
                />
              ) : (
                <div className="bg-slate-200 h-[320px] md:h-[420px] flex items-center justify-center">
                  <span className="text-slate-400">Sin imagen</span>
                </div>
              )}
            </Card>

            {galleryImages.length > 1 && (
              <div className="grid grid-cols-4 md:grid-cols-5 gap-2 mt-4">
                {galleryImages.map((imageUrl, index) => {
                  const active = selectedImage === imageUrl;
                  return (
                    <button
                      key={`${imageUrl}-${index}`}
                      type="button"
                      onClick={() => setSelectedImage(imageUrl)}
                      className={`rounded-md overflow-hidden border transition ${
                        active ? "border-blue-600 ring-2 ring-blue-200" : "border-slate-200"
                      }`}
                    >
                      <img
                        src={imageUrl}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-20 object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Información */}
          <div>
            <div className="bg-white rounded-lg border border-slate-200 p-5 md:p-6">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{product.name}</h1>

              {product.description && (
                <p className="text-slate-600 mb-5 whitespace-pre-line">{product.description}</p>
              )}

              <div className="mb-6">
                {product.offer_price ? (
                  <div className="flex flex-wrap items-end gap-3">
                    <span className="text-3xl md:text-4xl font-bold text-green-600">
                      S/ {product.offer_price}
                    </span>
                    <span className="text-lg text-slate-500 line-through">S/ {product.price}</span>
                    <span className="text-sm font-semibold text-green-700 bg-green-100 px-2 py-1 rounded">
                      Oferta
                    </span>
                  </div>
                ) : (
                  <span className="text-3xl md:text-4xl font-bold">S/ {finalPrice}</span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
                  <p className="text-sm text-slate-600">Stock</p>
                  <p className="text-lg font-semibold">
                    {stock > 0 ? `${stock} disponibles` : "Agotado"}
                  </p>
                </div>

                {product.unit && (
                  <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
                    <p className="text-sm text-slate-600">Unidad</p>
                    <p className="text-lg font-semibold">{product.unit}</p>
                  </div>
                )}
              </div>

              {product.store && (
                <Card className="mb-6">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        {product.store.logo_url ? (
                          <img
                            src={product.store.logo_url}
                            alt={product.store.name}
                            className="w-12 h-12 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                            <Store className="w-5 h-5 text-slate-500" />
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="font-semibold line-clamp-1">{product.store.name}</p>
                          <p className="text-xs text-slate-500">
                            {product.store.total_visits} visitas
                          </p>
                        </div>
                      </div>

                      <Link href={`/store/${product.store.slug}`}>
                        <Button variant="outline" size="sm">
                          Ver tienda
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-2">Cantidad</label>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={decreaseQty}
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>

                    <input
                      type="number"
                      min={1}
                      max={stock > 0 ? stock : undefined}
                      value={quantity}
                      onChange={(e) => onManualQtyChange(e.target.value)}
                      className="w-24 px-3 py-2 border border-slate-300 rounded-md text-center"
                    />

                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={increaseQty}
                      disabled={stock > 0 ? quantity >= stock : false}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    size="lg"
                    disabled={stock === 0}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Comprar
                  </Button>

                  <Button
                    size="lg"
                    variant={isFavorite ? "default" : "outline"}
                    onClick={handleToggleFavorite}
                  >
                    <Heart className={`w-5 h-5 mr-2 ${isFavorite ? "fill-current" : ""}`} />
                    {isFavorite ? "En favoritos" : "Agregar a favoritos"}
                  </Button>
                </div>

                {whatsappUrl && (
                  <Button size="lg" variant="outline" className="w-full" asChild>
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Contactar por WhatsApp
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
