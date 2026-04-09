import { createI18n } from 'vue-i18n';
import en from './en.js'
import zh from './zh.js'
import zhTc from './zh-tc.js'
const i18n = createI18n({
    legacy: false,
    messages: {
        zh,
        'zh-tc': zhTc,
        en
    },
});

export default i18n;