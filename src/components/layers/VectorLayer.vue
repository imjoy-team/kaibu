<!-- taken from https://vuejsexamples.com/responsive-image-content-comparison-slider-built-with-vue/ -->
<template>
  <div class="vector-layer">
    <section>
      <div class="block">
        <b-tooltip label="Cursor" position="is-top">
          <button
            :class="{ 'is-primary': !config.draw_enable && !select }"
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
        <b-tooltip label="Select/Modify" position="is-top">
          <button
            :class="{ 'is-primary': !config.draw_enable && select }"
            @click="
              enableSelectInteraction();
              config.draw_enable = false;
              updateDrawInteraction();
              $forceUpdate();
            "
            class="button is-medium"
          >
            <b-icon icon="cursor-default" size="is-medium"> </b-icon>
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
        &nbsp;&nbsp; &nbsp;&nbsp;
        <b-tooltip label="Freehand Mode" position="is-top">
          <button
            :disabled="!config.draw_enable"
            :class="{ 'is-primary': config.draw_freehand }"
            @click="
              config.draw_freehand = !config.draw_freehand;
              updateDrawInteraction();
              $forceUpdate();
            "
            class="button"
          >
            <b-icon icon="gesture"> </b-icon>
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
            v-model="draw_edge_color"
            show-fallback
            fallback-input-type="color"
            popover-x="left"
          ></v-swatches>
        </b-tooltip>
        <b-tooltip label="Face Color" position="is-top">
          <v-swatches
            :disabled="!config.draw_enable"
            style="top: 10px;margin:1px;"
            :swatches="[
              '#0084ff60',
              '#44bec760',
              '#ffc30060',
              '#fa3c4c60',
              '#d696bb60',
              '#f3ea5f60',
              '#ff48c460',
              '#00000000'
            ]"
            :show-border="true"
            :trigger-style="{
              width: '36px',
              height: '36px',
              'border-radius': '5px'
            }"
            swatch-size="32"
            v-model="draw_face_color"
            show-fallback
            fallback-input-type="color"
            popover-x="left"
          ></v-swatches>
        </b-tooltip>
      </div>
      <div class="block">
        <b-tooltip
          v-for="(icon, type) in draw_types"
          :key="type"
          :label="type"
          position="is-bottom"
        >
          <button
            :disabled="!config.draw_enable"
            :class="{ 'is-primary': config.draw_shape_type === type }"
            @click="setDrawType(type)"
            class="button"
          >
            <b-icon :icon="icon" size="is-medium"> </b-icon>
          </button>
        </b-tooltip>
      </div>
      <b-field label="Edge Width">
        <b-numberinput
          v-model="config.draw_edge_width"
          size="is-small"
          controls-position="compact"
        ></b-numberinput>
      </b-field>
      <b-field label="Point Size" v-if="config.draw_shape_type === 'Point'">
        <b-numberinput
          v-model="config.draw_size"
          size="is-small"
          controls-position="compact"
        ></b-numberinput>
      </b-field>
    </section>
    <br />
    <section>
      <input
        ref="file_input"
        @change="loadFeatures($event.target.files[0])"
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
import { Circle, Style, Fill, Stroke, Text } from "ol/style";
import { Draw, Select, Modify, Snap } from "ol/interaction";
import { Vector } from "ol/source";
import { GeoJSON } from "ol/format";
import Polygon from "ol/geom/Polygon";
import { createRegularPolygon, createBox } from "ol/interaction/Draw";

function getRandomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

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

export default {
  name: "vector-layer",
  type: "vector",
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
      select: null,
      vector_source: null,
      draw_history: [],
      draw_edge_color: null,
      draw_face_color: null,
      draw_types: {
        Polygon: "vector-polygon",
        LineString: "vector-polyline",
        Rectangle: "vector-rectangle",
        Square: "vector-square",
        Circle: "vector-circle-variant",
        Star: "octagram-outline",
        Point: "plus-circle-outline"
      }
    };
  },
  watch: {
    draw_edge_color: function(newVal) {
      this.config.draw_edge_color = newVal;
    },
    draw_face_color: function(newVal) {
      this.config.draw_face_color = newVal;
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
      shape_type: "polygon",
      edge_width: 2,
      edge_color: getRandomColor(),
      face_color: "rgba(255, 255, 255, 0.2)",
      z_index: null,
      name: "vector",
      metadata: null,
      scale: 1,
      translate: 0,
      opacity: 1.0,
      blending: "additive",
      visible: true,
      size: 7,
      // custom fields
      draw_enable: false,
      draw_freehand: true,
      draw_label: null,
      draw_size: 7,
      draw_shape_type: "Polygon",
      draw_face_color: "#FFFFFF0F",
      draw_edge_width: 2,
      draw_edge_color: getRandomColor()
    };
    for (let k in this.default_config) {
      if (!this.config[k]) {
        this.config[k] = this.default_config[k];
      }
    }
    this.config.init = this.init;

    if (Array.isArray(this.config.data)) {
      // make sure we have an array of properties
      for (let key of [
        "shape_type",
        "edge_width",
        "edge_color",
        "face_color",
        "size",
        "z_index",
        "label"
      ]) {
        if (Array.isArray(this.config[key])) {
          if (this.config[key].length !== this.config.data.length) {
            throw `Invalid length: ${key} should have ${this.config.data.length} elements.`;
          }
        }
      }
      this.config.draw_edge_color =
        this.config.draw_edge_color || this.getConfig("edge_color", 0);
      this.config.draw_edge_width =
        this.config.draw_edge_width || this.getConfig("edge_width", 0);
      this.config.draw_face_color =
        this.config.draw_face_color || this.getConfig("face_color", 0);
    }
    this.draw_edge_color = this.config.draw_edge_color;
    this.draw_face_color = this.config.draw_face_color;

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
      this.layer = await this.getLayer();
      this.map.addLayer(this.layer);
      this.updateDrawInteraction();
      this.$forceUpdate();
      return this.layer;
    },
    setDrawType(type) {
      this.config.draw_shape_type = type;
      this.$forceUpdate();
      this.updateDrawInteraction();
    },
    keyHandler(event) {
      if (!this.selected || !this.visible) return;
      if (event.code === "Backspace" || event.code === "Delete") {
        this.deleteDraw();
      } else if (event.code === "KeyZ" && (event.metaKey || event.ctrlKey)) {
        this.undoDraw();
      } else if (event.code === "ArrowRight") {
        if (event.metaKey || event.ctrlKey) this.moveSelected(1, 0);
        else if (event.shiftKey) this.moveSelected(30, 0);
        else this.moveSelected(10, 0);
      } else if (event.code === "ArrowLeft") {
        if (event.metaKey || event.ctrlKey) this.moveSelected(-1, 0);
        else if (event.shiftKey) this.moveSelected(-30, 0);
        else this.moveSelected(-10, 0);
      } else if (event.code === "ArrowUp") {
        if (event.metaKey || event.ctrlKey) this.moveSelected(0, 1);
        else if (event.shiftKey) this.moveSelected(0, 30);
        else this.moveSelected(0, 10);
      } else if (event.code === "ArrowDown") {
        if (event.metaKey || event.ctrlKey) this.moveSelected(0, -1);
        else if (event.shiftKey) this.moveSelected(0, -30);
        else this.moveSelected(0, -10);
      }
    },
    moveSelected(deltaX, deltaY) {
      const features = this.select.getFeatures();

      features.forEach(feature => {
        feature.getGeometry().translate(deltaX, deltaY);
      });
    },
    getConfig(name, i) {
      if (Array.isArray(this.config[name])) {
        return this.config[name][i || 0];
      } else {
        return this.config[name];
      }
    },
    getFeaturesFromConfig() {
      const type_mapping = {
        line: "LineString",
        path: "LineString",
        polygon: "Polygon",
        rectangle: "Polygon",
        point: "MultiPoint",
        "multi-point": "MultiPoint"
      };
      let features = [];
      const data = this.config.data;
      if (
        ["point", "multi-point", "MultiPoint"].includes(this.config.shape_type)
      ) {
        const feature = {};
        feature.type = "Feature";
        feature.geometry = {
          type: "MultiPoint",
          coordinates: data
        };
        feature.properties = {
          label: this.getConfig("label"),
          size: this.getConfig("size"),
          edge_width: this.getConfig("edge_width"),
          edge_color: this.getConfig("edge_color"),
          face_color: this.getConfig("face_color")
        };
        features = [feature];
      } else {
        for (let i = 0; i < data.length; i++) {
          const feature = {};
          let shape_type = this.getConfig("shape_type", i);
          // converting napari shape types
          shape_type = type_mapping[shape_type] || shape_type;
          feature.type = "Feature";
          feature.geometry = {
            type: shape_type,
            coordinates: shape_type === "Polygon" ? [data[i]] : data[i]
          };
          feature.properties = {
            label: this.getConfig("label", i),
            size: this.getConfig("size"),
            edge_width: this.getConfig("edge_width", i),
            edge_color: this.getConfig("edge_color", i),
            face_color: this.getConfig("face_color", i)
          };
          features.push(feature);
        }
      }

      const geojson_data = {
        type: "FeatureCollection",
        features: features
      };
      const format = new GeoJSON();
      return format.readFeatures(geojson_data);
    },
    async getLayer() {
      const data = this.config.data;
      if (typeof data === "string") {
        this.vector_source = new Vector({
          url: data,
          format: new GeoJSON()
        });
      } else if (data instanceof File) {
        this.vector_source = new Vector();
        await this.loadFeatures(data);
      } else if (data) {
        this.vector_source = new Vector();
        const features = this.getFeaturesFromConfig();
        this.vector_source.addFeatures(features);
      } else {
        this.vector_source = new Vector();
      }
      const vector_layer = new VectorLayer({
        source: this.vector_source
      });
      vector_layer.setStyle(this.featureStyle);

      vector_layer.getLayerAPI = this.getLayerAPI;
      this.vector_source.on("addfeature", event => {
        if (event.feature._undoing) {
          delete event.feature._undoing;
        } else {
          this.draw_history.push({ add: event.feature });
        }
      });
      this.vector_source.on("removefeature", event => {
        if (event.feature._undoing) {
          delete event.feature._undoing;
        } else {
          this.draw_history.push({ remove: event.feature });
        }
      });
      return vector_layer;
    },
    deleteDraw() {
      if (this.vector_source) {
        if (this.select) {
          const features = this.select.getFeatures();
          if (features.length === 0) {
            this.clearFeatures();
          } else {
            features.forEach(feature => {
              this.vector_source.removeFeature(feature);
              features.remove(feature);
            });
          }
        } else {
          this.clearFeatures();
        }
      }
    },
    async undoDraw() {
      if (this.draw_history.length > 0) {
        const action = this.draw_history.pop();
        if (action.add) {
          const allFeatures = this.vector_source.getFeatures();
          allFeatures.forEach(feature => {
            if (action.add === feature) {
              feature._undoing = true;
              this.vector_source.removeFeature(feature);
              if (this.select) this.select.getFeatures().remove(feature);
            }
          });
        } else if (action.remove) {
          action.remove._undoing = true;
          this.vector_source.addFeature(action.remove);
        }
      }
    },
    getLayerAPI() {
      const me = this;
      return {
        _rintf: true,
        name: this.config.name,
        id: this.config.id,
        clear() {
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
    loadFeatures(selected_file) {
      return new Promise((resolve, reject) => {
        if (!selected_file) reject("No file");
        var reader = new FileReader();
        reader.onload = event => {
          const geojson_data = JSON.parse(event.target.result);
          const format = new GeoJSON();
          const geojsonFeatures = format.readFeatures(geojson_data);
          this.vector_source.addFeatures(geojsonFeatures);
          resolve();
        };
        reader.onerror = event => {
          reader.abort();
          console.error(event);
        };
        reader.readAsText(selected_file);
      });
    },
    exportFeatures(decimals) {
      decimals = decimals === undefined ? 1 : decimals;
      const allFeatures = this.vector_source.getFeatures();
      const format = new GeoJSON();
      const routeFeatures = format.writeFeaturesObject(allFeatures, {
        decimals: decimals
      });
      const blob = new Blob([JSON.stringify(routeFeatures)], {
        type: "text/plain;charset=utf-8"
      });
      saveFile(blob, this.config.name + "_" + this.config.id + ".json");
    },
    enableSelectInteraction() {
      this.select = new Select({
        wrapX: false
      });
      this.map.addInteraction(this.select);

      this.modify = new Modify({
        source: this.vector_source
      });
      this.modify.createVertices = true;
      this.map.addInteraction(this.modify);

      this.snap = new Snap({ source: this.vector_source });
      this.map.addInteraction(this.snap);
    },
    disableSelectInteraction() {
      if (this.select) {
        this.map.removeInteraction(this.select);
        this.select = null;
      }
      if (this.modify) {
        this.map.removeInteraction(this.modify);
        this.modify = null;
      }
      if (this.snap) {
        this.map.removeInteraction(this.snap);
        this.snap = null;
      }
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
    featureStyle(feature, resolution) {
      const label = feature.get("label");
      const size = feature.get("size");
      const edge_color = feature.get("edge_color");
      const edge_width = feature.get("edge_width");
      const face_color = feature.get("face_color");
      const color_style = new Style({
        fill: new Fill({
          color: face_color
        }),
        stroke: new Stroke({
          color: edge_color,
          width: edge_width
        }),
        text: new Text({
          text: label,
          font: "14px Calibri,sans-serif",
          fill: new Fill({
            color: "#000"
          }),
          stroke: new Stroke({
            color: edge_color,
            width: 4
          })
        }),
        image: new Circle({
          radius: size / Math.pow(resolution, 1 / 3),
          stroke: new Stroke({
            color: edge_color,
            width: edge_width
          }),
          fill: new Fill({
            color: face_color
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
        let draw_type = this.config.draw_shape_type;

        // title case
        draw_type = draw_type.charAt(0).toUpperCase() + draw_type.slice(1);

        let geometryFunction;
        if (draw_type === "Square") {
          draw_type = "Circle";
          geometryFunction = createRegularPolygon(4);
        } else if (draw_type === "Rectangle") {
          draw_type = "Circle";
          geometryFunction = createBox();
        } else if (draw_type === "Star") {
          draw_type = "Circle";
          geometryFunction = function(coordinates, geometry) {
            var center = coordinates[0];
            var last = coordinates[1];
            var dx = center[0] - last[0];
            var dy = center[1] - last[1];
            var radius = Math.sqrt(dx * dx + dy * dy);
            var rotation = Math.atan2(dy, dx);
            var newCoordinates = [];
            var numPoints = 12;
            for (var i = 0; i < numPoints; ++i) {
              var angle = rotation + (i * 2 * Math.PI) / numPoints;
              var fraction = i % 2 === 0 ? 1 : 0.5;
              var offsetX = radius * fraction * Math.cos(angle);
              var offsetY = radius * fraction * Math.sin(angle);
              newCoordinates.push([center[0] + offsetX, center[1] + offsetY]);
            }
            newCoordinates.push(newCoordinates[0].slice());
            if (!geometry) {
              geometry = new Polygon([newCoordinates]);
            } else {
              geometry.setCoordinates([newCoordinates]);
            }
            return geometry;
          };
        }

        const draw = new Draw({
          source: this.vector_source,
          type: draw_type,
          freehand: this.config.draw_freehand,
          style: new Style({
            fill: new Fill({
              color: this.config.draw_face_color
            }),
            stroke: new Stroke({
              color: this.config.draw_edge_color,
              width: this.config.draw_edge_width
            })
          }),
          geometryFunction: geometryFunction
        });
        this.map.addInteraction(draw);
        draw.on("drawend", async evt => {
          const feature = evt.feature;
          feature.set("label", this.config.draw_label);
          feature.set("size", this.config.draw_size);
          feature.set("edge_color", this.config.draw_edge_color);
          feature.set("edge_width", this.config.draw_edge_width);
          feature.set("face_color", this.config.draw_face_color);
          console.log(this.config);
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
