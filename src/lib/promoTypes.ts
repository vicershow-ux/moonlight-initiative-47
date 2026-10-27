export type PromoFormat = "card" | "a4" | "a5" | "a6"
export type Orientation = "portrait" | "landscape"

interface ElBase {
  id: string
  x: number
  y: number
  w: number
  h: number
  rot?: number
  opacity?: number
  locked?: boolean
}

export interface TextEl extends ElBase {
  type: "text"
  text: string
  font: string
  size: number
  color: string
  weight?: number
  italic?: boolean
  underline?: boolean
  align?: "left" | "center" | "right"
  valign?: "top" | "middle" | "bottom"
  lh?: number
  ls?: number
  upper?: boolean
}

export interface ImageEl extends ElBase {
  type: "image"
  src: string
  fit?: "cover" | "contain"
  radius?: number
  filter?: "none" | "gray" | "sepia" | "dark"
}

export interface ShapeEl extends ElBase {
  type: "rect" | "ellipse"
  fill: string
  stroke?: string
  sw?: number
  radius?: number
  dashed?: boolean
}

export interface QrEl extends ElBase {
  type: "qr"
  value: string
  fg: string
  bg: string
}

export interface IconEl extends ElBase {
  type: "icon"
  name: string
  color: string
}

export interface TearEl extends ElBase {
  type: "tear"
  count: number
  text: string
  sub: string
  color: string
  bg: string
  size: number
}

export type PromoEl = TextEl | ImageEl | ShapeEl | QrEl | IconEl | TearEl

export interface PromoSide {
  bg: string
  bgImage?: string
  bgDim?: number
  elements: PromoEl[]
}

export interface PromoDesign {
  format: PromoFormat
  orientation: Orientation
  template?: string
  sides: PromoSide[]
}
