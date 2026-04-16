import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import './assets/tailwind.css'
import App from './App.vue'
import router from './router'
import { initAllStores } from './engine/initStores'

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)

initAllStores()

app.mount('#app')
