import i18next from 'i18next';
import zh from './zh.js'
import zhTc from './zh-tc.js'
import en from './en.js'
import app from '../hono/hono';

app.use('*', async (c, next) => {
	const acceptLang = c.req.header('accept-language') || ''
	const lang = acceptLang.split(',')[0]?.split(';')[0]?.trim()
	const shortLang = lang?.split('-')[0]
	i18next.init({
		lng: shortLang,
	});
	return await next()
})

const resources = {
	en: {
		translation: en
	},
	zh: {
		translation: zh,
	},
	'zh-tc': {
		translation: zhTc,
	},
};

i18next.init({
	fallbackLng: 'zh',
	resources,
});

export const t = (key, values) => i18next.t(key, values)

export default i18next;
