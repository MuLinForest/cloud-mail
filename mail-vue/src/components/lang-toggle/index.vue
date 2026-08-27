<template>
  <Teleport v-if="target" :to="target">
    <div
        v-if="settingStore.lang === 'zh' || settingStore.lang === 'zh-tc'"
        class="lang-toggle"
        data-lang-toggle
        :title="settingStore.lang === 'zh-tc' ? '简体中文' : '繁體中文'"
        @click="toggle"
    >
      {{ settingStore.lang === 'zh-tc' ? '繁' : '简' }}
    </div>
  </Teleport>
</template>

<script setup>
// 繁/简 切換鈕。刻意不放在 layout/header/index.vue 裡：上游長期在改那個檔，
// 每次 auto-merge rebase 都會撞。這裡用 Teleport 掛進 header 的 .toolbar，
// 找不到目標就什麼都不畫（設定頁的語言下拉仍是可用路徑）。
import {onBeforeUnmount, onMounted, ref} from 'vue'
import {useSettingStore} from '@/store/setting.js'

const settingStore = useSettingStore()
const target = ref(null)
let observer = null

function resolveTarget() {
  const el = document.querySelector('.header .toolbar') || null
  if (el !== target.value) target.value = el
}

// 登入後 header 才出現、登出後又整棵消失，所以觀察者要一直活著：
// 目標不在（或被卸載）就重新找。
function ensureTarget() {
  if (!target.value || !target.value.isConnected) resolveTarget()
}

onMounted(() => {
  resolveTarget()
  observer = new MutationObserver(ensureTarget)
  observer.observe(document.body, {childList: true, subtree: true})
})

onBeforeUnmount(() => {
  if (observer) observer.disconnect()
  observer = null
})

function toggle() {
  const lang = settingStore.lang === 'zh-tc' ? 'zh' : 'zh-tc'
  let setting = {}
  try {
    setting = JSON.parse(localStorage.getItem('setting') || '{}')
  } catch (e) {
    setting = {}
  }
  // 與設定頁 changeLang 相同策略：寫入持久化設定後重載，讓 dayjs/Element Plus 一起換語言
  localStorage.setItem('setting', JSON.stringify({...setting, lang}))
  window.location.reload()
}
</script>

<style scoped>
.lang-toggle {
  width: 30px;
  height: 30px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  user-select: none;
}

.lang-toggle:hover {
  background: var(--base-fill);
}
</style>
