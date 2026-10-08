import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.BACKEND_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await axios.post(`${API_BASE_URL}/accounts/onboarding`, body, { timeout: 35_000 });
    return NextResponse.json(response.data, { status: response.status, headers: { 'cache-control': 'no-store' } });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return NextResponse.json(error.response?.data ?? { message: 'Serviço temporariamente indisponível.' }, { status: error.response?.status ?? 503, headers: { 'cache-control': 'no-store' } });
    }
    return NextResponse.json({ message: 'Falha inesperada.' }, { status: 500, headers: { 'cache-control': 'no-store' } });
  }
}

