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
        <h2 className="mt-3 font-display text-xl font-bold">Request received</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          We'll reply within one working day with availability and the landed
          price. If it's urgent, call us instead.
        </p>
        <Button variant="outline" className="mt-6" onClick={() => setSent(false)}>
          Send another request
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
          <Label htmlFor="name">Your name</Label>
          <Input id="name" name="name" required autoComplete="name" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" type="tel" required autoComplete="tel" />
        </div>
      </div>

      <div className="mt-5 grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>

      <div className="mt-5 grid gap-2">
        <Label htmlFor="car">Car you're after</Label>
        <Input
          id="car"
          name="car"
          defaultValue={presetCar ?? ''}
          placeholder="BMW X5, or tell us the type you need"
        />
      </div>

      <div className="mt-5 grid gap-2">
        <Label htmlFor="budget">Budget in euro</Label>
        <Input id="budget" name="budget" inputMode="numeric" placeholder="35000" />
      </div>

      <div className="mt-5 grid gap-2">
        <Label htmlFor="message">Anything else</Label>
        <Textarea id="message" name="message" rows={5}
          placeholder="Colour, trim, timing — whatever matters to you." />
      </div>

      <Button type="submit" size="lg" className="mt-7">Send request</Button>
      <p className="mt-3 text-xs text-muted-foreground">
        We use your details only to answer this request.
      </p>
    </form>
  );
}
