import { NextResponse } from 'next/server'; import { getCsrfForCurrentSession, isAdmin } from '@/lib/admin-auth';
export async function GET(){const authenticated=await isAdmin();return NextResponse.json({authenticated,csrfToken:authenticated?await getCsrfForCurrentSession():null});}
