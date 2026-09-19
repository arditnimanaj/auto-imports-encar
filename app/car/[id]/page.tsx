import { notFound } from 'next/navigation';
import CarDetail from '@/components/CarDetail';
import ClientVehicle from '@/components/ClientVehicle';
import { getVehicle } from '@/lib/encar';
import { getRate } from '@/lib/fx';
import { makeEn, modelEn } from '@/lib/i18n';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await getVehicle(id);
  if (res.status !== 'ok') return { title: 'Car details' };
  const c = res.car.category;
  return {
    title: `${c.manufacturerEnglishName || makeEn(c.manufacturerName)} `
      + `${c.modelGroupEnglishName || modelEn(c.modelName)}`,
  };
}

export default async function CarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [res, rate] = await Promise.all([getVehicle(id), getRate()]);

  // Only a genuine 404 from Encar means the listing is gone. Being refused is
  // a different thing, and must not be shown to a buyer as "not found".
  if (res.status === 'missing') notFound();

  if (res.status === 'unavailable') {
    return (
      <ClientVehicle
        id={id}
        rate={rate.krwToEur}
        live={rate.live}
        rateUpdated={rate.updated}
      />
    );
  }

  return (
    <CarDetail
      car={res.car}
      id={id}
      rate={rate.krwToEur}
      live={rate.live}
      rateUpdated={rate.updated}
    />
  );
}
