'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function ContactForm({ presetCar }: { presetCar?: string }) {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="rounded-lg border border-border bg-mist/50 p-8">
        <Check className="h-6 w-6 text-brass" aria-hidden />
        <h2 className="mt-3 font-display text-xl font-bold">Kërkesa u pranua</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Përgjigjemi brenda një dite pune me disponueshmërinë dhe çmimin e
          dorëzuar. Nëse është urgjente, na telefononi.
        </p>
        <Button variant="outline" className="mt-6" onClick={() => setSent(false)}>
          Dërgo kërkesë tjetër
        </Button>
      </div>
    );
  }

  return (
    <form
      className="max-w-xl"
      onSubmit={(e) => {
        e.preventDefault();
        // No backend yet -- wire this to an email service or route handler.
        setSent(true);
      }}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="name">Emri juaj</Label>
          <Input id="name" name="name" required autoComplete="name" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone">Telefoni</Label>
          <Input id="phone" name="phone" type="tel" required autoComplete="tel" />
        </div>
      </div>

      <div className="mt-5 grid gap-2">
        <Label htmlFor="email">Email-i</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>

      <div className="mt-5 grid gap-2">
        <Label htmlFor="car">Vetura që kërkoni</Label>
        <Input
          id="car"
          name="car"
          defaultValue={presetCar ?? ''}
          placeholder="BMW X5, ose na tregoni llojin që ju nevojitet"
        />
      </div>

      <div className="mt-5 grid gap-2">
        <Label htmlFor="budget">Buxheti në euro</Label>
        <Input id="budget" name="budget" inputMode="numeric" placeholder="35000" />
      </div>

      <div className="mt-5 grid gap-2">
        <Label htmlFor="message">Diçka tjetër</Label>
        <Textarea id="message" name="message" rows={5}
          placeholder="Ngjyra, pajisja, afati — çfarëdo që ka rëndësi për ju." />
      </div>

      <Button type="submit" size="lg" className="mt-7">Dërgo kërkesën</Button>
      <p className="mt-3 text-xs text-muted-foreground">
        Të dhënat tuaja i përdorim vetëm për t'iu përgjigjur kësaj kërkese.
      </p>
    </form>
  );
}
