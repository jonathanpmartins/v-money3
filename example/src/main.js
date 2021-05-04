import App from "./App.js";

const app = window.Vue.createApp({
    render: () => window.Vue.h(App)
});

app.use(window["v-money3"].default);

app.mount("#app");
