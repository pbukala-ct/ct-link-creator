// src/components/CheckoutDisplay.tsx
"use client";

import { useState, useEffect } from 'react';
import { checkoutFlow } from '@commercetools/checkout-browser-sdk';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface CheckoutDisplayProps {
  cart: any;
}

export function CheckoutDisplay({ cart }: CheckoutDisplayProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initCheckout = async () => {
      try {
        // First create a checkout session
        const sessionResponse = await fetch('/api/checkout/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ cartId: cart.id }),
        });

        if (!sessionResponse.ok) {
          throw new Error('Failed to create checkout session');
        }

        const sessionData = await sessionResponse.json();

        // Initialize checkout flow with session ID
        await checkoutFlow({
          projectKey: process.env.CTP_PROJECT_KEY!,
          region: process.env.CTP_REGION!,
          sessionId: sessionData.id, // Using the session ID from the API
          locale: 'en-AU',
          logInfo: true,
          logWarn: true,
          logError: true,
          container: '#checkout-container'
        });

        setIsLoading(false);
      } catch (err) {
        console.error('Error initializing checkout:', err);
        setError('Failed to initialize checkout');
        setIsLoading(false);
      }
    };

    initCheckout();
  }, [cart.id]);

  // ... rest of the component remains the same
}