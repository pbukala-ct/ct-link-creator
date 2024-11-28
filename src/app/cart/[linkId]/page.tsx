// src/app/cart/[linkId]/page.tsx
import { createApiRoot } from '@/lib/commercetools/create.client';
import { CartDisplay } from '@/components/CartDisplay';
import { Suspense } from 'react';
import { CartData } from '@/types/commercetools';
import { log } from 'console';

interface PageProps {
  params: { linkId: string };
}

export default async function CartPage({
  params,
}: {
  params: Promise<{ linkId: any }>
}) {
  const linkId  = (await params).linkId;
  const cart = await getCartData(linkId);

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
      <CartDisplay cart={cart as CartData} />
    </Suspense>
  );
}async function getCartData(linkId: string) {
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

    if (!response.body.results.length) {
      return null;
    }

    return response.body.results[0];
  } catch (error) {
    console.error('Error fetching cart:', error);
    return null;
  }
}

// Generate static params for static optimization
export const generateStaticParams = async () => {
  return [];
};