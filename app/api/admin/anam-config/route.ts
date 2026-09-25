import { NextResponse } from 'next/server';
import { isAdmin, requireAdminCsrf } from '@/lib/admin-auth';
import { publicAnamConfig, saveAnamConfig } from '@/lib/anam-config';
export async function GET(){if(!await isAdmin())return NextResponse.json({error:'Unauthorized'},{status:401});return NextResponse.json(await publicAnamConfig());}
export async function PUT(req:Request){if(!await requireAdminCsrf(req))return NextResponse.json({error:'Unauthorized or invalid CSRF token'},{status:403});const body=await req.json().catch(()=>({}));const clean:any={};for(const k of ['avatarId','agentId','voiceId','llmId','baristaName']) if(typeof body[k]==='string'&&body[k].trim()) clean[k]=body[k].trim();if(typeof body.apiKey==='string'&&body.apiKey.trim())clean.apiKey=body.apiKey.trim();await saveAnamConfig(clean);return NextResponse.json({ok:true,...await publicAnamConfig()});}
