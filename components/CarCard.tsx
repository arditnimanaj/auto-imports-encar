import CarPhoto from "@/components/CarPhoto";
import Link from "next/link";
import type { Car } from "@/lib/encar-shared";
import { carEur, eur, km, ym } from "@/lib/format";
import { fuelSq, makeSq, modelSq } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import CardTrust from "@/components/CardTrust";
import { landedEstimate } from "@/lib/customs";

export default function CarCard({
  car,
  rate,
  priority = false,
}: {
  car: Car;
  rate: number;
  priority?: boolean;
}) {
  const price = carEur(car.priceKrw, rate);
  // Search results carry no engine size, so this uses the smallest excise band
  // and reads "from"; the car page has the exact figure.
  const landed = price ? landedEstimate(price, car.year).total : null;

  return (
    <Link
      href={`/car/${car.id}`}
      prefetch={false}
      className="group block overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-4/3 overflow-hidden bg-mist">
        {car.imageUrl && (
          <CarPhoto
            src={car.imageUrl}
            alt={`${makeSq(car.make)} ${modelSq(car.model)}`}
            priority={priority}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        )}
        {car.mileageKm != null && car.mileageKm < 1000 && (
          <Badge className="absolute top-3 left-3 bg-ink text-paper">
            Pothuajse e re
          </Badge>
        )}
        <CardTrust id={car.id} />
      </div>

      <div className="p-4">
        <h3 className="truncate text-base font-semibold">
          {makeSq(car.make)} {modelSq(car.model)}
        </h3>
        <p className="mt-0.5 truncate text-sm text-muted-foreground">
          {modelSq(car.trim) || " "}
        </p>

        {car.priceOnRequest ? (
          <p className="mt-3 font-display text-lg font-semibold text-muted-foreground">
            Çmimi me kërkesë
          </p>
        ) : (
          <div className="mt-3">
            <p className="numeric font-display text-xl font-bold text-brass">
              {eur(price)}
            </p>
            {landed != null && (
              <p className="numeric mt-0.5 text-xs text-muted-foreground">
                Me doganë nga {eur(landed)}
              </p>
            )}
          </div>
        )}

        <dl className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-3 text-xs">
          <div>
            <dt className="text-muted-foreground">Viti</dt>
            <dd className="numeric font-medium">{ym(car.year, car.month)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Kilometrazhi</dt>
            <dd className="numeric font-medium">{km(car.mileageKm)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Karburanti</dt>
            <dd className="truncate font-medium">{fuelSq(car.fuel) || "—"}</dd>
          </div>
        </dl>
      </div>
    </Link>
  );
}
