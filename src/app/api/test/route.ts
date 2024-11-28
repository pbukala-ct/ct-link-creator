// src/app/api/test/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  console.log('Project Key:', process.env.CTP_PROJECT_KEY);
  return NextResponse.json({
    projectKey: process.env.CTP_PROJECT_KEY,
    clientId: process.env.CTP_CLIENT_ID,
  });
}