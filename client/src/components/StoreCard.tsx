import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MapPin, MessageCircle } from "lucide-react";
import { useLocation } from "wouter";

interface StoreCardProps {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  logo_url?: string | null;
  location?: string | null;
  whatsapp?: string | null;
  total_visits: number;
  is_featured?: boolean;
}

export function StoreCard({
  slug,
  name,
  description,
  logo_url,
  location,
  whatsapp,
  total_visits,
  is_featured,
}: StoreCardProps) {
  const [, setLocation] = useLocation();

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    if (whatsapp) {
      const message = encodeURIComponent(`Hola, me interesa conocer más sobre tu tienda ${name}`);
      window.open(`https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${message}`, "_blank");
    }
  };

  return (
    <div onClick={() => setLocation(`/store/${slug}`)} className="cursor-pointer">
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
        {/* Header with logo */}
        <div className="relative h-32 bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center overflow-hidden">
          {logo_url ? (
            <img
              src={logo_url}
              alt={name}
              className="w-20 h-20 object-cover rounded-full border-4 border-white shadow-md"
            />
          ) : (
            <div className="w-20 h-20 bg-slate-300 rounded-full border-4 border-white flex items-center justify-center text-slate-600 font-bold text-2xl">
              {name.charAt(0)}
            </div>
          )}

          {is_featured && (
            <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
              ⭐ Destacada
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-bold text-lg mb-1 line-clamp-1">{name}</h3>

          {/* Rating and visits */}
          <div className="flex items-center gap-2 mb-2 text-sm text-slate-600">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>4.8</span>
            </div>
            <span>•</span>
            <span>{total_visits} visitas</span>
          </div>

          {/* Description */}
          {description && (
            <p className="text-sm text-slate-600 mb-3 line-clamp-2 flex-1">
              {description}
            </p>
          )}

          {/* Location */}
          {location && (
            <div className="flex items-start gap-2 mb-3 text-sm">
              <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <span className="text-slate-700 line-clamp-1">{location}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-3 border-t">
            <Button size="sm" variant="outline" className="flex-1" onClick={(e) => {
              e.stopPropagation();
              setLocation(`/store/${slug}`);
            }}>
              Ver Tienda
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
        </div>
      </Card>
    </div>
  );
}
