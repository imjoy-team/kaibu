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
        :can-cancel="true"
        :expand-on-hover="expandOnHover"
        :reduce="reduce"
        type="is-light"
      >
        <div class="p-1">
          <div class="block">
            <img style="width: 220px;" src="static/img/kaibu-banner.svg" />
          </div>
          <button
            class="button floating-close-btn is-small"
            @click="closeSidebar"
          >
            <b-icon icon="chevron-left"></b-icon>
          </button>
          <div class="block">
            <!-- <div class="field">
              <b-switch v-model="showGallery">Gallery</b-switch>
            </div> -->
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
          <b-menu
            class="is-custom-mobile"
            @sorted="layerSorted()"
            v-sortable="sortableOptions"
          >
            <b-menu-list label="Layers">
              <b-menu-item
                class="layer-item"
                v-for="layer in layer_configs.slice().reverse()"
                :key="layer.id"
                @click="selectLayer(layer)"
              >
                <template slot="label">
                  <button class="button is-small" @click="toggleVisible(layer)">
                    <b-icon v-if="layer.visible" icon="eye-outline"></b-icon>
                    <b-icon v-else icon="eye-off-outline"></b-icon>
                  </button>
                  {{ layer.name }}
                  <b-dropdown
                    aria-role="list"
                    class="is-pulled-right"
                    position="is-bottom-left"
                  >
                    <b-icon icon="dots-vertical" slot="trigger"></b-icon>
                    <b-dropdown-item
                      aria-role="listitem"
                      icon="close-circle"
                      @click="removeLayer(layer)"
                      >Remove</b-dropdown-item
                    >
                  </b-dropdown>
                </template>
              </b-menu-item>
            </b-menu-list>
          </b-menu>

          <hr class="solid" />

          <div class="block" v-show="currentLayer" style="min-height: 150px;">
            <b-menu-list label="Properties">
              <component
                v-for="layer in layer_configs"
                v-show="currentLayer === layer"
                :ref="'layer_' + layer.id"
                :key="layer.id"
                :is="layerTypes[layer.type]"
                :selected="layer.selected"
                :visible="layer.visible"
                :map="map"
                :config="layer"
              />
            </b-menu-list>
          </div>
        </div>
      </b-sidebar>
      <button
        class="button floating-menu-btn"
        v-show="!open"
        @click="openSidebar()"
      >
        <img style="width: 30px;" src="static/img/kaibu-icon.svg" />
      </button>
      <div v-show="showGallery">
        <gallery :collections="collections"></gallery>
      </div>
      <div v-show="!showGallery" class="p-1">
        <div id="map" :style="{ width: viewerWidth }"></div>
        <section
          v-if="activeSliders"
          class="slider-container"
          :style="{ width: sliderWidth }"
        >
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
import { defaults } from "ol/interaction";
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

// You have to install sortable.js to use it:
// 'npm install sortablejs'
import Sortable from "sortablejs";

const createSortable = (el, options, vnode) => {
  return Sortable.create(el, {
    ...options,
    onEnd: function(evt) {
      // since we used layers.slice().reserve(), we need to reverse the index here
      const oldIndex = options.layer_configs.length - evt.oldIndex - 1;
      const newIndex = options.layer_configs.length - evt.newIndex - 1;

      const data = options.layer_configs;
      const item = data[oldIndex];
      if (newIndex > oldIndex) {
        for (let i = oldIndex; i < newIndex; i++) {
          data[i] = data[i + 1];
        }
      } else {
        for (let i = oldIndex; i > newIndex; i--) {
          data[i] = data[i - 1];
        }
      }
      data[newIndex] = item;
      vnode.componentInstance.$emit("sorted", data);
      // vnode.context.$buefy.toast.open(`Moved ${item} from row ${oldIndex + 1} to ${newIndex + 1}`)
    }
  });
};

/**
 * We add a new instance of Sortable when the element
 * is bound or updated, and destroy it when it's unbound.
 */
const sortable = {
  name: "sortable",
  bind(el, binding, vnode) {
    const container = el.querySelector(".menu-list");
    container._sortable = createSortable(container, binding.value, vnode);
  },
  update(el, binding, vnode) {
    const container = el.querySelector(".menu-list");
    container._sortable.destroy();
    container._sortable = createSortable(container, binding.value, vnode);
  },
  unbind(el) {
    const container = el.querySelector(".menu-list");
    container._sortable.destroy();
  }
};
function debounce(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this,
      args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}
const itkVtkViewer = window.itkVtkViewer;
async function setupImJoy({ addLayer }) {
  const imjoyRPC = await window.imjoyLoader.loadImJoyRPC({
    api_version: "0.2.3"
  });
  const api = await imjoyRPC.setupRPC({
    name: "Kaibu",
    version: "0.1.0",
    description:
      "Kaibu--a web application for visualizing and annotating multi-dimensional images",
    type: "rpc-window"
  });
  api.registerCodec({
    name: "itkimage",
    decoder: itkVtkViewer.utils.convertToItkImage
  });
  api.registerCodec({
    name: "ndarray",
    decoder: itkVtkViewer.utils.ndarrayToItkImage
  });

  const service_api = {
    setup() {
      api.log("Kaibu loaded successfully.");
    },
    async run(ctx) {
      if (ctx.data && ctx.data.image_array) {
        await this.imshow(ctx.data.image_array);
      } else if (ctx.data && ctx.data.layers) {
        for (let layer of ctx.data.layers) {
          addLayer(layer);
        }
      }
    },
    addLayer: addLayer,
    async imshow(image_array) {
      const vtkImage = itkVtkViewer.utils.vtkITKHelper.convertItkToVtkImage(
        image_array
      );
      addLayer({ type: "itk-vtk", image: vtkImage });
    }
  };

  api.export(service_api);
}

export default {
  name: "ImageViewer",
  components,
  directives: { sortable },
  data() {
    return {
      sortableOptions: {
        chosenClass: "is-primary",
        draggable: ".layer-item"
      },
      position: "static",
      open: false,
      expandOnHover: false,
      mobile: "fullwidth",
      reduce: false,
      screenWidth: 1000,
      showGallery: false,
      newLayerType: null,
      collections: null,
      layerTypes: layerTypes
    };
  },
  mounted() {
    this.init();

    this.addLayer({
      type: "itk-vtk",
      name: "example image",
      imageUrl: "https://images.proteinatlas.org/19661/221_G2_1_red_green.jpg"
    });

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

    this.sortableOptions.layer_configs = this.layer_configs;
    window.addEventListener("resize", this.updateSize);
    window.dispatchEvent(new Event("resize"));
    this.openSidebar();
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.updateSize);
  },
  computed: {
    sliderWidth() {
      return this.open && this.position === "static"
        ? "calc(100% - 310px)"
        : "calc(100% - 20px )";
    },
    viewerWidth() {
      return this.open && this.position === "static"
        ? "calc(100% - 260px)"
        : "calc(100%)";
    },
    ...mapState({
      layers: state => state.layers,
      layer_configs: state => state.layer_configs,
      currentLayer: state => state.currentLayer,
      map: state => state.map,
      activeSliders: state => state.activeSliders
    })
  },
  methods: {
    closeSidebar() {
      this.open = false;
      setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
      }, 300);
    },
    openSidebar() {
      setTimeout(() => {
        this.open = true;
        window.dispatchEvent(new Event("resize"));
      }, 300);
    },
    updateSize() {
      debounce(() => {
        this.screenWidth = window.innerWidth;
        if (this.screenWidth > 1024) {
          if (this.position != "static") {
            this.open = true;
          }
          this.position = "static";
        } else {
          if (this.position != "absolute") {
            this.open = false;
          }
          this.position = "absolute";
        }
        this.$forceUpdate();
      }, 250)();
    },
    layerSorted() {
      for (let i = 0; i < this.layer_configs.length; i++) {
        if (this.layers[this.layer_configs[i].id])
          this.layers[this.layer_configs[i].id].setZIndex(i);
        else {
          console.warn("Layer not ready", this.layer_configs[i]);
        }
      }
    },
    removeLayer(layer) {
      this.$store.commit("removeLayer", layer);
      this.$forceUpdate();
    },
    toggleVisible(layer) {
      this.$store.commit("toggleVisible", layer);
      this.$forceUpdate();
    },
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
      config.id = randId();
      this.$store.dispatch("addLayer", config);
      this.$nextTick(() => {
        this.layerSorted();
      });
    },
    init() {
      const extent = [0, 0, 1024, 968];
      const projection = new Projection({
        code: "xkcd-image",
        units: "pixels",
        extent: extent
      });
      const map = new Map({
        interactions: defaults({
          altShiftDragRotate: false,
          pinchRotate: false
        }),
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
      // inside an iframe
      if (window.self !== window.top) {
        setupImJoy({ addLayer: this.addLayer });
      }
    }
  }
};
</script>

<style lang="css">
.layer-item {
  cursor: grab !important;
}
#map {
  height: 100%;
  position: fixed;
}
.slider-container {
  padding-left: 10px;
  padding-right: 10px;
  bottom: 0px;
  position: absolute;
}
.slider-label {
  color: #b6acd3 !important;
  display: inline-block !important;
  margin-bottom: 0px !important;
  margin-top: 7px;
  width: 30px;
}
.slider-container .b-slider-track {
  background: #dbdbdb3b !important;
}
.slider-container .b-slider-fill {
  background: #7957d580 !important;
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
  width: 300px !important;
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
  height: 140px;
}
svg {
  fill: white;
}
section#toolbar > div {
  background: #dedddf;
}
section#toolbar > div:first-child {
  display: none;
}

.corner-annotation {
  position: absolute;
  top: 10px;
  right: 80px;
  color: #7957d5;
}
.menu-list a.is-active {
  background-color: #e9e1ff !important;
  color: #4a4a4a !important;
}
.ol-layers:first-child {
  background-color: black;
}
.ol-layer {
  width: 100% !important;
  height: 100% !important;
}
.floating-close-btn {
  position: absolute !important;
  left: 260px;
  top: 10px;
}
.floating-menu-btn {
  margin-left: 3px;
  background-color: #ffffff00 !important;
  border-color: #dbdbdb00 !important;
  z-index: 9999;
  position: absolute !important;
  width: 34px;
  height: 34px;
  top: 5px;
  left: 5px;
}
.floating-menu-btn > img {
  height: 30px;
  width: 30px;
  max-width: 28px;
  max-height: 28px;
  background: rgb(242, 237, 237);
}

.ol-zoom {
  top: 50px;
}
</style>
