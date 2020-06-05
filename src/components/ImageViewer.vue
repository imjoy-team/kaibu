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
          <div class="block">
            <component
              v-show="current_layer === layer"
              v-for="layer in layers"
              :ref="'layer_' + layer.id"
              :key="layer.name"
              :is="layer.type"
              :map="map"
              :config="layer"
            />
          </div>
          <b-menu class="is-custom-mobile">
            <b-menu-list label="Layers">
              <b-menu-item
                v-for="layer in layers"
                :key="layer.name"
                :label="layer.name"
                :icon="layer.icon || 'layers'"
                @click="current_layer = layer"
              ></b-menu-item>
            </b-menu-list>
          </b-menu>
        </div>
      </b-sidebar>

      <div class="p-1">
        <div id="map"></div>
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

const components = {};
for (let c in layerComponents) {
  components[layerComponents[c].name] = layerComponents[c];
}

export default {
  name: "ImageViewer",
  components,
  data() {
    return {
      layers: [],
      current_layer: null,
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
  methods: {
    addLayer(config) {
      const id = randId();
      config.id = id;
      this.layers.push(config);
    },
    init() {
      const extent = [0, 0, 1024, 968];
      const projection = new Projection({
        code: "xkcd-image",
        units: "pixels",
        extent: extent
      });
      this.map = new Map({
        target: "map",
        layers: [],
        view: new View({
          projection: projection,
          center: getCenter(extent),
          zoom: 2,
          maxZoom: 8
        })
      });
    }
  }
};
</script>

<style lang="css">
#map {
  width: 100%;
  height: 100%;
  position: fixed;
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
