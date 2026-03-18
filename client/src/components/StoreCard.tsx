import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MapPin, MessageCircle, Store, Eye, Sparkles } from "lucide-react";
import { useLocation } from "wouter";

interface StoreCardProps {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  logo_url?: string | null;
  banner_url?: string | null;
  location?: string | null;
  whatsapp?: string | null;
  total_visits: number;
  is_featured?: boolean;
  demoMode?: boolean;
}

export function StoreCard({
  slug,
  name,
  description,
  logo_url,
  banner_url,
  location,
  whatsapp,
  total_visits,
  is_featured,
  demoMode = false,
}: StoreCardProps) {
  const [, setLocation] = useLocation();

  const handleOpenStore = () => {
    if (demoMode) return;
    setLocation(`/store/${slug}`);
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!whatsapp) return;

    const cleanPhone = whatsapp.replace(/\D/g, "");
    const message = encodeURIComponent(`Hola, me interesa conocer más sobre tu tienda ${name}`);
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, "_blank");
  };

  return (
    <div
      onClick={handleOpenStore}
      className={`${demoMode ? "cursor-default" : "cursor-pointer"} h-full`}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 h-full flex flex-col border-slate-200">
        <div className="relative h-40 bg-slate-100 overflow-hidden">
          {banner_url ? (
            <img
              src={banner_url}
              alt={name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-100 via-indigo-50 to-white" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent" />

          <div className="absolute left-4 bottom-4">
            {logo_url ? (
              <img
                src={logo_url}
                alt={name}
                className="w-20 h-20 object-cover rounded-2xl border-4 border-white shadow-lg bg-white"
                loading="lazy"
              />
            ) : (
              <div className="w-20 h-20 bg-white rounded-2xl border-4 border-white shadow-lg flex items-center justify-center">
                <Store className="w-8 h-8 text-slate-500" />
              </div>
            )}
          </div>

          {is_featured && (
            <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-950 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Destacada
            </div>
          )}

          {demoMode && (
            <div className="absolute top-3 left-3 bg-white/90 text-slate-800 px-3 py-1 rounded-full text-xs font-semibold">
              Demo visual
            </div>
          )}
        </div>

        <CardContent className="p-4 flex-1 flex flex-col">
          <h3 className="font-bold text-lg mb-1 line-clamp-1 text-slate-900">{name}</h3>

          <div className="flex items-center gap-2 mb-3 text-sm text-slate-600 flex-wrap">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>4.8</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{total_visits} visitas</span>
            </div>
          </div>

          {description ? (
            <p className="text-sm text-slate-600 mb-3 line-clamp-2 min-h-[2.5rem]">
              {description}
            </p>
          ) : (
            <div className="mb-3 min-h-[2.5rem]" />
          )}

          {location ? (
            <div className="flex items-start gap-2 mb-4 text-sm min-h-[2.5rem]">
              <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <span className="text-slate-700 line-clamp-2">{location}</span>
            </div>
          ) : (
            <div className="mb-4 min-h-[2.5rem]" />
          )}

          <div className="flex gap-2 pt-3 border-t mt-auto">
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenStore();
              }}
              disabled={demoMode}
            >
              {demoMode ? "Próximamente" : "Ver tienda"}
            </Button>

            {whatsapp && (
              <Button
                size="sm"
                onClick={handleWhatsApp}
                className="flex-1 flex items-center justify-center gap-1"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
