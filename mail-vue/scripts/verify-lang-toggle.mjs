// 建置後檢查：繁/简 切換鈕是否真的還被編進 bundle。
//
// 背景：該鈕是獨立元件 mail-vue/src/components/lang-toggle/index.vue，
// 靠 App.vue 的 <lang-toggle/> 掛載、再用 Teleport 注入 header 的 .toolbar。
// 若某次 upstream rebase 把 App.vue 那一行併掉，畫面只是「鈕不見了」，
// 不會有任何錯誤。這裡讓建置直接失敗。
import {readdir, readFile} from 'node:fs/promises'
import {existsSync} from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import {loadEnv} from 'vite'

const env = loadEnv('release', process.cwd(), '')
const outDir = path.resolve(process.cwd(), env.VITE_OUT_DIR || 'dist')
const marker = 'data-lang-toggle'

if (!existsSync(outDir)) {
  console.error(`[verify-lang-toggle] 找不到建置輸出：${outDir}`)
  process.exit(1)
}

async function collect(dir) {
  const entries = await readdir(dir, {withFileTypes: true})
  const files = []
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) files.push(...await collect(full))
    else if (entry.name.endsWith('.js')) files.push(full)
  }
  return files
}

const files = await collect(outDir)
let found = null
for (const file of files) {
  const code = await readFile(file, 'utf8')
  if (code.includes(marker)) {
    found = file
    break
  }
}

if (!found) {
  console.error(`[verify-lang-toggle] 失敗：${outDir} 的 ${files.length} 個 js 檔都沒有 ${marker}。`)
  console.error('[verify-lang-toggle] 繁/简 切換鈕被移出 bundle 了 —— 檢查 mail-vue/src/App.vue 是否還有 <lang-toggle/>。')
  process.exit(1)
}

console.log(`[verify-lang-toggle] OK: ${marker} 在 ${path.relative(process.cwd(), found)}`)
