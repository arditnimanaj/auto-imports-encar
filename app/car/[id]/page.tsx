import ClientVehicle from '@/components/ClientVehicle';
import { getRate } from '@/lib/fx';

export const metadata = { title: 'Detajet e veturës' };

/** The car is fetched in the browser; see app/page.tsx for why. */
export default async function CarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rate = await getRate();

  return (
    <ClientVehicle
      id={id}
      rate={rate.krwToEur}
    />
  );
}
