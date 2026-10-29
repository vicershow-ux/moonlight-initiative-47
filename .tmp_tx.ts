import { tilePattern, floorFinishPattern, wallpaperPattern, svgPatternDef } from "./src/lib/planner/finishTextures"
const S = 160
const items: [string, any][] = [
  ["Прямая 60×60", tilePattern({ w: 0.6, h: 0.6, joint: 0.003, layout: "grid", color: "#d6d3cd", grout: "#8a8a8a" })],
  ["Вразбежку 30×60", tilePattern({ w: 0.6, h: 0.3, joint: 0.002, layout: "offset", color: "#e9edf0", grout: "#9aa4ab" })],
  ["Кабанчик 1/3", tilePattern({ w: 0.2, h: 0.1, joint: 0.002, layout: "third", color: "#2f6b6b", grout: "#e5e7eb" })],
  ["Диагональ 30×30", tilePattern({ w: 0.3, h: 0.3, joint: 0.003, layout: "diagonal", color: "#c8b79a", grout: "#7c6f5b" })],
  ["Ёлочка 30×7.5", tilePattern({ w: 0.3, h: 0.075, joint: 0.002, layout: "herringbone", color: "#9a7b5c", grout: "#5b4636" })],
  ["Шахматка", tilePattern({ w: 0.3, h: 0.3, joint: 0.002, layout: "checker", color: "#f3f4f6", color2: "#1f2937", grout: "#9ca3af" })],
  ["Паркет", floorFinishPattern("parquet", "#b5834a")!],
  ["Ламинат", floorFinishPattern("laminate", "#c49a6c")!],
  ["Обои", wallpaperPattern("#c7a27a")],
]
const parts = items.map(([t, p], i) => {
  const x = (i % 3) * 330 + 10, y = Math.floor(i / 3) * 230 + 10
  return `<defs>${svgPatternDef("p" + i, p, S, { ox: x, oy: y })}</defs><rect x="${x}" y="${y}" width="320" height="200" fill="url(#p${i})" stroke="#333"/><text x="${x + 6}" y="${y + 216}" font-size="13" font-family="Arial">${t}</text>`
})
await Bun.write("/tmp/tx.html", `<html><body style="margin:0"><svg width="1000" height="700">${parts.join("")}</svg></body></html>`)
