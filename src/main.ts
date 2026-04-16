import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import './assets/tailwind.css'
import App from './App.vue'
import router from './router'
import i18n from './i18n'
import { initAllStores } from './engine/initStores'

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)
app.use(i18n)

initAllStores()

app.mount('#app')
