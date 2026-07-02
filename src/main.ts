import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { registerAutoClearOnClose } from '@/utils/appCache'
import 'vant/lib/index.css'
import './styles/global.css'
import './styles/board-games.css'

registerAutoClearOnClose()

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
