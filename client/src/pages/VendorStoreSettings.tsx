import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ImageUpload";
import {
  Loader2,
  MapPin,
  Phone,
  Store,
  Image as ImageIcon,
  LayoutPanelTop,
} from "lucide-react";
import { toast } from "sonner";

export default function VendorStoreSettings() {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    whatsapp: "",
    location: "",
    schedule: "",
  });

  const utils = trpc.useUtils();

  const { data: store, isLoading: storeLoading, error: storeError } = trpc.stores.getMyStore.useQuery(undefined, {
    retry: false,
  });

  const updateStore = trpc.stores.updateStore.useMutation({
    onSuccess: async () => {
      toast.success("Tienda actualizada correctamente");
      await utils.stores.getMyStore.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const uploadLogo = trpc.upload.uploadStoreLogo.useMutation({
    onSuccess: async () => {
      toast.success("Logo subido correctamente");
      await utils.stores.getMyStore.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const uploadBanner = trpc.upload.uploadStoreBanner.useMutation({
    onSuccess: async () => {
      toast.success("Banner subido correctamente");
      await utils.stores.getMyStore.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const uploadGallery = trpc.upload.uploadStoreGalleryImage.useMutation({
    onSuccess: async () => {
      toast.success("Imagen de galería subida correctamente");
      await utils.stores.getMyStore.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteGalleryImage = trpc.upload.deleteStoreGalleryImage.useMutation({
    onSuccess: async () => {
      toast.success("Imagen eliminada");
      await utils.stores.getMyStore.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

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

  const galleryCount = useMemo(() => store?.gallery?.length || 0, [store]);

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

  if (storeError) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-red-600 font-semibold">Error al cargar la tienda</p>
        <p className="text-slate-600 text-sm">{storeError.message}</p>
        <Button onClick={() => window.location.href = "/profile"}>
          Volver al perfil
        </Button>
      </div>
    );
  }

  if (storeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-slate-600">No se encontró la tienda asociada a tu cuenta.</p>
        <Button onClick={() => window.location.href = "/profile"}>
          Ir a crear tienda
        </Button>
      </div>
    );
  }

  const isSaving = updateStore.isPending;
  const isUploadingSomething =
    uploadLogo.isPending || uploadBanner.isPending || uploadGallery.isPending;

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();

    updateStore.mutate({
      name: formData.name,
      description: formData.description,
      whatsapp: formData.whatsapp,
      location: formData.location,
      schedule: formData.schedule,
    });
  };

  return (
    <div className="container py-6 md:py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Configuración de Tienda</h1>
        <p className="text-slate-600">
          Actualiza la información, imágenes y presentación de tu tienda
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <LayoutPanelTop className="w-5 h-5" />
              Logo y Banner
            </h2>

            <div className="space-y-8">
              <div>
                <label className="block text-sm font-medium mb-3">Logo de tienda</label>

                {store.logo_url ? (
                  <div className="mb-4">
                    <img
                      src={store.logo_url}
                      alt="Logo"
                      className="w-28 h-28 object-cover rounded-xl border border-slate-200"
                    />
                  </div>
                ) : (
                  <div className="mb-4 w-28 h-28 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center">
                    <Store className="w-8 h-8 text-slate-400" />
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

              <div>
                <label className="block text-sm font-medium mb-3">Banner de tienda</label>

                {store.banner_url ? (
                  <div className="mb-4">
                    <img
                      src={store.banner_url}
                      alt="Banner"
                      className="w-full h-44 md:h-52 object-cover rounded-xl border border-slate-200"
                    />
                  </div>
                ) : (
                  <div className="mb-4 w-full h-44 md:h-52 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center">
                    <LayoutPanelTop className="w-8 h-8 text-slate-400" />
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

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Información general</h2>

            <form onSubmit={handleSaveAll} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre de tienda</label>
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
                  rows={5}
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
                  placeholder="+51999999999"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Ubicación
                </label>
                <Textarea
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Dirección completa o referencia"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Horario de atención</label>
                <Textarea
                  value={formData.schedule}
                  onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                  placeholder={"Lunes a Viernes: 9:00 - 18:00\nSábado: 10:00 - 16:00\nDomingo: Cerrado"}
                  rows={4}
                />
              </div>

              <div className="flex gap-3 flex-wrap">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar cambios"
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        <div>
          <div className="sticky top-8 space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Galería de tienda
              </h2>

              <p className="text-sm text-slate-600 mb-4">Máximo 5 imágenes</p>

              <div className="mb-4 grid grid-cols-2 gap-3">
                <CardContent className="p-4 border rounded-xl">
                  <p className="text-xs text-slate-500 mb-1">Actual</p>
                  <p className="text-xl font-bold">{galleryCount}/5</p>
                </CardContent>

                <CardContent className="p-4 border rounded-xl">
                  <p className="text-xs text-slate-500 mb-1">Disponible</p>
                  <p className="text-xl font-bold">{Math.max(0, 5 - galleryCount)}</p>
                </CardContent>
              </div>

              {store.gallery && store.gallery.length > 0 && (
                <div className="space-y-3 mb-6">
                  {store.gallery.map((image) => (
                    <div key={image.id} className="relative group">
                      <img
                        src={image.url}
                        alt="Galería"
                        className="w-full h-24 object-cover rounded-lg border border-slate-200"
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

              {galleryCount < 5 ? (
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
              ) : (
                <div className="p-4 bg-slate-100 rounded-lg text-center text-sm text-slate-600">
                  Galería completa (5/5 imágenes)
                </div>
              )}
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Estado de tienda</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Estado</span>
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
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Visitas</span>
                  <span className="font-semibold">{store.total_visits}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Destacada</span>
                  <span className="font-semibold">{store.is_featured ? "Sí" : "No"}</span>
                </div>
              </div>
            </Card>

            {isUploadingSomething && (
              <Card className="p-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Subiendo archivos...
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
