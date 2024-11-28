// src/app/api/checkout/session/route.ts
import { log } from 'console';
import { NextRequest, NextResponse } from 'next/server';

async function getAccessToken() {
    const authUrl = process.env.CTP_AUTH_URL;
    const credentials = Buffer.from(
      `${process.env.CTP_CLIENT_ID}:${process.env.CTP_CLIENT_SECRET}`
    ).toString('base64');
  
    const response = await fetch(`${authUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials'
      }),
    });
  
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Auth failed: ${error.message || 'Unknown error'}`);
    }
  
    const data = await response.json();
    return data.access_token;
  }

export async function POST(request: NextRequest) {
  try {
    const { cartId } = await request.json();
    
    const accessToken = await getAccessToken();
    const projectKey = process.env.CTP_PROJECT_KEY!;
    const region = process.env.CTP_REGION!;
    
    const response = await fetch(
      `https://session.${region}.commercetools.com/${projectKey}/sessions`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cart: {
            cartRef: {
              id: cartId,
            },
          },
          metadata: {
            applicationKey: process.env.CTP_APPLICATION_KEY,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create checkout session');
    }

    const sessionData = await response.json();
    return NextResponse.json(sessionData);
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}