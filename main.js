import App from './App'

// #ifndef VUE3
import Vue from 'vue'
Vue.config.productionTip = false
App.mpType = 'app'


import uView from "uview-ui";
Vue.use(uView);


const app = new Vue({
    ...App
})
require('./config/request.js')(app)

app.$mount()
// #endif