<template>
  <div class="vector-layer">
    <section>
      <div class="block">
        <b-tooltip label="Cursor" position="is-top">
          <button
            :class="{ 'is-primary': !config.draw_enable }"
            @click="
              disableSelectInteraction();
              config.draw_enable = false;
              updateDrawInteraction();
              $forceUpdate();
            "
            class="button is-medium"
          >
            <b-icon icon="cursor-default-outline" size="is-medium"> </b-icon>
          </button>
        </b-tooltip>
        <b-tooltip label="Draw Mode" position="is-top">
          <button
            :class="{ 'is-primary': config.draw_enable }"
            @click="
              config.draw_enable = true;
              updateDrawInteraction();
              $forceUpdate();
            "
            class="button is-medium"
          >
            <b-icon icon="lead-pencil" size="is-medium"> </b-icon>
          </button>
        </b-tooltip>
        <b-tooltip label="Edge Color" position="is-top">
          <v-swatches
            :disabled="!config.draw_enable"
            style="top: 10px;margin:1px;"
            :swatches="[
              '#0084ff',
              '#44bec7',
              '#ffc300',
              '#fa3c4c',
              '#d696bb',
              '#ff48c4',
              { color: '#ffffff', showBorder: true },
              '#000000'
            ]"
            :show-border="true"
            :trigger-style="{
              width: '36px',
              height: '36px',
              'border-radius': '5px'
            }"
            swatch-size="32"
            v-model="current_label.color"
            show-fallback
            fallback-input-type="color"
            popover-x="left"
            @input="colorChanged"
          ></v-swatches>
        </b-tooltip>
      </div>
      <b-field label="Label">
        <b-numberinput
          v-model="current_label.index"
          @input="switchLabel(current_label.index)"
          size="is-small"
          min="0"
          step="1"
          controls-position="compact"
        ></b-numberinput>
      </b-field>
      <b-field label="Brush Size">
        <b-slider v-model="current_label.width" size="is-small"></b-slider>
      </b-field>
    </section>
    <br />
    <section>
      <input
        ref="file_input"
        @change="loadLabels($event.target.files[0])"
        type="file"
        style="display:none;"
      />

      <b-button
        v-if="vector_source"
        @click="$refs.file_input.click()"
        icon-left="file-import"
      >
        Load
      </b-button>
      <b-button
        v-if="vector_source"
        @click="exportFeatures()"
        icon-left="file-export"
      >
        Export
      </b-button>
      <b-button v-if="vector_source" @click="clearFeatures()" icon-left="close">
        Clear
      </b-button>
    </section>
  </div>
</template>

<script>
import VSwatches from "vue-swatches";
import "vue-swatches/dist/vue-swatches.css";
import { Map } from "ol";
import VectorLayer from "ol/layer/Vector";
import { Style, Fill, Stroke, Circle } from "ol/style";
import { Draw } from "ol/interaction";
import { Vector } from "ol/source";
import { GeoJSON } from "ol/format";

function getRandomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// eslint-disable-next-line no-unused-vars
function saveFile(blob, filename) {
  if (window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveOrOpenBlob(blob, filename);
  } else {
    const a = document.createElement("a");
    document.body.appendChild(a);
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 0);
  }
}

class LabelsLayer extends VectorLayer {
  //TODO: add rendering
}

export default {
  name: "label-layer",
  type: "label",
  show: true,
  components: { VSwatches },
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
      vector_source: null,
      draw_history: [],
      all_labels: {},
      current_label: { index: 0, color: getRandomColor(), width: 10 }
    };
  },
  watch: {
    current_label: function(newVal) {
      this.config.current_label = newVal;
    },
    selected: function() {
      this.updateDrawInteraction();
    },
    visible: function(newVal) {
      this.layer.setVisible(newVal);
      this.updateDrawInteraction();
    }
  },
  mounted() {
    this.default_config = {
      data: null,
      num_colors: 50,
      properties: null,
      color: null,
      seed: 0.5,
      name: "label",
      z_index: null,
      metadata: null,
      scale: 1,
      translate: 0,
      rotate: null,
      shear: null,
      affine: null,
      opacity: 0.7,
      blending: "translucent",
      visible: true,
      multiscale: null
    };
    for (let k in this.default_config) {
      if (!this.config[k]) {
        this.config[k] = this.default_config[k];
      }
    }
    this.config.init = this.init;
    this.all_labels[this.current_label.index] = this.current_label;
    document.addEventListener("keydown", this.keyHandler);
  },
  beforeDestroy() {
    document.removeEventListener("keydown", this.keyHandler);
    if (this.layer) {
      this.removeDrawInteraction();
      this.map.removeLayer(this.layer);
    }
  },
  created() {},
  methods: {
    async init() {
      this.layer = await this.setupLayer();
      this.map.addLayer(this.layer);
      this.updateDrawInteraction();
      this.$forceUpdate();
      return this.layer;
    },
    keyHandler(event) {
      if (!this.selected || !this.visible) return;
      if (event.code === "Backspace" || event.code === "Delete") {
        this.deleteDraw();
      } else if (event.code === "KeyZ" && (event.metaKey || event.ctrlKey)) {
        this.undoDraw();
      }
    },
    getConfig(name, i) {
      if (Array.isArray(this.config[name])) {
        return this.config[name][i || 0];
      } else {
        return this.config[name];
      }
    },
    async setupLayer() {
      const data = this.config.data;
      if (typeof data === "string") {
        this.vector_source = new Vector({
          url: data,
          format: new GeoJSON()
        });
      } else if (data instanceof File) {
        this.vector_source = new Vector();
        await this.loadLabels(data);
      } else if (data) {
        // this.vector_source = new Vector();
        // const features = this.getFeaturesFromConfig();
        // this.vector_source.addFeatures(features);
      } else {
        this.vector_source = new Vector();
      }
      const vector_layer = new LabelsLayer({
        source: this.vector_source
      });
      vector_layer.setStyle(this.featureStyle);
      this.vector_source.on("addfeature", event => {
        if (event.feature._undoing) {
          delete event.feature._undoing;
        } else {
          if (!event.feature._skip_history)
            this.draw_history.push({ add: event.feature });
        }
      });
      this.vector_source.on("removefeature", event => {
        if (event.feature._undoing) {
          delete event.feature._undoing;
        } else {
          if (!event.feature._skip_history)
            this.draw_history.push({ remove: event.feature });
        }
      });
      vector_layer.getLayerAPI = this.getLayerAPI;
      return vector_layer;
    },
    deleteDraw() {
      if (this.vector_source) {
        this.clearFeatures();
      }
    },
    async undoDraw() {
      if (this.draw_history.length > 0) {
        const action = this.draw_history.pop();
        if (action.add) {
          if (!Array.isArray(action.add)) {
            action.add = [action.add];
          }
          const allFeatures = this.vector_source.getFeatures();
          allFeatures.forEach(feature => {
            for (const f of action.add) {
              if (f === feature) {
                feature._undoing = true;
                this.vector_source.removeFeature(feature);
              }
            }
          });
        }

        if (action.remove) {
          if (!Array.isArray(action.remove)) {
            action.remove = [action.remove];
          }
          for (const f of action.remove) {
            f._undoing = true;
            this.vector_source.addFeature(f);
          }
        }
      }
    },
    getLayerAPI() {
      const me = this;
      return {
        _rintf: true,
        name: this.config.name,
        id: this.config.id,
        clear_features() {
          me.vector_source.clear(true);
        },
        set_features(geojson_data) {
          const format = new GeoJSON();
          const geojsonFeatures = format.readFeatures(geojson_data);
          me.vector_source.clear(true);
          me.vector_source.addFeatures(geojsonFeatures);
        },
        add_feature(feature) {
          const geojson_data = {
            type: "FeatureCollection",
            features: [feature]
          };
          const format = new GeoJSON();
          const geojsonFeatures = format.readFeatures(geojson_data);
          me.vector_source.addFeatures(geojsonFeatures);
        },
        add_features(geojson_data) {
          const format = new GeoJSON();
          const geojsonFeatures = format.readFeatures(geojson_data);
          me.vector_source.addFeatures(geojsonFeatures);
        },
        get_features(config) {
          config = config || {};
          if (config.decimals === undefined) config.decimals = 2;
          const allFeatures = me.vector_source.getFeatures();
          const format = new GeoJSON();
          const routeFeatures = format.writeFeaturesObject(allFeatures, {
            decimals: config.decimals
          });
          return routeFeatures;
        }
      };
    },
    clearFeatures() {
      if (this.vector_source)
        if (
          window.confirm(
            `Are you sure about removing all the features in this layer (${this.config.name})?`
          )
        ) {
          this.vector_source.clear(true);
        }
    },
    loadLabels(selected_file) {
      return new Promise((resolve, reject) => {
        if (!selected_file) reject("No file");
        var reader = new FileReader();
        // reader.onload = event => {
        //   try {
        //     const geojson_data = JSON.parse(event.target.result);
        //     const format = new GeoJSON();
        //     const geojsonFeatures = format.readFeatures(geojson_data);
        //     this.vector_source.addFeatures(geojsonFeatures);
        //     resolve();
        //   } catch (e) {
        //     reject(e);
        //   }
        // };
        reader.onerror = event => {
          reader.abort();
          console.error(event);
        };
        reader.readAsText(selected_file);
      });
    },
    exportFeatures() {
      // decimals = decimals === undefined ? 1 : decimals;
      // const allFeatures = this.vector_source.getFeatures();
      // const format = new GeoJSON();
      // const routeFeatures = format.writeFeaturesObject(allFeatures, {
      //   decimals: decimals
      // });
      // const blob = new Blob([JSON.stringify(routeFeatures)], {
      //   type: "text/plain;charset=utf-8"
      // });
      // saveFile(blob, this.config.name + "_" + this.config.id + ".json");
    },
    updateDrawInteraction() {
      if (this.selected && this.visible && this.config.draw_enable) {
        this.setupDrawInteraction();
      } else {
        this.removeDrawInteraction();
      }
    },
    removeDrawInteraction() {
      if (this.draw) {
        this.map.removeInteraction(this.draw);
      }
    },
    colorChanged() {
      const allFeatures = this.vector_source.getFeatures();
      allFeatures.forEach(feature => {
        if (feature.get("index") === this.current_label.index) {
          feature.set("color", this.current_label.color);
        }
      });
    },
    switchLabel(index) {
      if (this.all_labels[index]) {
        this.current_label = this.all_labels[index];
      } else {
        this.all_labels[index] = {
          index,
          color: getRandomColor(),
          width: this.current_label.width
        };
        this.current_label = this.all_labels[index];
      }
      this.$forceUpdate();
    },
    featureStyle(feature) {
      const color = feature.get("color");
      const width = feature.get("width");
      const color_style = new Style({
        fill: new Fill({
          color
        }),
        stroke: new Stroke({
          color,
          width
        }),
        image: new Circle({
          radius: width || this.current_label.width / 2,
          fill: new Fill({
            color: "#fbe00870"
          }),
          stroke: new Stroke({
            width: 2,
            color: color || this.current_label.color
          })
        })
      });
      return color_style;
    },
    setupDrawInteraction() {
      if (!this.vector_source) return;
      this.$nextTick(() => {
        if (this.draw) {
          this.map.removeInteraction(this.draw);
        }

        const draw = new Draw({
          source: this.vector_source,
          type: "LineString",
          freehand: true,
          style: this.featureStyle
        });
        this.map.addInteraction(draw);
        draw.on("drawstart", async evt => {
          draw.set("style");
          const feature = evt.feature;
          feature.set("index", this.current_label.index);
          feature.set("color", this.current_label.color);
          feature.set("width", this.current_label.width);
          feature.setStyle(this.featureStyle(feature));
        });
        this.draw = draw;
      });
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.vue-swatches__trigger {
  border-style: solid;
}
</style>
