import { NextResponse } from 'next/server'; import { clearAdminSession, requireAdminCsrf } from '@/lib/admin-auth';
export async function POST(req:Request){if(!await requireAdminCsrf(req))return NextResponse.json({error:'Unauthorized'},{status:401});await clearAdminSession();return NextResponse.json({ok:true});}
