import CustomsCalculator from '@/components/CustomsCalculator';

export const metadata = {
  title: 'Kalkulatori i Doganës',
  description:
    'Llogaritni doganën për importin e një veture në Kosovë: akciza, tatimi në import dhe TVSH-ja.',
};

export default function CalculatorPage() {
  return (
    <>
      <section className="bg-ink px-5 py-16 md:px-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="font-display text-3xl font-extrabold text-paper md:text-5xl">
            Kalkulatori i Doganës
          </h1>
          <p className="mt-4 max-w-xl text-lg text-mist">
            Sa kushton zhdoganimi i veturës në Kosovë? Shkruani vlerën, vitin dhe
            kubikazhën, dhe shihni menjëherë akcizën, tatimin në import dhe TVSH-në.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-14 md:px-8">
        <CustomsCalculator />
      </div>
    </>
  );
}
