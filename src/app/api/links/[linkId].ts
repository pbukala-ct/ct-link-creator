import { NextApiRequest, NextApiResponse } from 'next';
import { createApiRoot } from '@/lib/commercetools/create.client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const { linkId } = req.query;

      if (!linkId || typeof linkId !== 'string') {
        return res.status(400).json({ error: 'Missing or invalid linkId parameter' });
      }

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
        return res.status(404).json({ error: 'Cart not found' });
      }

      const cart = response.body.results[0];
      return res.status(200).json({ cart });
    } catch (error) {
      console.error('Error retrieving cart:', error);
      return res.status(500).json({ error: 'Failed to retrieve cart' });
    }
  } else {
    res.setHeader('Allow', 'GET');
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}