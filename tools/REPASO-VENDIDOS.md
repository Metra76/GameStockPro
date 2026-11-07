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
3. Para cada uno: navegar (no `fetch`, eBay bloquea) a `https://www.ebay.es/sch/i.html?_nkw=<nombre + edición + plataforma>&LH_Sold=1&LH_Complete=1&_ipg=120` y ejecutar `tools/parse-vendidos.js` cambiando solo la llamada del final (`incluir`, `excluir`, `plataforma`). El script filtra **dentro de la página** (fechas de 90 días, usados, basura, otras plataformas, atípicos) y devuelve solo la mediana, el nº de ventas y 5 títulos de muestra. **No volcar los anuncios ni leerlos uno a uno**: es lo que más consume. Mirar la muestra solo para confirmar la edición; si sale mezclada, afinar `incluir`/`excluir` y volver a ejecutar en la misma página (sin navegar otra vez). **Ir despacio** (unos segundos entre búsquedas); si sale "Error Page"/403, parar y seguir otro día.
   - Si el nombre del producto dice una edición especial (Collector, CE, Maverick...) pero el campo `edicion` dice Estándar, no tocarlo y avisar a Juan para que lo aclare.
4. Añadir/actualizar en `vendidos.json` las entradas `{id, valor, fecha (YYYY-MM-DD de hoy), n (ventas válidas)}` y poner `actualizado` = fecha de hoy. Mantener las entradas anteriores que no se hayan revisado.
5. Commit + push al repo Metra76/GameStockPro (rama main). La app aplica `vendidos.json` sola al abrirse.
6. Avisar a Juan con un resumen corto: cuántos revisados, **los juegos que más suben y los que más bajan** respecto al valor anterior (en € y %, unos 5 de cada), y los que no tenían ventas suficientes.
   - **No poner la lista de los más valorados**: eso ya sale en la app (petición de Juan, 03/11/2026).


## Región (desde 07/11/2026, petición de Juan: "vamos a lo seguro")
- Juan tiene ediciones PAL (casi todas PAL España). El script prioriza las ventas cuyo título dice PAL/EUR/ESP/España/Europe/UK/PEGI: si hay 3 o más, el valor sale solo de esas.
- Si no llegan a 3, se usa la mezcla de regiones y se guarda `"region":"mixta"` en vendidos.json; la ficha de la app lo muestra como "región mixta".
- Cada entrada de vendidos.json lleva `region` ("PAL" o "mixta"). Las anteriores al 07/11 no lo llevan y cuentan como mixtas: hay que repasarlas.
- Excluir siempre versiones japonesas/asiáticas salvo que el producto sea JP.
