<!-- taken from https://vuejsexamples.com/responsive-image-content-comparison-slider-built-with-vue/ -->
<template>
  <div class="vector-layer">
    <section>
      <div class="field">
        <b-switch v-model="config.freehand" @input="updateDrawInteraction()"
          >Freehand</b-switch
        >
      </div>
      <div class="field">
        <b-dropdown
          aria-role="list"
          v-model="config.draw_type"
          @change="updateDrawInteraction()"
        >
          <button
            class="button is-primary"
            slot="trigger"
            slot-scope="{ active }"
          >
            <span>{{ config.draw_type }}</span>
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
import { Circle } from "ol/style";
import { Style } from "ol/style";
import { Fill } from "ol/style";
import { Stroke } from "ol/style";
import { Draw } from "ol/interaction";
import { Vector } from "ol/source";
export default {
  name: "vector-layer",
  props: {
    map: {
      type: Map,
      default: null
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
  mounted() {
    this.config.draw_type = "Polygon";
    this.config.line_width = 4;
    this.config.freehand = true;
    this.config.label = "cell";
    this.config.color = "#F48A39";
    Promise.resolve(this.getLayer()).then(layer => {
      this.layer = layer;
      this.map.addLayer(this.layer);
      this.$forceUpdate();
    });
  },
  beforeDestroy() {
    if (this.layer) {
      this.map.removeLayer(this.layer);
    }
  },
  created() {},
  methods: {
    getLayer() {
      this.vector_source = new Vector();
      const vector_layer = new VectorLayer({
        source: this.vector_source,
        style: new Style({
          fill: new Fill({
            color: "rgba(255, 255, 255, 0.2)"
          }),
          stroke: new Stroke({
            color: "#ffcc33",
            width: 2
          }),
          image: new Circle({
            radius: 7,
            fill: new Fill({
              color: "#ffcc33"
            })
          })
        })
      });
      this.updateDrawInteraction();
      return vector_layer;
    },
    updateDrawInteraction() {
      if (!this.vector_source) return;
      this.$nextTick(() => {
        if (this.draw) {
          this.map.removeInteraction(this.draw);
        }
        const draw = new Draw({
          source: this.vector_source,
          type: this.config.draw_type,
          freehand: this.config.freehand,
          style: new Style({
            fill: new Fill({
              color: "rgba(255, 255, 255, 0.2)"
            }),
            stroke: new Stroke({
              color: this.config.color,
              width: this.config.line_width
            })
          })
        });
        this.map.addInteraction(draw);
        draw.on("drawend", async evt => {
          const feature = evt.feature;
          feature.set("label", this.config.label);
          // this.draw_feature_list.push(feature)
          // this.undo_button_flag = true
          // await this.updateFeatureStyle()
          // await this.saveAnnotation()
        });
        this.draw = draw;
      });
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style></style>
