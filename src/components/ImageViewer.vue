<template>
  <div class="sidebar-page">
    <section class="sidebar-layout">
      <b-sidebar
        :position="position"
        :fullheight="true"
        :fullwidth="false"
        :overlay="false"
        :open.sync="open"
        :mobile="mobile"
        :expand-on-hover="expandOnHover"
        :reduce="reduce"
        type="is-light"
      >
        <div class="p-1">
          <div class="block">
            <div class="title" style="color: #7957d5;">ImJoy Viewer</div>
          </div>
          <div class="block">
            <div class="field">
              <b-switch v-model="showGallery">Gallery</b-switch>
            </div>
            <div class="field">
              <b-dropdown aria-role="list">
                <button class="button" slot="trigger" slot-scope="{ active }">
                  <span>+ Add layer</span>
                  <b-icon :icon="active ? 'menu-up' : 'menu-down'"></b-icon>
                </button>

                <b-dropdown-item
                  @click="newLayer(type)"
                  v-for="(name, type) in layerTypes"
                  :key="type"
                  :value="type"
                  aria-role="listitem"
                  >{{ type }}</b-dropdown-item
                >
              </b-dropdown>
            </div>
          </div>
          <b-menu class="is-custom-mobile">
            <b-menu-list label="Layers">
              <b-menu-item
                v-for="layer in layers.slice().reverse()"
                :key="layer.id"
                :label="layer.name"
                :icon="layer.icon || 'layers'"
                @click="selectLayer(layer)"
              ></b-menu-item>
            </b-menu-list>
          </b-menu>

          <hr class="solid" />

          <div class="block" v-show="currentLayer" style="min-height: 150px;">
            <b-menu-list label="Properties">
              <component
                v-for="layer in layers"
                v-show="currentLayer === layer"
                :ref="'layer_' + layer.id"
                :key="layer.id"
                :is="layerTypes[layer.type]"
                :selected="layer.selected"
                :map="map"
                :config="layer"
              />
            </b-menu-list>
          </div>
        </div>
      </b-sidebar>
      <div v-show="showGallery" class="p-1">
        <gallery :collections="collections"></gallery>
      </div>
      <div v-show="!showGallery" class="p-1">
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
import Gallery from "@/components/Gallery";
import * as layerComponents from "@/components/layers";
import Projection from "ol/proj/Projection";
import { getCenter } from "ol/extent";
import { mapState } from "vuex";

const components = {};
const layerTypes = {};
for (let c in layerComponents) {
  components[layerComponents[c].name] = layerComponents[c];
  layerTypes[layerComponents[c].type] = layerComponents[c].name;
}

components["gallery"] = Gallery;

export default {
  name: "ImageViewer",
  components,
  data() {
    return {
      position: null,
      open: true,
      expandOnHover: false,
      mobile: "fullwidth",
      reduce: false,
      showGallery: false,
      newLayerType: null,
      collections: null,
      layerTypes: layerTypes
    };
  },
  mounted() {
    this.init();

    // this.addLayer({
    //   type: "vtk",
    //   name: "my itk vtk layer"
    // });

    // this.addLayer({
    //   type: "image",
    //   name: "my image layer1"
    // });

    // this.addLayer({
    //   type: "vector",
    //   name: "my vector layer"
    // });

    this.collections = [
      {
        name: "My collection",
        items: [
          { name: "my image 1" },
          { name: "my image 2" },
          { name: "my image 3" },
          { name: "my image 4" },
          { name: "my image 5" }
        ]
      }
    ];
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
    selectLayer(layer) {
      this.$store.commit("setCurrentLayer", layer);
    },
    newLayer(type) {
      this.addLayer({
        type: type,
        name: type + "-" + randId()
      });
    },
    addLayer(config) {
      const id = randId();
      config.id = id;
      this.$store.commit("addLayer", config);
      this.selectLayer(config);
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
/* Solid border */
hr.solid {
  margin-top: 10px;
  border-top: 2px solid #ccc5c5;
  margin-bottom: 15px;
}
section#toolbar > div > div > div > canvas {
  max-width: 100%;
  height: 150px;
}
section#toolbar > div {
  background: transparent;
}
section#toolbar > div:first-child {
  display: none;
}
.corner-annotation {
  z-index: 99999;
  position: absolute;
  bottom: 10px;
  left: 10px;
  color: violet;
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
