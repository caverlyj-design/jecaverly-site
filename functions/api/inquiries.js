import {saveToSharePoint,sharePointConfigured} from '../../server/sharepoint.js';
const courses = new Set(['CPR & AED','First Aid','First Aid / CPR / AED','Basic Life Support (BLS)','First Aid for Severe Trauma (FAST)','Emergency preparedness','Workplace safety & emergency response','Other / help me choose']);
const limits = {name:120,email:254,organization:160,phone:40,course:120,participants:5,certification:20,location:200,timeframe:200,needs:2000,scope:2000,details:3000};
function reply(request, body, status) {
  const headers = {'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'};
  if (request.headers.get('Accept')?.includes('application/json')) return Response.json(body,{status,headers});
  headers['Content-Type']='text/html; charset=utf-8';
  headers['Content-Security-Policy']="default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'";
  const message = body.ok ? `Your inquiry has been received. Reference: ${body.reference}. This does not confirm a booking.` : body.error;
  return new Response(`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Inquiry receipt</title><style>body{background:#0d1b2a;color:#edf2f7;font:1.1rem/1.6 system-ui;max-width:48rem;margin:4rem auto;padding:1rem}a{color:#8dbb4f}</style><h1>${body.ok?'Inquiry received':'Inquiry not sent'}</h1><p>${message}</p><p><a href="/consulting-training/">Return to Consulting &amp; Training</a></p></html>`,{status,headers});
}
export async function onRequestPost({request,env}) {
  const fail = (error,status=400)=>reply(request,{ok:false,error},status);
  const url = new URL(request.url);
  if (request.headers.get('Origin') !== url.origin) return fail('Please submit the form from this website.',403);
  if (!/^(multipart\/form-data|application\/x-www-form-urlencoded)/i.test(request.headers.get('Content-Type')||'')) return fail('Unsupported submission format.',415);
  if (Number(request.headers.get('Content-Length')||0)>24000) return fail('Please shorten your inquiry.',413);
  if (!env.INQUIRIES_DB) return fail('The inquiry system is temporarily unavailable. Your request has not been saved. Please try again later.',503);
  const useSharePoint=env.INQUIRY_DESTINATION==='sharepoint';
  if(useSharePoint&&!sharePointConfigured(env)) return fail('The inquiry system is temporarily unavailable. Your request has not been saved. Please try again later.',503);
  let raw;
  try {
    const reader=request.body?.getReader();
    if(!reader) return fail('The inquiry was empty.');
    const chunks=[];let size=0;
    while(true) {const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>24000){await reader.cancel();return fail('Please shorten your inquiry.',413);}chunks.push(value);}
    const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
    raw=await new Request(request.url,{method:'POST',headers:{'Content-Type':request.headers.get('Content-Type')},body:bytes}).formData();
  } catch { return fail('Unable to read the inquiry. Please try again.'); }
  if (raw.get('website')) return fail('The inquiry could not be accepted. Please try again.',400);
  const type=raw.get('type');
  if(!['consulting','training'].includes(type)) return fail('Please choose a consultation or training request.');
  const data={};
  for(const [key,max] of Object.entries(limits)) {
    const value=raw.get(key)??'';
    if(typeof value!=='string'||value.length>max) return fail('One or more fields exceed the allowed length.');
    data[key]=value.trim();
  }
  const required=type==='consulting'?['name','email','organization','needs','scope','location','timeframe']:['name','email','course','participants','certification','location','timeframe'];
  if(required.some(key=>!data[key])) return fail('Please complete all required fields.');
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return fail('Please enter a valid email address.');
  if(type==='training'&&(!courses.has(data.course)||!['Yes','No','Not sure'].includes(data.certification)||!/^\d+$/.test(data.participants)||Number(data.participants)<1||Number(data.participants)>10000)) return fail('Please check the course, participant count, and certification selection.');
  if(type==='consulting') {data.course='';data.participants='';data.certification='';} else {data.needs='';data.scope='';}
  const reference=crypto.randomUUID();
  const now=Math.floor(Date.now()/1000);
  const ip=request.headers.get('CF-Connecting-IP')||'unknown';
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(`${Math.floor(now/86400)}:${ip}`));
  const rateKey=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
  try {
    // D1 batch is atomic: rate increment and conditional storage succeed together.
    const statements=[
      env.INQUIRIES_DB.prepare('DELETE FROM inquiry_rate WHERE window_start < ?').bind(now-86400),
      env.INQUIRIES_DB.prepare('INSERT INTO inquiry_rate (rate_key,window_start,count) VALUES (?,?,1) ON CONFLICT(rate_key) DO UPDATE SET count=CASE WHEN window_start < ? THEN 1 ELSE count+1 END,window_start=CASE WHEN window_start < ? THEN excluded.window_start ELSE window_start END').bind(rateKey,now,now-3600,now-3600),
    ];
    if(!useSharePoint) statements.push(env.INQUIRIES_DB.prepare('INSERT INTO inquiries (id,created_at,type,name,email,organization,phone,location,timeframe,payload) SELECT ?,?,?,?,?,?,?,?,?,? WHERE (SELECT count FROM inquiry_rate WHERE rate_key=?) <= 5').bind(reference,new Date().toISOString(),type,data.name,data.email,data.organization,data.phone,data.location,data.timeframe,JSON.stringify(data),rateKey));
    else statements.push(env.INQUIRIES_DB.prepare('SELECT count FROM inquiry_rate WHERE rate_key=?').bind(rateKey));
    const results=await env.INQUIRIES_DB.batch(statements);
    if(results.some(r=>!r.success)) throw new Error('storage failure');
    if(useSharePoint&&!Number.isInteger(results[2].results?.[0]?.count)) throw new Error('rate lookup failed');
    if(useSharePoint ? results[2].results?.[0]?.count>5 : results[2].meta.changes!==1) return fail('Too many inquiries from this connection. Please wait an hour before trying again.',429);
    if(useSharePoint) await saveToSharePoint(env,{reference,type,data});
    return reply(request,{ok:true,reference,type},201);
  } catch {return fail('Your inquiry could not be saved. Please try again later.',503);}
}
export function onRequestGet({request}) {return reply(request,{ok:false,error:'Submit an inquiry through the consultation or training form.'},405);}
