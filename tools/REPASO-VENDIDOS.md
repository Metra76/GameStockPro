# Repaso semanal de precios vendidos (GameStockPro)

Objetivo: que el valor de cada juego sea **lo que se vende de verdad en eBay**, ni inflado (anuncios) ni infravalorado (PriceCharting).

## Reglas del valor
- Solo ventas **nuevas/precintadas** de la **misma edición y plataforma** (PAL salvo que el producto diga otra región). Fuera: usados, graded, solo caja, solo cartucho, otras ediciones (Deluxe ≠ estándar, Collector ≠ estándar), packs, steelbooks sueltos (salvo que el producto sea el steelbook).
- Valor = **mediana de (precio + envío)** de esas ventas, de los últimos ~90 días si hay bastantes.
- Mínimo **3 ventas válidas**; con menos, no se toca.
- No tocar productos con `valorFuente` = `manual` (Lumière, Game & Watch…) ni `stockx`.
- Juan quiere valores **reales**, que pueden subir o bajar.

## Cómo
1. Leer el estado actual de la app en el navegador del PC (pestaña con https://metra76.github.io/GameStockPro/GameStockPro.html, ya con sesión): `JSON.parse(localStorage.gsp_v3)` → `products` (id, nombre, categoria, edicion, region, stock, valorFuente, valorFecha).
2. Elegir ~40-60 juegos con stock > 0 (secciones Juegos), priorizando los que **no** tienen `ebay-vendidos-es` y luego los de `valorFecha` más antigua.
3. Para cada uno: navegar (no `fetch`, eBay bloquea) a `https://www.ebay.es/sch/i.html?_nkw=<nombre + edición + plataforma>&LH_Sold=1&LH_Complete=1&_ipg=120`, ejecutar `tools/parse-vendidos.js`, filtrar por título según las reglas y calcular la mediana. **Ir despacio** (unos segundos entre búsquedas); si sale "Error Page"/403, parar y seguir otro día.
4. Añadir/actualizar en `vendidos.json` las entradas `{id, valor, fecha (YYYY-MM-DD de hoy), n (ventas válidas)}` y poner `actualizado` = fecha de hoy. Mantener las entradas anteriores que no se hayan revisado.
5. Commit + push al repo Metra76/GameStockPro (rama main). La app aplica `vendidos.json` sola al abrirse.
6. Avisar a Juan con un resumen corto: cuántos revisados, los que más suben y bajan, y los que no tenían ventas suficientes.
