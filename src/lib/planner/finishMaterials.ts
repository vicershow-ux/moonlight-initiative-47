import { CEILING_FINISHES, FLOOR_FINISHES, PlanScheme, WALL_FINISHES } from "./types"
import { MaterialRow, MaterialSection, heatingMaterials } from "./materials"
import { finishCalc, PAINT_L_PER_M2 } from "./finishes"

const add = (map: Map<string, MaterialRow>, row: MaterialRow) => {
  const key = `${row.name}|${row.spec}|${row.unit}`
  const cur = map.get(key)
  if (cur) {
    cur.qty = Math.round((cur.qty + row.qty) * 100) / 100
    if (row.note && cur.note !== row.note) cur.note = [cur.note, row.note].filter(Boolean).join("; ")
  } else map.set(key, { ...row, qty: Math.round(row.qty * 100) / 100 })
}

const up = (v: number, step = 1) => Math.ceil(v / step - 1e-9) * step
const r1 = (v: number) => String(Math.round(v * 10) / 10).replace(".", ",")

/** Расход черновых материалов на м² — типовые нормы производителей */
const NORM = {
  primer: 0.15, // л/м² за слой
  tileGlue: 5, // кг/м² при зубе 8–10 мм
  grout: 0.5, // кг/м²
  wallpaperGlue: 0.025, // кг/м² (сухой)
  putty: 1.2, // кг/м² финишная шпаклёвка в 1 мм
  plaster: 9, // кг/м² на 10 мм гипсовой штукатурки
  screed: 18, // кг/м² на 10 мм ЦПС
  levelling: 1.6, // кг/м² на 1 мм наливного пола
}

/**
 * Смета отделки и черновых работ по помещениям: покрытие пола с запасом на подрезку,
 * подложка и плинтус; обои рулонами с учётом раппорта, краска литрами по слоям,
 * плитка с клеем и затиркой; потолок; грунт, шпаклёвка, штукатурка и стяжка
 */
export function finishMaterials(scheme: PlanScheme): MaterialSection[] {
  const floor = new Map<string, MaterialRow>()
  const walls = new Map<string, MaterialRow>()
  const ceil = new Map<string, MaterialRow>()
  const rough = new Map<string, MaterialRow>()

  for (const room of scheme.rooms) {
    if (room.points.length < 3) continue
    const c = finishCalc(scheme, room)
    const f = c.finish
    const name = room.name

    // Пол
    if (f.floor !== "none") {
      const info = FLOOR_FINISHES[f.floor]
      add(floor, { name: info.label, spec: `запас ${Math.round(info.waste * 100)}% на подрезку`, unit: "м²", qty: up(c.floorArea * (1 + info.waste), 0.1), note: name })
      if (["parquet", "engineered", "laminate", "vinyl"].includes(f.floor)) {
        add(floor, { name: "Подложка под напольное покрытие", spec: f.floor === "vinyl" ? "2 мм, для SPC" : "3 мм", unit: "м²", qty: up(c.floorArea * 1.05) })
      }
      if (f.floor === "parquet" || f.floor === "engineered") {
        add(floor, { name: "Клей для паркета", spec: "двухкомпонентный / силановый, 1,2 кг/м²", unit: "кг", qty: up(c.floorArea * 1.2) })
        add(floor, { name: "Лак / масло для паркета", spec: "3 слоя, 0,1 л/м² за слой", unit: "л", qty: up(c.floorArea * 0.3) })
      }
      if (f.floor === "tile" || f.floor === "porcelain") {
        add(floor, { name: "Клей плиточный", spec: "мешок 25 кг", unit: "уп", qty: up((c.floorArea * NORM.tileGlue * (f.floor === "porcelain" ? 1.2 : 1)) / 25) })
        add(floor, { name: "Затирка для швов", spec: "мешок 2 кг", unit: "уп", qty: up((c.floorArea * NORM.grout) / 2) })
        add(floor, { name: "Крестики / СВП для плитки", spec: "упаковка 100 шт", unit: "уп", qty: up(c.floorArea / 4) })
      }
      if (f.floor === "linoleum" || f.floor === "carpet") {
        add(floor, { name: "Клей / скотч для покрытия", spec: "по площади", unit: "м²", qty: up(c.floorArea) })
      }
      if (c.skirting > 0) {
        add(floor, { name: "Плинтус напольный", spec: "хлыст 2,5 м", unit: "шт", qty: up((c.skirting * 1.05) / 2.5), note: `${name}: ${r1(c.skirting)} м без дверей` })
        add(floor, { name: "Уголки и заглушки для плинтуса", spec: "по углам помещения", unit: "шт", qty: room.points.length + Math.max(0, Math.round(c.doorWidth / 0.8)) * 2 })
      }
    }

    // Стены
    if (f.wall === "wallpaper" && c.rolls > 0) {
      add(walls, {
        name: "Обои",
        spec: `рулон ${String(f.rollWidth || 1.06).replace(".", ",")}×${String(f.rollLength || 10.05).replace(".", ",")} м${f.rapport ? `, раппорт ${Math.round((f.rapport || 0) * 1000)} мм` : ""}`,
        unit: "рул",
        qty: c.rolls,
        note: `${name}: ${c.stripsPerRoll} полос из рулона`,
      })
      add(walls, { name: "Клей для обоев", spec: "пачка 250 г ≈ 10 м²", unit: "уп", qty: up(c.wallMain / 10) })
    }
    if (f.wall === "paint" && c.paintWall > 0) {
      add(walls, { name: "Краска для стен", spec: `${f.paintCoats || 2} слоя, ${String(PAINT_L_PER_M2).replace(".", ",")} л/м² за слой`, unit: "л", qty: up(c.paintWall * 1.05, 0.5), note: `${name}: ${r1(c.wallMain)} м²` })
    }
    if (f.wall === "plaster") {
      add(walls, { name: "Декоративная штукатурка", spec: "1,2 кг/м²", unit: "кг", qty: up(c.wallMain * 1.2 * 1.05) })
    }
    if (f.wall === "panels") {
      add(walls, { name: "Стеновые панели", spec: `запас ${Math.round(WALL_FINISHES.panels.waste * 100)}%`, unit: "м²", qty: up(c.wallMain * (1 + WALL_FINISHES.panels.waste), 0.1) })
    }
    if (c.wallTile > 0) {
      add(walls, { name: "Плитка настенная", spec: "запас 10% на подрезку", unit: "м²", qty: up(c.wallTile * 1.1, 0.1), note: `${name}: ${r1(c.wallTile)} м²` })
      add(walls, { name: "Клей плиточный", spec: "мешок 25 кг", unit: "уп", qty: up((c.wallTile * NORM.tileGlue) / 25) })
      add(walls, { name: "Затирка для швов", spec: "мешок 2 кг", unit: "уп", qty: up((c.wallTile * NORM.grout) / 2) })
      add(walls, { name: "Уголок для плитки", spec: "2,5 м", unit: "шт", qty: up(((room.height || scheme.defaultHeight) * 2) / 2.5) })
    }
    // Под обои и покраску — финишная шпаклёвка
    if ((f.wall === "wallpaper" || f.wall === "paint") && c.wallMain > 0) {
      add(rough, { name: "Шпаклёвка финишная", spec: "мешок 20 кг, слой 1 мм", unit: "уп", qty: up((c.wallMain * NORM.putty * (f.wall === "paint" ? 2 : 1)) / 20) })
    }
    if ((f.wallPlaster || 0) > 0) {
      const mm = (f.wallPlaster || 0) * 1000
      add(rough, { name: "Штукатурка гипсовая", spec: `мешок 30 кг, слой ${Math.round(mm)} мм`, unit: "уп", qty: up((c.wallNet * NORM.plaster * (mm / 10)) / 30) })
      add(rough, { name: "Маяк штукатурный", spec: "6 мм, 3 м", unit: "шт", qty: up(c.perimeter / 1.2) })
    }
    if (f.wall !== "none" || c.wallTile > 0) {
      add(rough, { name: "Грунтовка для стен", spec: "глубокого проникновения, 1 слой", unit: "л", qty: up(c.wallNet * NORM.primer) })
    }

    // Потолок
    if (f.ceiling !== "none") {
      const info = CEILING_FINISHES[f.ceiling]
      if (f.ceiling === "stretch") {
        add(ceil, { name: "Натяжной потолок (полотно)", spec: "ПВХ, матовый", unit: "м²", qty: up(c.ceilingArea, 0.1), note: name })
        add(ceil, { name: "Профиль для натяжного потолка", spec: "стеновой, 2,5 м", unit: "шт", qty: up((c.perimeter * 1.05) / 2.5) })
        add(ceil, { name: "Маскировочная лента для натяжного", spec: "по периметру", unit: "м", qty: up(c.perimeter * 1.05) })
      } else if (f.ceiling === "gkl") {
        add(ceil, { name: "Гипсокартон потолочный", spec: "9,5 мм, лист 1,2×2,5 м", unit: "шт", qty: up((c.ceilingArea * (1 + info.waste)) / 3) })
        add(ceil, { name: "Профиль ПП 60×27", spec: "3 м, шаг 0,6 м", unit: "шт", qty: up(c.ceilingArea / 0.6 / 3 + 1) })
        add(ceil, { name: "Профиль ПНП 27×28", spec: "3 м, по периметру", unit: "шт", qty: up(c.perimeter / 3) })
        add(ceil, { name: "Подвес прямой", spec: "шаг 0,6×0,6 м", unit: "шт", qty: up(c.ceilingArea / 0.36) })
        add(ceil, { name: "Саморезы по металлу / ГКЛ", spec: "упаковка 1000 шт", unit: "уп", qty: up(c.ceilingArea / 30) })
        add(ceil, { name: "Серпянка", spec: "рулон 45 м", unit: "шт", qty: up((c.ceilingArea * 1.2) / 45) })
      } else if (f.ceiling === "rack") {
        add(ceil, { name: "Реечный потолок (рейки)", spec: `запас ${Math.round(info.waste * 100)}%`, unit: "м²", qty: up(c.ceilingArea * (1 + info.waste), 0.1) })
        add(ceil, { name: "Стрингер (гребёнка) для реек", spec: "4 м, шаг 1 м", unit: "шт", qty: up(c.ceilingArea / 4) })
        add(ceil, { name: "Угол пристенный", spec: "3 м", unit: "шт", qty: up(c.perimeter / 3) })
      }
      if (f.ceiling === "paint" || f.ceiling === "gkl") {
        add(ceil, { name: "Краска для потолка", spec: `${f.paintCoats || 2} слоя`, unit: "л", qty: up(c.paintCeiling * 1.05, 0.5), note: `${name}: ${r1(c.ceilingArea)} м²` })
        add(rough, { name: "Шпаклёвка финишная", spec: "мешок 20 кг, слой 1 мм", unit: "уп", qty: up((c.ceilingArea * NORM.putty * 2) / 20) })
        add(rough, { name: "Грунтовка для потолка", spec: "1 слой", unit: "л", qty: up(c.ceilingArea * NORM.primer) })
      }
    }
    if (c.cornice > 0) add(ceil, { name: "Плинтус потолочный (багет)", spec: "2 м", unit: "шт", qty: up((c.cornice * 1.1) / 2) })

    // Стяжка пола
    if ((f.screed || 0) > 0) {
      const mm = (f.screed || 0) * 1000
      if (mm <= 10) {
        add(rough, { name: "Наливной пол", spec: `мешок 20 кг, слой ${Math.round(mm)} мм`, unit: "уп", qty: up((c.floorArea * NORM.levelling * mm) / 20) })
      } else {
        add(rough, { name: "Пескобетон / ЦПС для стяжки", spec: `мешок 40 кг, слой ${Math.round(mm)} мм`, unit: "уп", qty: up((c.floorArea * NORM.screed * (mm / 10)) / 40) })
        add(rough, { name: "Демпферная лента", spec: "по периметру стяжки", unit: "м", qty: up(c.perimeter * 1.05) })
        add(rough, { name: "Сетка армирующая", spec: "для стяжки", unit: "м²", qty: up(c.floorArea * 1.1) })
      }
      add(rough, { name: "Грунтовка для пола", spec: "1 слой", unit: "л", qty: up(c.floorArea * NORM.primer) })
    }
  }

  const out: MaterialSection[] = []
  if (floor.size) out.push({ title: "Пол", rows: [...floor.values()] })
  if (walls.size) out.push({ title: "Стены", rows: [...walls.values()] })
  if (ceil.size) out.push({ title: "Потолок", rows: [...ceil.values()] })
  if (rough.size) out.push({ title: "Черновые материалы", rows: [...rough.values()] })
  out.push(...heatingMaterials(scheme).filter((x) => x.title === "Тёплый пол (водяной)"))
  return out
}
