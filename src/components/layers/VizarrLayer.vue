<template>
  <div class="itk-vtk-layer">
    <section>
      <input
        ref="file_input"
        @change="resolveFiles && resolveFiles($event)"
        type="file"
        style="display:none;"
        multiple
      />

      <b-button
        v-if="showLoadButton"
        @click="$refs.file_input.click()"
        icon-left="file-import"
      >
        Load File(s)
      </b-button>
    </section>
    <b-field v-if="layer" label="opacity">
      <b-slider
        v-model="config.opacity"
        @input="updateOpacity"
        :min="0"
        :max="1.0"
        :step="0.1"
      ></b-slider>
    </b-field>
    <section
      :id="'itk-vtk-control_' + config.id"
      style="position: relative;"
    ></section>
  </div>
</template>

<script>
import { Map } from "ol";
import Layer from "ol/layer/Layer";

const CanvasLayer = /*@__PURE__*/ (function(Layer) {
  function CanvasLayer(options) {
    options = options || {};
    Layer.call(this, options);
    this.viewerElement = document.createElement("div");
    this.viewerElement.classList.add("ol-layer");
    this.viewerElement.style.position = "absolute";
    this.viewerElement.style.width = "100%";
    this.viewerElement.style.height = "100%";
    this.sync_callback = options.sync_callback;
  }

  if (Layer) CanvasLayer.__proto__ = Layer;
  CanvasLayer.prototype = Object.create(Layer && Layer.prototype);
  CanvasLayer.prototype.constructor = CanvasLayer;

  CanvasLayer.prototype.getSourceState = function getSourceState() {
    return "ready";
  };

  CanvasLayer.prototype.render = function render(frameState) {
    if (this.sync_callback) {
      const center = frameState.viewState.center
      const zoom = frameState.viewState.zoom
      this.sync_callback(center, zoom);
    }


    this.viewerElement.style.opacity = this.getOpacity();
    return this.viewerElement; //return the viewer element
  };

  return CanvasLayer;
})(Layer);

export default {
  name: "vizarr-layer",
  type: "vizarr",
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
      mode: "2D",
      resolveFiles: null,
      showLoadButton: false,
      viewer: null
    };
  },
  watch: {
    visible: function(newVal) {
      this.layer.setVisible(newVal);
      this.$forceUpdate();
    }
  },
  mounted() {
    this.config.name = this.config.name || "vizarr image";
    this.config.opacity = 1.0;
    this.config.init = this.init;
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
      if (typeof this.config.data === "string") {
        this.config.source = this.config.data;
      }
      this.viewer.addImage(this.config);
      window.viewer = this.viewer;
      window.map = this.map;
      this.$forceUpdate();
      return this.layer;
    },
    updateOpacity() {
      if (this.layer) this.layer.setOpacity(this.config.opacity);
    },
    selectLayer() {},

    setupLayer() {
      return new Promise(resolve => {
        const vizarrLayer = new CanvasLayer();
        if (window.CreateVizarrViewer) {
          window.CreateVizarrViewer(vizarrLayer.viewerElement).then(viewer => {
            this.viewer = viewer;
            vizarrLayer.sync_callback = (center, zoom)=>{
                viewer.setViewState({target: [center[0], center[1], 0], zoom})
            }
            resolve(vizarrLayer);
          });
        } else {
          window.document.addEventListener("vizarr-loaded", () => {
            window
              .CreateVizarrViewer(vizarrLayer.viewerElement)
              .then(viewer => {
                this.viewer = viewer;
                // vizarrLayer.sync_callback = (center, zoom)=>{
                //     viewer.setViewState({target: [center[0], center[1], 0], zoom: zoom-10})
                // }
                resolve(vizarrLayer);
              });
          });
        }
      });
    },
    getLayerAPI() {
      const me = this;
      return {
        _rintf: true,
        name: this.config.name,
        id: this.config.id,
        async set_image(image) {
          const vtkImage = await me.normalizeImage(image);
          me.viewer.setImage(vtkImage);
        }
      };
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style></style>
