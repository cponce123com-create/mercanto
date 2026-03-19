import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronLeft,
  Loader2,
  Store,
  User,
  Phone,
  Mail,
  Shield,
  Building2,
  Settings,
} from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user, loading, refresh, logout } = useAuth({ redirectOnUnauthenticated: true });
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    avatar_url: user?.avatar_url || "",
  });

  const [storeData, setStoreData] = useState({
    storeName: "",
    description: "",
    mainCategoryId: "",
  });

  const { data: categories = [] } = trpc.categories.list.useQuery();
  const { data: myStore, isLoading: storeLoading } = trpc.stores.getMyStore.useQuery(undefined, {
    retry: false,
    enabled: user?.role === "vendor" || user?.role === "admin",
  });

  const updateProfile = trpc.user.updateProfile.useMutation({
    onSuccess: async () => {
      toast.success("Perfil actualizado");
      await utils.auth.me.invalidate();
      await utils.user.getProfile.invalidate();
      await refresh();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const becomeVendor = trpc.user.becomeVendor.useMutation({
    onSuccess: async () => {
      toast.success("Ahora ya eres vendedor");
      await utils.auth.me.invalidate();
      await refresh();
      setLocation("/vendor");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const isVendor = user.role === "vendor" || user.role === "admin";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container py-6 md:py-8 max-w-5xl">
        <Link href="/">
          <span className="text-blue-600 hover:text-blue-700 flex items-center gap-1 mb-6 cursor-pointer">
            <ChevronLeft className="w-5 h-5" />
            Volver
          </span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-2xl bg-blue-100 flex items-center justify-center mb-4">
                  <User className="w-10 h-10 text-blue-600" />
                </div>

                <h1 className="text-2xl font-bold">{user.name || "Mi perfil"}</h1>
                <p className="text-slate-600 mt-1">{user.email}</p>

                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  <span className="px-3 py-1 rounded-full text-sm bg-slate-100 text-slate-700 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Rol: {user.role}
                  </span>

                  {isVendor ? (
                    <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-700 flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Tiene tienda
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-sm bg-amber-100 text-amber-800 flex items-center gap-2">
                      <Store className="w-4 h-4" />
                      Comprador
                    </span>
                  )}
                </div>

                <div className="w-full mt-6 space-y-3">
                  {user.role === "admin" ? (
                    <>
                      <Button className="w-full" onClick={() => setLocation("/admin")}>
                        Panel de Administracion
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setLocation("/vendor")}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Mi Panel de Vendedor
                      </Button>
                    </>
                  ) : isVendor ? (
                    <>
                      <Button className="w-full" onClick={() => setLocation("/vendor")}>
                        Ir a mi panel
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setLocation("/vendor/store")}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Editar mi tienda
                      </Button>
                    </>
                  ) : null}

                  <Button variant="destructive" className="w-full" onClick={() => logout()}>
                    Cerrar sesión
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Mis datos</h2>

                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    updateProfile.mutate({
                      name: profileData.name.trim(),
                      phone: profileData.phone.trim(),
                      avatar_url: profileData.avatar_url.trim(),
                    });
                  }}
                >
                  <div>
                    <label className="block text-sm font-medium mb-2">Nombre</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <Input
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className="pl-9"
                        placeholder="Tu nombre"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Correo</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <Input value={user.email || ""} className="pl-9" disabled />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Teléfono</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <Input
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        className="pl-9"
                        placeholder="+51999999999"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Avatar URL</label>
                    <Input
                      value={profileData.avatar_url}
                      onChange={(e) =>
                        setProfileData({ ...profileData, avatar_url: e.target.value })
                      }
                      placeholder="https://..."
                    />
                  </div>

                  <Button type="submit" disabled={updateProfile.isPending}>
                    {updateProfile.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      "Guardar cambios"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {!isVendor && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-2">Convertirme en tienda</h2>
                  <p className="text-slate-600 mb-5">
                    Si quieres vender en Mercanto, desde aquí puedes convertir tu cuenta de comprador
                    en una tienda.
                  </p>

                  <form
                    className="space-y-4"
                    onSubmit={(e) => {
                      e.preventDefault();

                      if (!storeData.storeName.trim()) {
                        toast.error("Debes indicar el nombre de la tienda");
                        return;
                      }

                      becomeVendor.mutate({
                        storeName: storeData.storeName.trim(),
                        description: storeData.description.trim() || undefined,
                        mainCategoryId: storeData.mainCategoryId
                          ? parseInt(storeData.mainCategoryId, 10)
                          : undefined,
                      });
                    }}
                  >
                    <div>
                      <label className="block text-sm font-medium mb-2">Nombre de tu tienda</label>
                      <Input
                        value={storeData.storeName}
                        onChange={(e) =>
                          setStoreData({ ...storeData, storeName: e.target.value })
                        }
                        placeholder="Ej. Casa Urbana"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Descripción</label>
                      <Textarea
                        value={storeData.description}
                        onChange={(e) =>
                          setStoreData({ ...storeData, description: e.target.value })
                        }
                        placeholder="Describe tu tienda"
                        rows={4}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Categoría principal</label>
                      <select
                        value={storeData.mainCategoryId}
                        onChange={(e) =>
                          setStoreData({ ...storeData, mainCategoryId: e.target.value })
                        }
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

                    <Button type="submit" disabled={becomeVendor.isPending}>
                      {becomeVendor.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creando tienda...
                        </>
                      ) : (
                        "Convertirme en tienda"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {isVendor && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Mi tienda</h2>

                  {storeLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  ) : myStore ? (
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-slate-500">Nombre</span>
                        <p className="font-semibold">{myStore.name}</p>
                      </div>

                      {myStore.description && (
                        <div>
                          <span className="text-sm text-slate-500">Descripción</span>
                          <p>{myStore.description}</p>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 rounded-full text-sm bg-slate-100 text-slate-700">
                          Estado: {myStore.status}
                        </span>
                        <span className="px-3 py-1 rounded-full text-sm bg-slate-100 text-slate-700">
                          Visitas: {myStore.total_visits}
                        </span>
                      </div>

                      <Button className="mt-2" onClick={() => setLocation("/vendor/store")}>
                        Editar tienda
                      </Button>
                    </div>
                  ) : (
                    <p className="text-slate-600">Aún no se encontró la tienda asociada a tu cuenta.</p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
