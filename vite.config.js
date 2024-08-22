import { defineConfig } from 'vite'

export default defineConfig({
    define: {
        "process.env.IS_PREACT": JSON.stringify("true")
    }
})