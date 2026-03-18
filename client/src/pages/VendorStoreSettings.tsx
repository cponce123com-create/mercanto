import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ImageUpload";
import { Loader2, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";

export default function VendorStoreSettings() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    whatsapp: "",
    location: "",
    schedule: "",
  });

  // Queries
  const { data: store } = trpc.stores.getMyStore.useQuery();

  // Mutations
  const updateStore = trpc.stores.updateStore.useMutation({
    onSuccess: () => {
      toast.success("Tienda actualizada correctamente");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const uploadLogo = trpc.upload.uploadStoreLogo.useMutation({
    onSuccess: () => {
      toast.success("Logo subido correctamente");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const uploadBanner = trpc.upload.uploadStoreBanner.useMutation({
    onSuccess: () => {
      toast.success("Banner subido correctamente");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const uploadGallery = trpc.upload.uploadStoreGalleryImage.useMutation({
    onSuccess: () => {
      toast.success("Imagen de galería subida correctamente");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteGalleryImage = trpc.upload.deleteStoreGalleryImage.useMutation({
    onSuccess: () => {
      toast.success("Imagen eliminada");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Load store data
  useEffect(() => {
    if (store) {
      setFormData({
        name: store.name || "",
        description: store.description || "",
        whatsapp: store.whatsapp || "",
        location: store.location || "",
        schedule: store.schedule || "",
      });
    }
  }, [store]);

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

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      updateStore.mutate({
        name: formData.name,
        description: formData.description,
        whatsapp: formData.whatsapp,
        location: formData.location,
        schedule: formData.schedule,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Configuración de Tienda</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Logo and Banner */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Logo y Banner</h2>

            <div className="space-y-6">
              {/* Logo */}
              <div>
                <label className="block text-sm font-medium mb-3">Logo de Tienda</label>
                {store.logo_url && (
                  <div className="mb-4">
                    <img
                      src={store.logo_url}
                      alt="Logo"
                      className="w-32 h-32 object-cover rounded-lg border border-slate-200"
                    />
                  </div>
                )}
                <ImageUpload
                  onUpload={async (file, mimeType) => {
                    const base64 = Buffer.from(file).toString("base64");
                    await uploadLogo.mutateAsync({
                      file: base64,
                      mimeType,
                    });
                  }}
                  isLoading={uploadLogo.isPending}
                />
              </div>

              {/* Banner */}
              <div>
                <label className="block text-sm font-medium mb-3">Banner de Tienda</label>
                {store.banner_url && (
                  <div className="mb-4">
                    <img
                      src={store.banner_url}
                      alt="Banner"
                      className="w-full h-40 object-cover rounded-lg border border-slate-200"
                    />
                  </div>
                )}
                <ImageUpload
                  onUpload={async (file, mimeType) => {
                    const base64 = Buffer.from(file).toString("base64");
                    await uploadBanner.mutateAsync({
                      file: base64,
                      mimeType,
                    });
                  }}
                  isLoading={uploadBanner.isPending}
                />
              </div>
            </div>
          </Card>

          {/* Store Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Información de Tienda</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre de Tienda</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Mi Tienda"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe tu tienda..."
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  WhatsApp
                </label>
                <Input
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  placeholder="+1234567890"
                />
              </div>

              <Button type="submit" disabled={updateStore.isPending || isLoading}>
                {updateStore.isPending || isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar Cambios"
                )}
              </Button>
            </form>
          </Card>

          {/* Location and Schedule */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Ubicación y Horario
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Ubicación</label>
                <Textarea
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Dirección completa o descripción de ubicación"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Horario de Atención</label>
                <Textarea
                  value={formData.schedule}
                  onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                  placeholder="Lunes a Viernes: 9:00 - 18:00\nSábado: 10:00 - 16:00\nDomingo: Cerrado"
                  rows={4}
                />
              </div>

              <Button type="submit" disabled={updateStore.isPending || isLoading}>
                {updateStore.isPending || isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar Información"
                )}
              </Button>
            </form>
          </Card>
        </div>

        {/* Sidebar - Gallery */}
        <div>
          <Card className="p-6 sticky top-8">
            <h2 className="text-xl font-semibold mb-4">Galería de Tienda</h2>
            <p className="text-sm text-slate-600 mb-4">Máximo 5 imágenes</p>

            {store.gallery && store.gallery.length > 0 && (
              <div className="space-y-3 mb-6">
                {store.gallery.map((image) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.url}
                      alt="Gallery"
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => {
                        if (confirm("¿Eliminar esta imagen?")) {
                          deleteGalleryImage.mutate({ imageId: image.id });
                        }
                      }}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center text-white text-sm font-medium"
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            )}

            {store.gallery && store.gallery.length < 5 && (
              <ImageUpload
                onUpload={async (file, mimeType) => {
                  const base64 = Buffer.from(file).toString("base64");
                  await uploadGallery.mutateAsync({
                    file: base64,
                    mimeType,
                  });
                }}
                isLoading={uploadGallery.isPending}
              />
            )}

            {store.gallery && store.gallery.length >= 5 && (
              <div className="p-4 bg-slate-100 rounded-lg text-center text-sm text-slate-600">
                Galería completa (5/5 imágenes)
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
