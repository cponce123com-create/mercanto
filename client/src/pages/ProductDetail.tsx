import { useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, Heart, ShoppingCart, MessageCircle } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
import { toast } from "sonner";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { user, isAuthenticated } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  const { data: product, isLoading } = trpc.products.getBySlug.useQuery({
    slug: slug || "",
  });

  const addFavoriteMutation = trpc.favorites.add.useMutation();
  const removeFavoriteMutation = trpc.favorites.remove.useMutation();

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error("Debes ingresar para agregar favoritos");
      return;
    }

    if (isFavorite) {
      await removeFavoriteMutation.mutateAsync({
        productId: product?.id,
      });
    } else {
      await addFavoriteMutation.mutateAsync({
        productId: product?.id,
      });
    }

    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? "Removido de favoritos" : "Agregado a favoritos");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto px-4 py-8">
          <Link href="/">
            <a className="text-blue-600 hover:text-blue-700 flex items-center gap-1 mb-4">
              <ChevronLeft className="w-5 h-5" />
              Volver
            </a>
          </Link>
          <div className="text-center py-12">
            <p className="text-slate-600">Producto no encontrado</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <Link href="/">
            <a className="text-blue-600 hover:text-blue-700 flex items-center gap-1">
              <ChevronLeft className="w-5 h-5" />
              Volver
            </a>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product Images */}
          <div className="lg:col-span-1">
            <Card className="overflow-hidden">
              <div className="bg-slate-200 h-96 flex items-center justify-center">
                <span className="text-slate-400">Sin imagen</span>
              </div>
            </Card>

            {/* Image Gallery */}
            {product.images && product.images.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-4">
                {product.images.map((image) => (
                  <div
                    key={image.id}
                    className="bg-slate-200 h-20 rounded flex items-center justify-center cursor-pointer hover:opacity-75"
                  >
                    <span className="text-xs text-slate-400">Img</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

              {product.description && (
                <p className="text-slate-600 mb-4">{product.description}</p>
              )}

              {/* Price */}
              <div className="mb-6">
                {product.offer_price ? (
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-bold text-green-600">
                      ${product.offer_price}
                    </span>
                    <span className="text-xl text-slate-500 line-through">
                      ${product.price}
                    </span>
                    <span className="text-sm font-semibold text-green-600 bg-green-100 px-2 py-1 rounded">
                      En oferta
                    </span>
                  </div>
                ) : (
                  <span className="text-4xl font-bold">${product.price}</span>
                )}
              </div>

              {/* Stock and Unit */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-slate-600">Stock</p>
                  <p className="text-lg font-semibold">
                    {product.stock > 0 ? `${product.stock} disponibles` : "Agotado"}
                  </p>
                </div>
                {product.unit && (
                  <div>
                    <p className="text-sm text-slate-600">Unidad</p>
                    <p className="text-lg font-semibold">{product.unit}</p>
                  </div>
                )}
              </div>

              {/* Store Info */}
              {product.store && (
                <Card className="mb-6">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {product.store.logo_url && (
                          <img
                            src={product.store.logo_url}
                            alt={product.store.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <p className="font-semibold">{product.store.name}</p>
                          <p className="text-xs text-slate-500">
                            {product.store.total_visits} visitas
                          </p>
                        </div>
                      </div>
                      <Link href={`/tienda/${product.store.slug}`}>
                        <Button variant="outline" size="sm">
                          Ver tienda
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Cantidad:</label>
                  <input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 px-3 py-2 border border-slate-300 rounded-md"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    size="lg"
                    disabled={product.stock === 0}
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
                    <Heart
                      className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`}
                    />
                  </Button>
                </div>

                {product.store?.whatsapp && (
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full"
                    asChild
                  >
                    <a
                      href={`https://wa.me/${product.store.whatsapp}?text=Hola, me interesa el producto: ${product.name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
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
