// src/app/cart/[linkId]/page.tsx
import { createApiRoot } from '@/lib/commercetools/create.client';
import { CartDisplay } from '@/components/CartDisplay';
import { Suspense } from 'react';


interface PageProps {
  params: Promise<{ linkId: string }> | { linkId: string };
}

// Create a separate async function for data fetching
async function getCartData(linkId: string) {
  try {
    const response = await createApiRoot()
      .carts()
      .get({
        queryArgs: {
          where: `custom(fields(linkId="${linkId}"))`,
          limit: 1
        }
      })
      .execute();

      console.log('Cart Data:', JSON.stringify(response.body.results[0].shippingInfo));
    return response.body.results[0] || null;
  } catch (error) {
    console.error('Error fetching cart:', error);
    return null;
  }
}

export default async function CartPage({ params }: PageProps) {
  // Await the params object
  const resolvedParams = await Promise.resolve(params);
  const cart = await getCartData(resolvedParams.linkId);

  if (!cart) {
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
          <h2 className="text-xl font-semibold text-gray-900">Loading cart...</h2>
        </div>
      </div>
    }>
      <CartDisplay cart={cart} />
    </Suspense>
  );
}

// Generate static params for static optimization
export async function generateStaticParams() {
  return [];
}