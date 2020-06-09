<!-- taken from https://vuejsexamples.com/responsive-image-content-comparison-slider-built-with-vue/ -->
<template>
  <div class="vector-layer">
    <section>
      <div class="field">
        <b-switch v-model="config.draw_enable" @input="updateDrawInteraction()"
          >Enable Draw</b-switch
        >
      </div>
      <div class="field">
        <b-switch
          v-model="config.draw_freehand"
          @input="updateDrawInteraction()"
          >Freehand</b-switch
        >
      </div>
      <div class="field">
        <b-dropdown
          aria-role="list"
          v-model="config.draw_shape_type"
          @change="updateDrawInteraction()"
        >
          <button
            class="button is-primary"
            slot="trigger"
            slot-scope="{ active }"
          >
            <span>{{ config.draw_shape_type }}</span>
            <b-icon :icon="active ? 'menu-up' : 'menu-down'"></b-icon>
          </button>

          <b-dropdown-item value="Polygon" aria-role="listitem"
            >Polygon</b-dropdown-item
          >
          <b-dropdown-item value="LineString" aria-role="listitem"
            >LineString</b-dropdown-item
          >
          <b-dropdown-item value="Circle" aria-role="listitem"
            >Circle</b-dropdown-item
          >
          <b-dropdown-item value="Point" aria-role="listitem"
            >Point</b-dropdown-item
          >
        </b-dropdown>
      </div>
    </section>
  </div>
</template>

<script>
import { Map } from "ol";
import VectorLayer from "ol/layer/Vector";
import { Circle, Style, Fill, Stroke, Text } from "ol/style";
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

export default {
  name: "vector-layer",
  type: "vector",
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
      layer: null
    };
  },
  watch: {
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
      name: "shapes",
      metadata: null,
      scale: 1,
      translate: 0,
      opacity: 1.0,
      blending: "additive",
      visible: true,
      // custom fields
      draw_enable: true,
      draw_freehand: true,
      draw_label: null,
      draw_shape_type: "polygon",
      draw_face_color: "rgba(255, 255, 255, 0.2)",
      draw_edge_width: 2,
      draw_edge_color: getRandomColor()
    };
    for (let k in this.default_config) {
      if (!this.config[k]) {
        this.config[k] = this.default_config[k];
      }
    }
    this.config.label = this.config.label || this.config.name;
    this.config.init = this.init;

    if (this.config.data) {
      // make sure we have an array of properties
      for (let key of [
        "shape_type",
        "edge_width",
        "edge_color",
        "face_color",
        "z_index",
        "label"
      ]) {
        if (Array.isArray(this.config[key])) {
          if (this.config[key].length !== this.config.data.length) {
            throw `Invalid length: ${key} should have ${this.config.data.length} elements.`;
          }
        } else {
          const val = this.config[key];
          this.config[key] = [];
          for (let i = 0; i < this.config.data.length; i++) {
            this.config[key].push(val);
          }
        }
      }
      this.config.draw_edge_color =
        this.config.draw_edge_color || this.config.edge_color[0];
      this.config.draw_edge_width =
        this.config.draw_edge_width || this.config.edge_width[0];
      this.config.draw_face_color =
        this.config.draw_face_color || this.config.face_color[0];
    }
  },
  beforeDestroy() {
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
    getLayer() {
      this.vector_source = new Vector();
      const vector_layer = new VectorLayer({
        source: this.vector_source
      });
      vector_layer.setStyle(this.featureStyle);
      const data = this.config.data;
      if (data) {
        let features = [];
        for (let i = 0; i < data.length; i++) {
          const feature = {};
          let shape_type = this.config.shape_type[i];
          shape_type = shape_type.charAt(0).toUpperCase() + shape_type.slice(1);
          feature.type = "Feature";
          feature.geometry = {
            type: shape_type,
            coordinates: [data[i]]
          };
          feature.properties = {
            label: this.config.label[i],
            edge_width: this.config.edge_width[i],
            edge_color: this.config.edge_color[i],
            face_color: this.config.face_color[i]
          };
          features.push(feature);
        }
        const geojson_data = {
          type: "FeatureCollection",
          features: features
        };
        const geojsonFeatures = new GeoJSON().readFeatures(geojson_data);
        this.vector_source.addFeatures(geojsonFeatures);
      }
      return vector_layer;
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
    featureStyle(feature) {
      const label = feature.get("label");
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
          radius: 7,
          fill: new Fill({
            color: "#ffcc33"
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
          })
        });
        this.map.addInteraction(draw);
        draw.on("drawend", async evt => {
          const feature = evt.feature;
          feature.set("label", this.config.draw_label);
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
<style></style>
