import Vue from "vue";
import Vuex from "vuex";
Vue.use(Vuex);

export const store = new Vuex.Store({
  state: {
    layers: {},
    layer_configs: [],
    activeSliders: null,
    currentLayer: null,
    map: null
  },
  actions: {
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
          if (config._promise) {
            config._promise.reject(
              "No init function found for layer: " + config.name
            );
          }
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
      state.layer_configs.push(config);
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
      if (state.currentLayer === layer) return;
      if (state.currentLayer) {
        state.currentLayer.selected = false;
      }
      state.currentLayer = layer;
      if (layer.sliders) {
        state.activeSliders = layer.sliders;
      }
      layer.selected = true;
    },
    setMap(state, map) {
      state.map = map;
    }
  }
});
