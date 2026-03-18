import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ImageUpload";
import { Loader2, Plus, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function VendorProducts() {
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category_id: "",
  });

  // Queries
  const { data: myProducts, isLoading: productsLoading } = trpc.products.getMyProducts.useQuery();
  const { data: categories } = trpc.categories.list.useQuery();

  // Mutations
  const createProduct = trpc.products.create.useMutation({
    onSuccess: () => {
      toast.success("Producto creado");
      setFormData({ name: "", description: "", price: "", category_id: "" });
      setIsCreating(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateProduct = trpc.products.update.useMutation({
    onSuccess: () => {
      toast.success("Producto actualizado");
      setEditingId(null);
      setFormData({ name: "", description: "", price: "", category_id: "" });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteProductMutation = trpc.products.delete.useMutation({
    onSuccess: () => {
      toast.success("Producto eliminado");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const uploadImage = trpc.upload.uploadProductImage.useMutation({
    onSuccess: () => {
      toast.success("Imagen subida correctamente");
    },
    onError: (error) => {
      toast.error(error.message);
    },
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
        categoryId: parseInt(formData.category_id),
      });
    }
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Mis Productos</h1>
        <Button onClick={() => setIsCreating(!isCreating)}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Producto
        </Button>
      </div>

      {isCreating && (
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Crear Producto</h2>
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

            <div className="grid grid-cols-2 gap-4">
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
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                >
                  <option value="">Selecciona una categoría</option>
                  {categories?.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2">
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
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreating(false);
                  setEditingId(null);
                  setFormData({ name: "", description: "", price: "", category_id: "" });
                }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      )}

      {productsLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : myProducts && myProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="aspect-square bg-slate-100 flex items-center justify-center">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0].url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-slate-400">Sin imagen</span>
                )}
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                <p className="text-2xl font-bold text-blue-600 mb-4">${product.price}</p>

                {product.images && product.images.length < 5 && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Agregar Imagen</label>
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

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingId(product.id);
                      setFormData({
                        name: product.name,
                        description: product.description || "",
                        price: product.price.toString(),
                        category_id: product.category_id.toString(),
                      });
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
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-slate-600 mb-4">No tienes productos aún</p>
          <Button onClick={() => setIsCreating(true)}>Crear tu primer producto</Button>
        </Card>
      )}
    </div>
  );
}
