import Vue from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import Buefy from "buefy";
import "@mdi/font/css/materialdesignicons.css";
import "buefy/dist/buefy.css";
import { extend, ValidationProvider } from "vee-validate";
import * as rules from "vee-validate/dist/rules";
import { messages } from "vee-validate/dist/locale/en.json";

import { store } from "./store";

Vue.use(Buefy);

Vue.config.productionTip = false;

Vue.component("ValidationProvider", ValidationProvider);
Object.keys(rules).forEach(rule => {
  extend(rule, {
    ...rules[rule],
    message: messages[rule]
  });
});

new Vue({
  router,
  render: h => h(App),
  store
}).$mount("#app");
