<template>
  <div class="sidebar-page">
    <section class="sidebar-layout">
      <b-sidebar
        position="static"
        :mobile="mobile"
        :expand-on-hover="expandOnHover"
        :reduce="reduce"
        type="is-light"
        open
      >
        <div class="p-1">
          <div class="block">
            <h1>ImJoy ImageViewer</h1>
            <img
              src="https://raw.githubusercontent.com/buefy/buefy/dev/static/img/buefy-logo.png"
              alt="Lightweight UI components for Vue.js based on Bulma"
            />
          </div>
          <div class="block" v-if="currentLayer" style="min-height: 150px;">
            <component
              v-show="currentLayer === layer"
              v-for="layer in layers"
              :ref="'layer_' + layer.id"
              :key="layer.name"
              :is="layer.type"
              :map="map"
              :config="layer"
            />
          </div>
          <div class="is-divider" data-content="OR"></div>
          <b-menu class="is-custom-mobile">
            <b-menu-list label="Layers">
              <b-menu-item
                v-for="layer in layers"
                :key="layer.name"
                :label="layer.name"
                :icon="layer.icon || 'layers'"
                @click="$store.commit('setCurrentLayer', layer)"
              ></b-menu-item>
            </b-menu-list>
          </b-menu>
        </div>
      </b-sidebar>

      <div class="p-1">
        <div id="map"></div>
        <section v-if="activeSliders" class="slider-container">
          <b-field
            style="margin-bottom:0px!important;"
            v-for="slider in activeSliders"
            :key="slider.name"
          >
            <label class="label slider-label">{{ slider.name }}</label>
            <b-slider
              class="slider-body"
              @input="slider.changed"
              v-model="slider.value"
              :min="slider.min || 0"
              :max="slider.max || 1"
              :step="slider.step || 1"
            ></b-slider>
          </b-field>
        </section>
      </div>
    </section>
  </div>
</template>

<script>
import "ol/ol.css";
import { Map, View } from "ol";
import { randId } from "../utils";
import * as layerComponents from "@/components/layers";
import Projection from "ol/proj/Projection";
import { getCenter } from "ol/extent";
import { mapState } from "vuex";

const components = {};
for (let c in layerComponents) {
  components[layerComponents[c].name] = layerComponents[c];
}

export default {
  name: "ImageViewer",
  components,
  data() {
    return {
      expandOnHover: false,
      mobile: "reduce",
      reduce: false
    };
  },
  mounted() {
    this.init();

    this.addLayer({
      type: "image-layer",
      name: "my image layer1"
    });

    this.addLayer({
      type: "vector-layer",
      name: "my vector layer"
    });
  },
  computed: {
    ...mapState({
      layers: state => state.layers,
      currentLayer: state => state.currentLayer,
      map: state => state.map,
      activeSliders: state => state.activeSliders
    })
  },
  methods: {
    addLayer(config) {
      const id = randId();
      config.id = id;
      this.$store.commit("addLayer", config);
    },
    init() {
      const extent = [0, 0, 1024, 968];
      const projection = new Projection({
        code: "xkcd-image",
        units: "pixels",
        extent: extent
      });
      const map = new Map({
        target: "map",
        layers: [],
        view: new View({
          projection: projection,
          center: getCenter(extent),
          zoom: 2,
          maxZoom: 8
        })
      });
      this.$store.commit("setMap", map);
    }
  }
};
</script>

<style lang="css">
#map {
  width: calc(100% - 260px);
  height: 100%;
  position: fixed;
}
.slider-container {
  padding-left: 10px;
  padding-right: 10px;
  bottom: 0px;
  width: calc(100% - 260px);
  position: absolute;
}
.slider-label {
  display: inline-block !important;
  margin-bottom: 0px !important;
  margin-top: 7px;
  width: 30px;
}
.slider-body {
  display: inline-block;
  margin-bottom: 6px !important;
  margin-left: 5px !important;
}
.sidebar-page {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100%;
}
.sidebar-page .sidebar-layout {
  display: flex;
  flex-direction: row;
  min-height: 100%;
}
.sidebar-content {
  height: 100%;
  padding: 10px;
}
.sidebar-layout {
  height: 100vh;
}
@media screen and (max-width: 1023px) {
  .sidebar-content {
    padding: 1px;
  }
  .b-sidebar
    .sidebar-content.is-mini-mobile:not(.is-mini-expand)
    .menu-list
    li
    a
    span:nth-child(2),
  .b-sidebar
    .sidebar-content.is-mini-mobile.is-mini-expand:not(:hover)
    .menu-list
    li
    a
    span:nth-child(2) {
    display: none;
  }
  .b-sidebar
    .sidebar-content.is-mini-mobile:not(.is-mini-expand)
    .menu-list
    li
    ul,
  .b-sidebar
    .sidebar-content.is-mini-mobile.is-mini-expand:not(:hover)
    .menu-list
    li
    ul {
    padding-left: 0;
  }
  .b-sidebar
    .sidebar-content.is-mini-mobile:not(.is-mini-expand)
    .menu-list
    li
    ul
    li
    a,
  .b-sidebar
    .sidebar-content.is-mini-mobile.is-mini-expand:not(:hover)
    .menu-list
    li
    ul
    li
    a {
    display: inline-block;
  }
  .b-sidebar
    .sidebar-content.is-mini-mobile:not(.is-mini-expand)
    .menu-label:not(:last-child),
  .b-sidebar
    .sidebar-content.is-mini-mobile.is-mini-expand:not(:hover)
    .menu-label:not(:last-child) {
    margin-bottom: 0;
  }
}
@media screen and (min-width: 1024px) {
  .b-sidebar
    .sidebar-content.is-mini:not(.is-mini-expand)
    .menu-list
    li
    a
    span:nth-child(2),
  .b-sidebar
    .sidebar-content.is-mini.is-mini-expand:not(:hover)
    .menu-list
    li
    a
    span:nth-child(2) {
    display: none;
  }
  .b-sidebar .sidebar-content.is-mini:not(.is-mini-expand) .menu-list li ul,
  .b-sidebar
    .sidebar-content.is-mini.is-mini-expand:not(:hover)
    .menu-list
    li
    ul {
    padding-left: 0;
  }
  .b-sidebar
    .sidebar-content.is-mini:not(.is-mini-expand)
    .menu-list
    li
    ul
    li
    a,
  .b-sidebar
    .sidebar-content.is-mini.is-mini-expand:not(:hover)
    .menu-list
    li
    ul
    li
    a {
    display: inline-block;
  }
  .b-sidebar
    .sidebar-content.is-mini:not(.is-mini-expand)
    .menu-label:not(:last-child),
  .b-sidebar
    .sidebar-content.is-mini.is-mini-expand:not(:hover)
    .menu-label:not(:last-child) {
    margin-bottom: 0;
  }
}
</style>
