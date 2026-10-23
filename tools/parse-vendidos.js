// Pegar en una página de resultados de eBay "vendidos" (ebay.es/sch/i.html?...&LH_Sold=1&LH_Complete=1&_ipg=120).
// Devuelve las ventas de artículos nuevos/precintados: título, precio, envío, total y fecha.
(()=>{
  const n=x=>+String(x).replace(/\./g,"").replace(",",".");
  const out=[];
  for(const li of document.querySelectorAll("li.s-item, li.s-card, ul.srp-results > li")){
    const t=li.innerText.replace(/\s+/g," ");
    const m=t.match(/Vendidos (\d{1,2} \w+\.? \d{4})(.*?)Se abre en una nueva/);if(!m) continue;
    const resto=t.slice(t.indexOf(m[2])+m[2].length);
    const pm=resto.match(/([\d.]+,\d{2}) EUR/);if(!pm) continue;
    const em=resto.match(/\+ ?([\d.]+,\d{2}) EUR de env/);
    if(/segunda mano|usado|reacondicionado|para piezas|pre-owned|\bused\b|como nuevo|abierto|open box|solo cartucho|cart only|loose/i.test(t.slice(0,220))) continue;
    const precio=n(pm[1]),envio=em?n(em[1]):0;
    out.push({titulo:m[2].trim().slice(0,110),precio,envio,total:Math.round((precio+envio)*100)/100,fecha:m[1]});
  }
  return JSON.stringify({pagina:document.title.slice(0,60),n:out.length,ventas:out});
})()
