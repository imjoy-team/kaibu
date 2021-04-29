import Vue from "vue";
import Vuex from "vuex";
Vue.use(Vuex);

export const store = new Vuex.Store({
  state: {
    layers: {},
    widgets: {},
    layer_configs: [],
    currentLayer: null,
    currentLayerWidget: null,
    standaloneWidgets: {},
    map: null
  },
  actions: {
    addWidget(context, config) {
      context.commit("addWidget", config);
    },
    addLayer(context, config) {
      context.commit("addLayer", config);
      Vue.nextTick(() => {
        if (config.init) {
          config
            .init()
            .then(layer => {
              if (!layer) {
                if (config._add_layer_promise) {
                  config._add_layer_promise.reject(
                    "Failed to create layer for " + config.name
                  );
                }
              }
              layer.config = config;
              layer.setVisible(config.visible);
              layer.getLayerAPI = layer.getLayerAPI || function() {};
              context.commit("initialized", layer);
              context.commit("setCurrentLayer", layer.config);
              context.commit("sortLayers");
              if (config._add_layer_promise) {
                config._add_layer_promise.resolve(layer);
                delete config._add_layer_promise;
              }
            })
            .catch(e => {
              if (config._add_layer_promise) {
                config._add_layer_promise.reject(e);
                delete config._add_layer_promise;
              } else {
                console.error(e);
              }
            });
        } else {
          debugger;
        }
      });
    }
  },
  mutations: {
    sortLayers(state) {
      for (let i = 0; i < state.layer_configs.length; i++) {
        if (state.layers[state.layer_configs[i].id])
          state.layers[state.layer_configs[i].id].setZIndex(i);
        else {
          console.warn("Layer not ready", state.layer_configs[i]);
        }
      }
    },
    initialized(state, layer) {
      state.layers[layer.config.id] = layer;
      layer.setZIndex(state.layer_configs.length - 1);
    },
    addLayer(state, config) {
      if (config.visible === undefined) config.visible = true;
      if (typeof config.index === "number") {
        const index = config.index;
        state.layer_configs.splice(index, 0, config);
        delete config.index;
      } else state.layer_configs.push(config);
    },
    addWidget(state, config) {
      state.widgets[config.name] = config;
      if (!config.attach_to) state.standaloneWidgets[config.name] = config;
    },
    removeWidget(state, config) {
      delete state.widgets[config.name];
    },
    removeLayer(state, layer) {
      layer.selected = false;
      state.layer_configs = state.layer_configs.filter(l => l.id !== layer.id);
    },
    clearLayers(state) {
      state.layer_configs = [];
    },
    toggleVisible(state, layer) {
      layer.visible = !layer.visible;
    },
    setCurrentLayer(state, layer) {
      layer = state.layer_configs.filter(l => l.id === layer.id)[0]
      if (state.currentLayer === layer) return;
      if (state.currentLayer) {
        state.currentLayer.selected = false;
      }
      state.currentLayer = layer;
      layer.selected = true;
      state.currentLayerWidget = null;
      for (let k of Object.keys(state.widgets)) {
        if (
          state.currentLayer.name &&
          state.widgets[k].attach_to == state.currentLayer.name
        ) {
          state.currentLayerWidget = state.widgets[k];
          break;
        }
      }
    },
    setMap(state, map) {
      state.map = map;
    }
  }
});
