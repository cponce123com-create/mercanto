import { useMemo, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ImageUpload";
import {
  Loader2,
  Plus,
  Edit2,
  Trash2,
  Search,
  Package,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";

export default function VendorProducts() {
  const { user } = useAuth();

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category_id: "",
  });

  const utils = trpc.useUtils();

  const { data: myProducts = [], isLoading: productsLoading } = trpc.products.getMyProducts.useQuery();
  const { data: categories = [] } = trpc.categories.list.useQuery();

  const createProduct = trpc.products.create.useMutation({
    onSuccess: async () => {
      toast.success("Producto creado");
      setFormData({ name: "", description: "", price: "", category_id: "" });
      setIsCreating(false);
      setEditingId(null);
      await utils.products.getMyProducts.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateProduct = trpc.products.update.useMutation({
    onSuccess: async () => {
      toast.success("Producto actualizado");
      setEditingId(null);
      setIsCreating(false);
      setFormData({ name: "", description: "", price: "", category_id: "" });
      await utils.products.getMyProducts.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteProductMutation = trpc.products.delete.useMutation({
    onSuccess: async () => {
      toast.success("Producto eliminado");
      await utils.products.getMyProducts.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const uploadImage = trpc.upload.uploadProductImage.useMutation({
    onSuccess: async () => {
      toast.success("Imagen subida correctamente");
      await utils.products.getMyProducts.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return myProducts;

    return myProducts.filter((product) => {
      return (
        product.name.toLowerCase().includes(q) ||
        (product.description?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [myProducts, searchQuery]);

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

  const resetForm = () => {
    setIsCreating(false);
    setEditingId(null);
    setFormData({ name: "", description: "", price: "", category_id: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.category_id) {
      toast.error("Completa todos los campos requeridos");
      return;
    }

    if (editingId) {
      updateProduct.mutate({
        productId: editingId,
        name: formData.name,
        description: formData.description,
        price: formData.price,
      });
    } else {
      createProduct.mutate({
        name: formData.name,
        description: formData.description,
        price: formData.price,
        categoryId: parseInt(formData.category_id, 10),
      });
    }
  };

  return (
    <div className="container py-6 md:py-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Mis Productos</h1>
          <p className="text-slate-600 mt-1">
            Administra tu catálogo, imágenes y publicaciones
          </p>
        </div>

        <Button
          onClick={() => {
            if (isCreating) {
              resetForm();
            } else {
              setIsCreating(true);
              setEditingId(null);
              setFormData({ name: "", description: "", price: "", category_id: "" });
            }
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          {isCreating ? "Cerrar formulario" : "Nuevo Producto"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="p-4">
          <p className="text-sm text-slate-600 mb-1">Total de productos</p>
          <p className="text-2xl font-bold">{myProducts.length}</p>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-slate-600 mb-1">Con imágenes</p>
          <p className="text-2xl font-bold">
            {myProducts.filter((p) => (p.images?.length || 0) > 0).length}
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-slate-600 mb-1">Pendientes de imagen</p>
          <p className="text-2xl font-bold">
            {myProducts.filter((p) => (p.images?.length || 0) === 0).length}
          </p>
        </Card>
      </div>

      {isCreating && (
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? "Editar Producto" : "Crear Producto"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nombre del producto"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Descripción</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción del producto"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Precio</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Categoría</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white"
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button type="submit" disabled={createProduct.isPending || updateProduct.isPending}>
                {createProduct.isPending || updateProduct.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar"
                )}
              </Button>

              <Button type="button" variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre o descripción..."
            className="pl-9"
          />
        </div>
      </Card>

      {productsLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : filteredProducts.length > 0 ? (
        <>
          <div className="mb-4 text-sm text-slate-600">
            Mostrando <span className="font-semibold">{filteredProducts.length}</span> productos
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const firstImage = product.images?.[0]?.url;
              const imageCount = product.images?.length || 0;

              return (
                <Card key={product.id} className="overflow-hidden h-full">
                  <div className="aspect-square bg-slate-100 flex items-center justify-center overflow-hidden">
                    {firstImage ? (
                      <img
                        src={firstImage}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="text-slate-400 flex flex-col items-center gap-2">
                        <Package className="w-8 h-8" />
                        <span>Sin imagen</span>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-semibold text-lg line-clamp-2">{product.name}</h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                          product.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {product.status}
                      </span>
                    </div>

                    {product.description ? (
                      <p className="text-sm text-slate-600 mb-3 line-clamp-2 min-h-[2.5rem]">
                        {product.description}
                      </p>
                    ) : (
                      <div className="mb-3 min-h-[2.5rem]" />
                    )}

                    <div className="flex items-center justify-between mb-3">
                      <p className="text-2xl font-bold text-blue-600">S/ {product.price}</p>
                      <span className="text-sm text-slate-500">{product.stock} stock</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                      <ImageIcon className="w-4 h-4" />
                      <span>{imageCount}/5 imágenes</span>
                    </div>

                    {imageCount < 5 && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Agregar imagen</label>
                        <ImageUpload
                          onUpload={async (file, mimeType) => {
                            const base64 = Buffer.from(file).toString("base64");
                            await uploadImage.mutateAsync({
                              productId: product.id,
                              file: base64,
                              mimeType,
                            });
                          }}
                          isLoading={uploadImage.isPending}
                        />
                      </div>
                    )}

                    <div className="flex gap-2 flex-wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setIsCreating(true);
                          setEditingId(product.id);
                          setFormData({
                            name: product.name,
                            description: product.description || "",
                            price: product.price.toString(),
                            category_id: product.category_id.toString(),
                          });
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      >
                        <Edit2 className="w-4 h-4 mr-1" />
                        Editar
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          if (confirm("¿Eliminar este producto?")) {
                            deleteProductMutation.mutate({ productId: product.id });
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Eliminar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-slate-600 mb-4">
            {searchQuery ? "No se encontraron productos con ese criterio" : "No tienes productos aún"}
          </p>
          {!searchQuery && (
            <Button onClick={() => setIsCreating(true)}>Crear tu primer producto</Button>
          )}
        </Card>
      )}
    </div>
  );
}
