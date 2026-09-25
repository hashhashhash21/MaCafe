import { NextResponse } from 'next/server'; import { getInventory,saveInventory } from '@/lib/server-store'; import { requireAdminCsrf } from '@/lib/admin-auth';
export async function GET(){return NextResponse.json({inventory:await getInventory()});}
export async function PUT(req:Request){if(!await requireAdminCsrf(req))return NextResponse.json({error:'Unauthorized'},{status:401});const body=await req.json();return NextResponse.json({inventory:await saveInventory(body.inventory||{})});}
