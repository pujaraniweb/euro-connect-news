import fs from "node:fs";
const read = p => { try { return JSON.parse(fs.readFileSync(p,"utf8")); } catch { return null; } };
const cur = read("src/data/generated-news.json")?.items || [];
const loc = read("src/data/local-news.json") || {};
const seen=new Set(); const uniq=[...cur,...(loc.india||[]),...(loc.europe||[])].filter(i=>i&&i.id&&!seen.has(i.id)&&seen.add(i.id));
const tooSmall = u => { const m=u&&u.match(/[?&]width=(\d+)/i); return m && +m[1]<500; };
const aiUrl = it => { const p=`${it.title}. Editorial conceptual illustration for a news website about ${it.category}, clean modern digital art, tasteful, non-photorealistic, no text, no letters, no watermark`; let s=0; for(const ch of it.id)s=(s*31+ch.charCodeAt(0))%1_000_000; return "https://image.pollinations.ai/prompt/"+encodeURIComponent(p)+`?width=800&height=500&nologo=true&seed=${s}&model=flux`; };
const targets = uniq.filter(it=>!it.image||tooSmall(it.image)).map(aiUrl);
console.log(`warming ${targets.length} AI images sequentially…`);
async function get(url,tries=3){ for(let a=1;a<=tries;a++){ try{ const c=new AbortController(); const t=setTimeout(()=>c.abort(),60000); const r=await fetch(url,{signal:c.signal}); clearTimeout(t); if(r.ok){await r.arrayBuffer();return true;} if(r.status===429){await new Promise(x=>setTimeout(x,4000*a));continue;} }catch{ await new Promise(x=>setTimeout(x,2000*a)); } } return false; }
let ok=0,fail=0;
for(let i=0;i<targets.length;i++){ const r=await get(targets[i]); r?ok++:fail++; process.stdout.write(`\r  ${i+1}/${targets.length} ok:${ok} fail:${fail}`); }
console.log(`\ndone. ok=${ok} fail=${fail}`);
