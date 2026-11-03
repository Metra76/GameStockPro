// Repaso semanal de vendidos: pegar en una página de resultados de eBay "vendidos"
// (ebay.es/sch/i.html?_nkw=...&LH_Sold=1&LH_Complete=1&_ipg=120) con la llamada de abajo ajustada al juego.
// Filtra DENTRO de la página y devuelve solo el resultado (mediana, nº de ventas y una muestra corta),
// para no leer los 120 anuncios uno a uno.
//
// Parámetros de la llamada del final:
//   incluir:    RegExp que DEBE cumplir el título (nombre + edición si no es la estándar). Ej: /hell is us.*(deluxe|lujo)/i
//   excluir:    RegExp opcional de títulos a descartar (otras ediciones, otras plataformas raras...). Ej: /collector|coleccionista/i
//   plataforma: "PS5" | "PS4" | "Switch" | "Switch 2" | "PC" (descarta anuncios de otras plataformas)
//   dias:       ventana en días (por defecto 90)
// Devuelve: n (ventas válidas), mediana (precio + envío), rango, cuántos atípicos se quitaron y 5 títulos de muestra
// para comprobar que la edición es la buena. Si n < 3, no se toca el valor.
((cfg)=>{
  const {incluir, excluir=null, plataforma="", dias=90}=cfg;
  const num=x=>+String(x).replace(/\./g,"").replace(",",".");
  const MES={ene:0,feb:1,mar:2,abr:3,may:4,jun:5,jul:6,ago:7,sep:8,oct:9,nov:10,dic:11};
  const OTRAS={
    "PS5":/\b(ps4|playstation 4|switch|xbox|ps3|psvita|vita)\b/i,
    "PS4":/\b(ps5|playstation 5|switch|xbox|ps3|vita)\b/i,
    "Switch":/\b(ps5|ps4|playstation|xbox|switch ?2|ns2|wii|3ds)\b/i,
    "Switch 2":/\b(ps5|ps4|playstation|xbox)\b/i,
    "PC":/\b(ps5|ps4|playstation|xbox|switch)\b/i,
  };
  const USADO=/segunda mano|usado|reacondicionado|para piezas|pre-owned|\bused\b|como nuevo|abierto|open box|solo cartucho|cart only|loose|\bcib\b|sin arañazos|solo disco|disc only/i;
  const BASURA=/protector|funda|solo caja|box only|empty|vac[ií]a|sin juego|graded|\bcgc\b|wata|\bvga\b|\blote\b|bundle|\bpack de \d|manual|camiseta|t-shirt|figura|vinilo|vinyl|banda sonora|soundtrack|mando|controller|consola|console|trofeo|trophy|c[oó]digo de|download code|digital code|\bdlc\b|póster|poster/i;
  const corte=Date.now()-dias*864e5;
  const ok=[];let total=0,fuera=0;
  for(const li of document.querySelectorAll("li.s-item, li.s-card, ul.srp-results > li")){
    const t=li.innerText.replace(/\s+/g," ");
    const m=t.match(/Vendidos (\d{1,2}) (\w+)\.? (\d{4})(.*?)Se abre en una nueva/);if(!m) continue;
    total++;
    const f=new Date(+m[3],MES[m[2].slice(0,3).toLowerCase()]??0,+m[1]).getTime();
    if(f<corte) continue;
    const ti=m[4].trim();
    const resto=t.slice(t.indexOf(m[4])+m[4].length);
    const pm=resto.match(/([\d.]+,\d{2}) EUR/);if(!pm) continue;
    const em=resto.match(/\+ ?([\d.]+,\d{2}) EUR de env/);
    if(USADO.test(t.slice(0,240))||BASURA.test(ti)) continue;
    if(!incluir.test(ti)||(excluir&&excluir.test(ti))) continue;
    if(plataforma==="Switch 2"&&!/switch ?2|ns2/i.test(ti)) continue;
    if(OTRAS[plataforma]&&OTRAS[plataforma].test(ti)) continue;
    ok.push({p:Math.round((num(pm[1])+(em?num(em[1]):0))*100)/100,ti});
  }
  const med=a=>{const v=a.map(o=>o.p).sort((x,y)=>x-y);return v.length?(v.length%2?v[(v.length-1)/2]:(v[v.length/2-1]+v[v.length/2])/2):null;};
  // Quitar atípicos (lotes, consolas, errores): fuera lo que esté por debajo de 1/2.5 o por encima de 2.5 veces la mediana
  let validas=ok;const m0=med(ok);
  if(m0&&ok.length>=4){validas=ok.filter(o=>o.p>=m0/2.5&&o.p<=m0*2.5);fuera=ok.length-validas.length;}
  const mediana=med(validas);const ps=validas.map(o=>o.p);
  return JSON.stringify({
    anuncios:total, n:validas.length, mediana:mediana==null?null:Math.round(mediana),
    rango:ps.length?[Math.min(...ps),Math.max(...ps)]:null, atipicosQuitados:fuera,
    muestra:validas.slice(0,5).map(o=>o.p+" "+o.ti.slice(0,45))
  });
})({incluir:/NOMBRE/i, excluir:null, plataforma:"PS5", dias:90})
