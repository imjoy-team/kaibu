<!-- taken from https://vuejsexamples.com/responsive-image-content-comparison-slider-built-with-vue/ -->
<template>
  <div class="image-layer">
    <section v-if="layer">
      <b-field label="opacity">
        <b-slider
          v-model="config.opacity"
          @input="updateOpacity"
          :min="0"
          :max="1.0"
          :step="0.1"
        ></b-slider>
      </b-field>
      <p
        v-for="(sel, k) in config.viewerConfig.loaderSelection"
        :key="sel.channel"
      >
        {{ sel.channel }}:{{ pixelValues[k] }}
      </p>
    </section>
  </div>
</template>

<script>
import { Map } from "ol";
import Layer from "ol/layer/Layer";
import { createZarrLoader } from "@hubmap/vitessce-image-viewer";
import Viv from "../Viv.vue";
import Vue from "vue";
const VivComponent = Vue.extend(Viv);

const DEFAULT_VIEW_STATE = { zoom: -6, target: [25000, 10000, 0] };

const channelNames = [
  "DAPI - Hoechst (nuclei)",
  "FITC - Laminin (basement membrane)",
  "Cy3 - Synaptopodin (glomerular)",
  "Cy5 - THP (thick limb)"
];
const defaultData = {
  url: `https://vitessce-data.storage.googleapis.com/0.0.25/master_release/spraggins/spraggins.mxif.zarr`,
  dimensions: [
    { field: "channel", type: "nominal", values: channelNames },
    { field: "y", type: "quantitative", values: null },
    { field: "x", type: "quantitative", values: null }
  ],
  isPublic: true,
  isPyramid: true,
  selections: channelNames.map(name => ({ channel: name }))
};

const defaultViewerConfig = {
  sliderValues: [
    [1500, 20000],
    [1500, 20000],
    [1500, 20000],
    [1500, 20000]
  ],
  colorValues: [
    [0, 0, 255],
    [0, 255, 0],
    [255, 0, 0],
    [255, 255, 0]
  ],
  channelIsOn: [true, true, true, false],
  loaderSelection: defaultData.selections,
  initialViewState: defaultData.initialViewState || DEFAULT_VIEW_STATE,
  colormap: false,
  overview: {
    boundingBoxColor: [0, 0, 255]
  },
  overviewOn: false
};

const CanvasLayer = /*@__PURE__*/ (function(Layer) {
  function CanvasLayer(options) {
    options = options || {};
    Layer.call(this, options);
    this.viewerElement = document.createElement("div");
    this.viewerElement.classList.add("ol-layer");
    this.viewerElement.style.position = "absolute";
    this.viewerElement.style.width = "100%";
    this.viewerElement.style.height = "100%";
    const instance = new VivComponent({ propsData: { options: options } });
    instance.$mount();
    this.viewerElement.appendChild(instance.$el);
  }

  if (Layer) CanvasLayer.__proto__ = Layer;
  CanvasLayer.prototype = Object.create(Layer && Layer.prototype);
  CanvasLayer.prototype.constructor = CanvasLayer;

  CanvasLayer.prototype.getSourceState = function getSourceState() {
    return "ready";
  };

  CanvasLayer.prototype.render = function render() {
    this.viewerElement.style.opacity = this.getOpacity();
    return this.viewerElement;
  };

  return CanvasLayer;
})(Layer);

export default {
  name: "viv-layer",
  type: "viv",
  show: true,
  props: {
    map: {
      type: Map,
      default: null
    },
    selected: {
      type: Boolean,
      default: false
    },
    visible: {
      type: Boolean,
      default: false
    },
    config: {
      type: Object,
      default: function() {
        return {};
      }
    }
  },
  data() {
    return {
      layer: null,
      pixelValues: []
    };
  },
  watch: {
    visible: function(newVal) {
      this.layer.setVisible(newVal);
    }
  },
  mounted() {
    this.config.climit = [4, 50];
    this.config.opacity = 1.0;
    this.config.init = this.init;
    this.config.data = this.config.data || defaultData;
    this.config.viewerConfig = this.config.viewerConfig || defaultViewerConfig;
  },
  beforeDestroy() {
    if (this.layer) {
      this.map.removeLayer(this.layer);
    }
  },
  created() {},
  methods: {
    async init() {
      this.layer = await this.setupLayer();
      this.map.addLayer(this.layer);
      this.$forceUpdate();
      return this.layer;
    },
    updateOpacity() {
      if (this.layer) this.layer.setOpacity(this.config.opacity);
    },
    selectLayer() {},
    async setupLayer() {
      const loader = await createZarrLoader(this.config.data);
      const hooks = {
        handleValue: this.showPixelValues
      };
      return new CanvasLayer({
        loader: loader,
        hoverHooks: hooks,
        ...this.config.viewerConfig
      });
    },
    showPixelValues(values) {
      this.pixelValues = values;
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style></style>
