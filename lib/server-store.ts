import { catalog, catalogById, priceFor } from '@/lib/catalog';
import { db } from '@/lib/cloudflare';

async function ensureInventory(){
  const d=db();
  await d.batch(catalog.map(p=>d.prepare('INSERT OR IGNORE INTO inventory(product_id,stock) VALUES(?,20)').bind(p.id)));
}
export async function getInventory(){await ensureInventory();const r=await db().prepare('SELECT product_id,stock FROM inventory').all<any>();return Object.fromEntries((r.results||[]).map(x=>[String(x.product_id),x.stock]));}
export async function saveInventory(inv:Record<string,number>){await ensureInventory();const d=db();const stmts=[];for(const p of catalog) if(inv[String(p.id)]!=null)stmts.push(d.prepare('UPDATE inventory SET stock=? WHERE product_id=?').bind(Math.max(0,Math.floor(Number(inv[String(p.id)])||0)),p.id));if(stmts.length)await d.batch(stmts);return getInventory();}
async function hydrate(o:any){const r=await db().prepare('SELECT product_id as id,name,ar,qty,size,milk,unit_price as unitPrice,line_total as lineTotal FROM order_items WHERE order_id=?').bind(o.id).all<any>();return {...o,issuedAt:o.issued_at,paymentMethod:o.payment_method,paymentStatus:o.payment_status,paymentReference:o.payment_reference,zatcaStatus:o.zatca_status,vatRate:o.vat_rate,items:r.results||[]};}
export async function getOrders(){const r=await db().prepare('SELECT * FROM orders ORDER BY issued_at DESC LIMIT 500').all<any>();return Promise.all((r.results||[]).map(hydrate));}
export async function getOrder(id:string){const o=await db().prepare('SELECT * FROM orders WHERE id=?').bind(id).first<any>();return o?hydrate(o):null;}
export async function updatePayment(id:string,status:string,reference?:string){await db().prepare('UPDATE orders SET payment_status=?,payment_reference=? WHERE id=?').bind(status,reference||null,id).run();return getOrder(id);}
export async function updateZatca(id:string,status:string,response?:unknown){await db().prepare('UPDATE orders SET zatca_status=?,zatca_response=? WHERE id=?').bind(status,response?JSON.stringify(response):null,id).run();return getOrder(id);}
export async function createOrder(input:any){
  const raw=Array.isArray(input?.items)?input.items:[];if(!raw.length)throw new Error('EMPTY_ORDER');
  const items=raw.map((line:any)=>{const id=Number(line.id),qty=Math.floor(Number(line.qty)),p=catalogById.get(id);if(!p||qty<1||qty>10)throw new Error('INVALID_ORDER_ITEM');const req=String(line.size||'regular');const size=req==='double'&&p.doublePrice!=null?'double':req==='large'&&p.largePrice!=null?'large':'regular';const milk=['regular','oat','almond','none'].includes(String(line.milk))?String(line.milk):'regular';const unitPrice=priceFor(p,size);return{id,name:p.name,ar:p.ar,qty,size,milk,unitPrice,lineTotal:Number((unitPrice*qty).toFixed(2))}});
  await ensureInventory();const d=db();
  for(const x of items){const r=await d.prepare('SELECT stock FROM inventory WHERE product_id=?').bind(x.id).first<any>();if(!r||Number(r.stock)<x.qty)throw new Error(`OUT_OF_STOCK:${x.id}`);}
  const total=Number(items.reduce((n:number,x:any)=>n+x.lineTotal,0).toFixed(2)),vat=Number((total*15/115).toFixed(2)),subtotal=Number((total-vat).toFixed(2));
  const now=new Date(),uuid=crypto.randomUUID(),id=`MC-${now.getUTCFullYear()}-${uuid.slice(0,8).toUpperCase()}`;
  const stmts:D1PreparedStatement[]=[d.prepare('INSERT INTO orders(id,uuid,issued_at,subtotal,vat,total,vat_rate,currency,status,payment_method,payment_status,zatca_status) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)').bind(id,uuid,now.toISOString(),subtotal,vat,total,15,'SAR','confirmed',String(input?.paymentMethod||'pay_at_counter'),input?.paymentMethod==='online'?'payment_required':'pending_at_counter','draft_not_submitted')];
  for(const x of items){stmts.push(d.prepare('INSERT INTO order_items(order_id,product_id,name,ar,qty,size,milk,unit_price,line_total) VALUES(?,?,?,?,?,?,?,?,?)').bind(id,x.id,x.name,x.ar,x.qty,x.size,x.milk,x.unitPrice,x.lineTotal));stmts.push(d.prepare('UPDATE inventory SET stock=stock-? WHERE product_id=?').bind(x.qty,x.id));}
  await d.batch(stmts);return getOrder(id);
}
