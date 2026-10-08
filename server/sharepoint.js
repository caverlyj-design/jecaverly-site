export function sharePointConfigured(env) {
  return ['SP_TENANT_ID','SP_CLIENT_ID','SP_CLIENT_SECRET','SP_SITE_ID','SP_LIST_ID'].every(key=>typeof env[key]==='string'&&env[key].length>0);
}
export async function saveToSharePoint(env,{reference,type,data},send=fetch) {
  if(!sharePointConfigured(env)) throw new Error('SharePoint is not configured');
  if(!/^[a-f0-9-]{36}$/i.test(env.SP_TENANT_ID)) throw new Error('Invalid tenant');
  const tokenResponse=await send(`https://login.microsoftonline.com/${env.SP_TENANT_ID}/oauth2/v2.0/token`,{
    method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},
    body:new URLSearchParams({client_id:env.SP_CLIENT_ID,client_secret:env.SP_CLIENT_SECRET,scope:'https://graph.microsoft.com/.default',grant_type:'client_credentials'}),signal:AbortSignal.timeout(10000)
  });
  if(!tokenResponse.ok) throw new Error('SharePoint authentication failed');
  const token=await tokenResponse.json();
  if(typeof token.access_token!=='string'||!token.access_token) throw new Error('Missing token');
  const labels={name:'Name',email:'Email',organization:'Organization',phone:'Phone',course:'Desired course',participants:'Participants',certification:'Certification required',location:'Location',timeframe:'Timeframe / preferred dates',needs:'Planning needs',scope:'Project scope',details:'Additional details'};
  const details=[`Reference: ${reference}`,`Inquiry type: ${type}`,...Object.entries(labels).filter(([key])=>data[key]).map(([key,label])=>`${label}: ${data[key]}`)].join('\n');
  const result=await send(`https://graph.microsoft.com/v1.0/sites/${encodeURIComponent(env.SP_SITE_ID)}/lists/${encodeURIComponent(env.SP_LIST_ID)}/items`,{
    method:'POST',headers:{Authorization:`Bearer ${token.access_token}`,'Content-Type':'application/json'},
    body:JSON.stringify({fields:{Title:`${type==='training'?'Training':'Consultation'} — ${data.name}`.slice(0,255),InquiryType:type,InquiryDetails:details}}),signal:AbortSignal.timeout(10000)
  });
  if(result.status!==201) throw new Error('SharePoint storage failed');
  const item=await result.json();
  if(!item.id) throw new Error('Missing SharePoint receipt');
  return String(item.id);
}
