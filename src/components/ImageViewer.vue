<template>
  <div class="sidebar-page">
    <section class="sidebar-layout">
      <div class="lds-ellipsis" v-show="loading">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
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
            <img
              :style="{ width: mode === 'full' ? '220px' : '120px' }"
              src="static/img/kaibu-banner.svg"
            />
            <button
              class="button floating-close-btn is-small"
              @click="closeSidebar"
            >
              <b-icon icon="chevron-left"></b-icon>
            </button>
          </div>

          <div class="block" v-if="mode === 'full'">
            <div class="field">
              <b-dropdown aria-role="list">
                <b-button
                  class="is-primary"
                  slot="trigger"
                  slot-scope="{ active }"
                  icon-left="plus"
                >
                  <span>Add layer</span>
                  <b-icon :icon="active ? 'menu-up' : 'menu-down'"></b-icon>
                </b-button>
                <input
                  ref="file_input"
                  @change="loadFiles($event)"
                  type="file"
                  style="display:none;"
                  multiple
                />
                <b-dropdown-item
                  @click="$refs.file_input.click()"
                  value="file"
                  aria-role="listitem"
                  ><b-icon icon="file-import"></b-icon> From
                  File(s)</b-dropdown-item
                >

                <b-dropdown-item
                  @click="newLayer(type)"
                  v-for="(comp, type) in layerTypes"
                  v-show="comp.show"
                  :key="type"
                  :value="type"
                  aria-role="listitem"
                  ><b-icon icon="layers"></b-icon>{{ type }}</b-dropdown-item
                >
              </b-dropdown>
              &nbsp;
              <b-button
                @click="goto('/docs')"
                target="_blank"
                icon-left="book-open-outline"
              >
                Docs
              </b-button>

              <b-dropdown aria-role="list" position="is-bottom-left">
                <button class="button" slot="trigger">
                  <b-icon icon="dots-vertical" slot="trigger"></b-icon>
                </button>
                <b-dropdown-item
                  @click="goto('https://github.com/imjoy-team/kaibu')"
                  aria-role="listitem"
                  ><b-icon icon="github"></b-icon> Github</b-dropdown-item
                >
                <b-dropdown-item @click="screenshot()" aria-role="listitem"
                  ><b-icon icon="camera"></b-icon> Screenshot</b-dropdown-item
                >
                <b-dropdown-item @click="goto('/#/about')" aria-role="listitem"
                  ><b-icon icon="information-variant"></b-icon> About Kaibu v{{
                    version
                  }}</b-dropdown-item
                >
              </b-dropdown>
            </div>
          </div>
          <b-tabs
            size="is-small"
            class="block"
            v-if="Object.keys(standaloneWidgets).length > 0"
          >
            <b-tab-item
              v-for="(widget, id) in standaloneWidgets"
              :key="id"
              :label="widget.name"
              :icon="widget.icon"
              :style="{
                'max-height': widget.max_height
                  ? widget.max_height + 'px'
                  : '400px'
              }"
            >
              <component
                :is="widgetTypes[widget.type]"
                @loading="loading = $event"
                :config="widget"
              />
            </b-tab-item>
          </b-tabs>
          <br v-else />
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
                  {{
                    (layer.name &&
                      layer.name.slice(0, 30) +
                        (layer.name.length > 30 ? "..." : "")) ||
                      "Unnamed Layer"
                  }}
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
            <b-menu-list
              v-if="currentLayerWidget"
              :label="currentLayerWidget.name"
              :icon="currentLayerWidget.icon"
            >
              <component
                :is="widgetTypes[currentLayerWidget.type]"
                @loading="loading = $event"
                :config="currentLayerWidget"
              />
            </b-menu-list>
            <b-menu-list label="Properties">
              <component
                v-for="layer in layer_configs"
                v-show="currentLayer === layer"
                @update-extent="updateExtent"
                :ref="'layer_' + layer.id"
                :key="layer.id"
                :is="layerTypes[layer.type]"
                @loading="loading = $event"
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
        <img
          style="width: 30px; border-radius: 6px;"
          src="static/img/kaibu-icon.svg"
        />
      </button>
      <div class="p-1">
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
              @change="slider.change_callback"
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
import { version } from "../../package.json";
import "ol/ol.css";
import { Map, View } from "ol";
import { defaults } from "ol/interaction";
import { randId } from "../utils";
import * as layerComponents from "@/components/layers";
import * as widgetComponents from "@/components/widgets";
import { Projection } from "ol/proj";
import { getCenter } from "ol/extent";
import { mapState } from "vuex";
import { setupImJoyAPI } from "../imjoyAPI";

const components = {};
const layerTypes = {};
for (let c in layerComponents) {
  components[layerComponents[c].name] = layerComponents[c];
  layerTypes[layerComponents[c].type] = layerComponents[c];
}

const widgetTypes = {};
for (let c in widgetComponents) {
  components[widgetComponents[c].name] = widgetComponents[c];
  widgetTypes[widgetComponents[c].type] = widgetComponents[c];
}

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

function is_touch_device() {
  return "ontouchstart" in window;
}
export default {
  name: "ImageViewer",
  components,
  directives: { sortable },
  data() {
    return {
      mode: "full",
      version: version,
      sortableOptions: {
        delay: is_touch_device() ? 100 : null,
        chosenClass: "is-primary",
        draggable: ".layer-item"
      },
      position: "static",
      open: false,
      expandOnHover: false,
      mobile: "fullwidth",
      reduce: false,
      screenWidth: 1000,
      newLayerType: null,
      collections: null,
      layerTypes,
      widgetTypes,
      loading: false,
      activeSliders: []
    };
  },
  mounted() {
    this.init();
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
      standaloneWidgets: state => state.standaloneWidgets,
      currentLayer: state => state.currentLayer,
      currentLayerWidget: state => state.currentLayerWidget,
      map: state => state.map
    })
  },
  methods: {
    loadFiles(event) {
      const files = event.target.files;
      const file_mapping = {
        ".json": "vector",
        ".jpg": "2d-image",
        ".png": "2d-image",
        ".tif": "itk-vtk"
      };
      for (let file of files) {
        let detected = false;
        for (let k of Object.keys(file_mapping)) {
          if (file.name.endsWith(k)) {
            this.addLayer({
              type: file_mapping[k],
              name: file.name,
              data: file
            });
            detected = true;
            break;
          }
        }
        // fallback to itk-vtk
        if (!detected) {
          this.addLayer({
            type: "itk-vtk",
            name: file.name,
            data: file
          });
        }
      }
    },
    setMode(mode) {
      this.mode = mode;
      this.$forceUpdate();
    },
    goto(url) {
      window.open(url, "_blank");
    },
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
        if (this.screenWidth > 800) {
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
      this.$store.commit("sortLayers");
    },
    removeLayer(layer) {
      this.$store.commit("removeLayer", layer);
      this.$forceUpdate();
    },
    clearLayers() {
      this.$store.commit("clearLayers");
      this.$forceUpdate();
    },
    toggleVisible(layer) {
      this.$store.commit("toggleVisible", layer);
      this.$nextTick(() => {
        this.map.updateSize();
        this.map.renderSync();
      });

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
      return new Promise((resolve, reject) => {
        config.id = randId();
        this.$store.dispatch("addLayer", config);
        config._add_layer_promise = { resolve, reject };
      });
    },
    updateExtent(config) {
      //TODO: calculate the extent for all layers
      const projection = new Projection({
        code: "image",
        units: "pixels",
        extent: config.extent
        // axisOrientation: 'esu',
      });
      this.map.setView(
        new View({
          projection: projection,
          center: getCenter(config.extent),
          zoom: 1,
          minZoom: -10
        })
      );
    },
    async init() {
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
        setupImJoyAPI({
          addLayer: this.addLayer,
          removeLayer: this.removeLayer,
          clearLayers: this.clearLayers,
          addWidget: this.addWidget,
          removeWidget: this.removeWidget,
          setLoader: this.setLoader,
          setMode: this.setMode,
          setSliders: this.setSliders,
          updateSlider: this.updateSlider
        });
      } else {
        this.addLayer({
          type: "itk-vtk",
          name: "example image",
          data: "https://images.proteinatlas.org/19661/221_G2_1_red_green.jpg"
        });

        await this.addLayer({
          type: "vector",
          name: "shape vectors",
          data:
            "https://gist.githubusercontent.com/oeway/7c62128939a7f9b1701e2bbd72b809dc/raw/example_shape_vectors.json",
          predefined_tags: ["nuclei", "cell"],
          only_predefined_tags: true,
          single_tag_mode: false
        });
      }
    },
    updateSlider(name, value) {
      const sliders = this.activeSliders.filter(slider => slider.name === name);
      if (sliders.length <= 0) throw new Error(`Slider "${name}" not found`);
      else {
        sliders[0].value = value;
      }
    },
    setSliders(sliders) {
      this.activeSliders = sliders;
      this.$forceUpdate();
    },
    setLoader(enable) {
      this.loading = enable;
      this.$forceUpdate();
    },
    addWidget(config) {
      return new Promise((resolve, reject) => {
        config.name = config.name || "default";
        if (!config.type) {
          reject("Please specify a widget type");
          return;
        }
        config._resolve = resolve;
        config._reject = reject;
        this.$store.dispatch("addWidget", config);
        this.$forceUpdate();
      });
    },
    removeWidget(config) {
      this.$store.dispatch("removeWidget", config);
      this.$forceUpdate();
    },
    screenshot() {
      // TODO: fix rendering for itk-vtk layer
      this.map.once("rendercomplete", () => {
        var mapCanvas = document.createElement("canvas");
        var size = this.map.getSize();
        mapCanvas.width = size[0];
        mapCanvas.height = size[1];
        var mapContext = mapCanvas.getContext("2d");
        Array.prototype.forEach.call(
          document.querySelectorAll(".ol-layer canvas"),
          canvas => {
            if (canvas.width > 0) {
              var opacity = canvas.parentNode.style.opacity;
              mapContext.globalAlpha = opacity === "" ? 1 : Number(opacity);
              var transform = canvas.style.transform;
              if (transform) {
                // Get the transform parameters from the style's transform matrix
                var matrix = transform
                  .match(/^matrix\(([^(]*)\)$/)[1]
                  .split(",")
                  .map(Number);
                // Apply the transform to the export map context
                CanvasRenderingContext2D.prototype.setTransform.apply(
                  mapContext,
                  matrix
                );
              }

              mapContext.drawImage(canvas, 0, 0);
            }
          }
        );
        if (navigator.msSaveBlob) {
          // link download attribuute does not work on MS browsers
          navigator.msSaveBlob(mapCanvas.msToBlob(), "kaibu-screenshot.png");
        } else {
          const a = document.createElement("a");
          document.body.appendChild(a);
          const url = mapCanvas.toDataURL();
          a.href = url;
          a.download = "kaibu-screenshot.png";
          a.click();
          setTimeout(() => {
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          }, 0);
        }
      });
      this.map.renderSync();
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
.tab-content {
  background: white;
  padding: 2px;
}
.tab-item {
  overflow: auto;
}
.slider-container > .field {
  height: 20px;
}
.slider-container {
  padding-left: 10px;
  padding-right: 10px;
  bottom: 12px;
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
  width: 320px !important;
  height: 100%;
  padding: 10px;
}
.sidebar-layout {
  height: 100vh;
}
/* Solid border */
hr.solid {
  margin-top: 10px;
  border-top: 1px solid #ccc5c553;
  margin-bottom: 15px;
}

svg {
  fill: white;
}

.block {
  margin-bottom: 10px !important;
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

.ol-control button {
  background: #5e0ae680 !important;
}

.lds-ellipsis {
  display: inline-block;
  width: 80px;
  height: 80px;
  position: absolute;
  top: calc(50% - 70px);
  left: 50%;
  z-index: 9999;
  transform: translate(-50%, 0);
}

.lds-ellipsis div {
  position: absolute;
  top: 33px;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background: #7957d5;
  animation-timing-function: cubic-bezier(0, 1, 1, 0);
}

.lds-ellipsis div:nth-child(1) {
  left: 8px;
  animation: lds-ellipsis1 0.6s infinite;
}

.lds-ellipsis div:nth-child(2) {
  left: 8px;
  animation: lds-ellipsis2 0.6s infinite;
}

.lds-ellipsis div:nth-child(3) {
  left: 32px;
  animation: lds-ellipsis2 0.6s infinite;
}

.lds-ellipsis div:nth-child(4) {
  left: 56px;
  animation: lds-ellipsis3 0.6s infinite;
}

@keyframes lds-ellipsis1 {
  0% {
    transform: scale(0);
  }

  100% {
    transform: scale(1);
  }
}

@keyframes lds-ellipsis3 {
  0% {
    transform: scale(1);
  }

  100% {
    transform: scale(0);
  }
}

@keyframes lds-ellipsis2 {
  0% {
    transform: translate(0, 0);
  }

  100% {
    transform: translate(24px, 0);
  }
}
</style>
