<!-- taken from https://vuejsexamples.com/responsive-image-content-comparison-slider-built-with-vue/ -->
<template>
  <div class="itk-vtk-layer">
    <section
      :id="'itk-vtk-control_' + config.id"
      style="position: relative;"
    ></section>
    <b-field label="opacity">
      <b-slider
        v-model="config.opacity"
        @input="updateOpacity"
        :min="0"
        :max="1.0"
        :step="0.1"
      ></b-slider>
    </b-field>
  </div>
</template>

<script>
import { Map } from "ol";
import Layer from "ol/layer/Layer";
import stringify from "json-stringify-safe";

const CanvasLayer = /*@__PURE__*/ (function(Layer) {
  function CanvasLayer(options) {
    options = options || {};
    Layer.call(this, options);
    this.viewerElement = document.createElement("div");
    this.viewerElement.classList.add("ol-layer");
    this.viewerElement.style.position = "absolute";
    this.viewerElement.style.width = "100%";
    this.viewerElement.style.height = "100%";
    const canvas = document.createElement("canvas");
    canvas.style.position = "absolute";
    canvas.style.left = "0";
    this.viewerElement.appendChild(canvas);
    this.canvasElement = canvas;

    if (!options.renderFunction) throw "render function is not specified";
    this._renderFunction = options.renderFunction;
  }

  if (Layer) CanvasLayer.__proto__ = Layer;
  CanvasLayer.prototype = Object.create(Layer && Layer.prototype);
  CanvasLayer.prototype.constructor = CanvasLayer;

  CanvasLayer.prototype.getSourceState = function getSourceState() {
    return "ready";
  };

  CanvasLayer.prototype.render = function render(frameState) {
    debugger;
    this.viewerElement.style.opacity = this.getOpacity();
    if (!this._rendering) {
      this._rendering = true;
      this._renderFunction(
        JSON.parse(
          stringify({
            extent: frameState.extent,
            index: frameState.index,
            layerIndex: frameState.layerIndex,
            pixelRatio: frameState.pixelRatio,
            coordinateToPixelTransform: frameState.coordinateToPixelTransform,
            pixelToCorrdinateTransform: frameState.pixelToCorrdinateTransform,
            size: frameState.size,
            time: frameState.time,
            viewState: {
              center: frameState.viewState.center,
              resolution: frameState.viewState.resolution,
              rotation: frameState.viewState.rotation,
              zoom: frameState.viewState.zoom
            }
          })
        )
      )
        .then(workerState => {
          const canvas = this.canvasElement;
          // Worker provies a new render frame
          requestAnimationFrame(() => {
            const img = new Image();
            img.onload = function() {
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext("2d");
              ctx.drawImage(img, 0, 0);
            };
            const blob = new Blob([workerState.data], {
              type: workerState.mime
            });
            img.src = URL.createObjectURL(blob);
            if (workerState.transform)
              canvas.style.transform = workerState.transform;
          });
          this._rendering = false;
        })
        .catch(e => {
          console.error(e);
        });
    } else {
      frameState.animate = true;
    }
    return this.viewerElement;
  };

  return CanvasLayer;
})(Layer);

export default {
  name: "remote-layer",
  type: "remote",
  show: false,
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
      mode: "2D"
    };
  },
  watch: {
    visible: function(newVal) {
      this.layer.setVisible(newVal);
      this.renderWindow.render();
    }
  },
  mounted() {
    this.config.name = this.config.name || "remote";
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
      this.$forceUpdate();
      return this.layer;
    },
    updateOpacity() {
      if (this.layer) this.layer.setOpacity(this.config.opacity);
    },
    selectLayer() {},
    async setupLayer() {
      return new CanvasLayer({ renderFunction: this.config.render });
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.itk-vtk-layer > section > div > div > div > canvas {
  max-width: 100%;
  height: 140px;
}
.itk-vtk-layer > section > div {
  background: #dedddf;
}
.itk-vtk-layer > section > div:first-child {
  display: none;
}
.selected-box {
  width: 100% !important;
}
.selected-icon {
  width: 100% !important;
}
.icon-select .box {
  left: unset !important;
  top: 24px !important;
}
</style>
