// src/app/checkout/[linkId]/page.tsx
import { createApiRoot } from '@/lib/commercetools/create.client';
import { CheckoutDisplay } from '@/components/CheckoutDisplay';
import { Suspense } from 'react';
import { CartData } from '@/types/commercetools';

export default async function CheckoutPage({ 
  params 
}: { 
  params: Promise<{ linkId: string }> 
}) {
  const resolvedParams = await params;
  
  try {
    const response = await createApiRoot()
      .carts()
      .get({
        queryArgs: {
          where: `custom(fields(linkId="${resolvedParams.linkId}"))`,
          limit: 1
        }
      })
      .execute();

      const cart = response.body.results[0];

    if (!response.body.results.length) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Cart Not Found</h1>
            <p className="text-gray-500">The requested cart could not be found.</p>
          </div>
        </div>
      );
    }

    return (
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">Loading checkout...</h2>
          </div>
        </div>
      }>
        {/* @ts-expect-error Server Component */}
        <CheckoutDisplay cart={cart as CartData} />
      </Suspense>
    );
  } catch (error) {
    console.error('Error loading cart:', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Error</h1>
          <p className="text-gray-500">Failed to load checkout data.</p>
        </div>
      </div>
    );
  }
}