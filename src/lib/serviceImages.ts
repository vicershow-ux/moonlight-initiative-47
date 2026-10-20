const CDN = "https://cdn.poehali.dev/projects/17c1a9d3-9c72-4270-abec-e542b49c03f2/files/"

export const SERVICE_IMAGES: Record<string, string> = {
  "elektromontazhnye-raboty": CDN + "fbb44136-be07-4781-aa5e-9bfba9308ddf.jpg",
  "santehnicheskie-raboty": CDN + "2a8313f4-fa3a-42ba-8885-1e35f36dace4.jpg",
  "plitochnye-raboty": CDN + "317b927a-aaef-40bc-a0a9-1c45530ed531.jpg",
  "demontazhnye-raboty": CDN + "72509344-251e-442c-af6d-aee1e7f79f12.jpg",
  "chernovye-otdelochnye-raboty": CDN + "a79cecb0-cbd6-4f9e-919c-8c4c8a5a901f.jpg",
  "chistovye-otdelochnye-raboty": CDN + "a42e5872-472f-406f-b27b-1055e9375dc5.jpg",
  "ustroystvo-polov": CDN + "3f04b462-1b12-49b0-968e-048424f1df8d.jpg",
  "potolochnye-raboty": CDN + "11f51236-17d5-4024-85ab-14f371e9fcdf.jpg",
  "gipsokartonnye-raboty": CDN + "78b2abf8-14cf-4d30-afa8-e0469f463384.jpg",
  ventilyaciya: CDN + "7d508788-2c12-43b2-8f70-69d7bb3e7e11.jpg",
  kondicionirovanie: CDN + "fb36bccb-37bc-4efa-908a-c3c09ca3a642.jpg",
  "umnyy-dom": CDN + "66ab2025-f60c-49dd-ab1b-81e02a614ebe.jpg",
  "slabotochnye-raboty": CDN + "d26c2d0b-d61e-4a9a-90c9-ff5ccf463052.jpg",
  otoplenie: CDN + "f8396bdf-5e45-4cda-8e41-5de3a8cdf2bd.jpg",
  "montazhnye-raboty": CDN + "2eac0737-6fef-4b1b-a02c-f15251ce4bf2.jpg",
  "stolyarnye-raboty": CDN + "f5f63525-adbb-4bdc-915d-884bc770930b.jpg",
  "kladochnye-raboty": CDN + "cfa6635c-34ef-44a2-8424-9c44eaa207a4.jpg",
  "betonnye-raboty": CDN + "bbbdfd23-423a-43ab-9e4d-5e0cd6d7508b.jpg",
  "krovelnye-raboty": CDN + "a10db200-ea21-4091-97eb-79c94544c528.jpg",
  "fasadnye-raboty": CDN + "d4f58763-1ae3-455e-98b5-5b449aca4d8a.jpg",
  "izolyacionnye-raboty": CDN + "96bfd9d8-87d4-4695-b3e3-6723637a77ca.jpg",
  "podgotovitelnye-raboty": CDN + "ed584e62-c889-4aef-bd74-4a706254b42d.jpg",
  "zemlyanye-raboty": CDN + "da696063-2010-47fc-ba13-17626c95d2d7.jpg",
  blagoustroystvo: CDN + "356abbd7-8de9-4bc5-ac72-da31028fc085.jpg",
}

const FALLBACK = SERVICE_IMAGES["podgotovitelnye-raboty"]

export function serviceImage(slug: string) {
  return SERVICE_IMAGES[slug] || FALLBACK
}
