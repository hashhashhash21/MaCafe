import { NextResponse } from 'next/server'; import { createOrder,getOrders } from '@/lib/server-store'; import { isAdmin } from '@/lib/admin-auth';
export async function GET(){if(!await isAdmin())return NextResponse.json({error:'Unauthorized'},{status:401});return NextResponse.json({orders:await getOrders()});}
export async function POST(req:Request){try{const order=await createOrder(await req.json());return NextResponse.json({order},{status:201})}catch(e:any){const m=String(e?.message||e);return NextResponse.json({error:m},{status:m.startsWith('OUT_OF_STOCK')?409:400})}}
