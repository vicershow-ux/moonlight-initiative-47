import fs from "node:fs"
import path from "node:path"

/**
 * Читает переменные из .env.production / .env и кладёт их в process.env.
 * Нужно для сборки на своём сервере: Vite подставляет такие переменные
 * только в код сайта, а скриптам сборки они иначе не видны.
 */
export function loadEnvFiles(root = process.cwd()) {
  for (const name of [".env.production.local", ".env.production", ".env.local", ".env"]) {
    const file = path.join(root, name)
    if (!fs.existsSync(file)) continue

    for (const raw of fs.readFileSync(file, "utf8").split("\n")) {
      const line = raw.trim()
      if (!line || line.startsWith("#")) continue

      const eq = line.indexOf("=")
      if (eq === -1) continue

      const key = line.slice(0, eq).trim()
      if (!key.startsWith("VITE_") || process.env[key]) continue

      let value = line.slice(eq + 1).trim()
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }
      process.env[key] = value
    }
  }
}
