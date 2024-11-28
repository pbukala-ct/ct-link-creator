// src/app/api/links/[linkId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createApiRoot } from '@/lib/commercetools/create.client';


export async function GET(
  request: NextRequest,
  { params }: { params: { linkId: string } }
) {
  try {

  
     if (!params.linkId) {
      return NextResponse.json(
        { error: 'Link ID is required' },
        { status: 400 }
      );
    }

    const resolvedParams = await Promise.resolve(params);
    if (!resolvedParams.linkId) {
      return NextResponse.json(
        { error: 'Link ID is required' },
        { status: 400 }
      );
    }

    const response = await createApiRoot()
      .carts()
      .get({
        queryArgs: {
          where: `custom(fields(linkId="${resolvedParams.linkId}"))`,
          limit: 1
        }
      })
      .execute();

    if (!response.body.results.length) {
      return NextResponse.json(
        { error: 'Cart not found' },
        { status: 404 }
      );
    }

    const cart = response.body.results[0];
    return NextResponse.json({ cart });

  } catch (error) {
    console.error('Error retrieving cart:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve cart' },
      { status: 500 }
    );
  }
}