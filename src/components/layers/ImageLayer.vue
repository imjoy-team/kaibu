<!-- taken from https://vuejsexamples.com/responsive-image-content-comparison-slider-built-with-vue/ -->
<template>
  <div class="image-layer">
    <section>
      <b-field label="opacity">
        <b-slider
          v-model="config.opacity"
          @input="updateOpacity"
          :min="0"
          :max="1.0"
          :step="0.1"
        ></b-slider>
      </b-field>
      <b-field v-if="config.climit" label="contrast limit">
        <b-slider v-model="config.climit" :min="1" :max="255" :step="0.5" ticks>
        </b-slider>
      </b-field>
    </section>
  </div>
</template>

<script>
import { Map } from "ol";
import Static from "ol/source/ImageStatic";
import ImageLayer from "ol/layer/Image";
import Projection from "ol/proj/Projection";

async function url2base64(url) {
  return new Promise((resolve, reject) => {
    var img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = function() {
      var canvas = document.createElement("canvas");
      var ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      resolve({
        url: canvas.toDataURL("image/png"),
        w: img.width,
        h: img.height
      });
    };
    img.onerror = function(e) {
      reject("image load error:" + String(e));
    };
    img.src = url;
  });
}

function array2rgba(imageArr, w, h) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  const canvas_img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const canvas_img_data = canvas_img.data;
  const count = w * h;
  let min = Number.POSITIVE_INFINITY,
    max = Number.NEGATIVE_INFINITY;
  const raw = new Uint8Array(imageArr.buffer);
  if (imageArr instanceof Uint8Array) {
    for (let i = 0; i < count; i++) {
      if (imageArr[i] > max) max = imageArr[i];
      if (imageArr[i] < min) min = imageArr[i];
      //encode 16bits to the first two bytes
      canvas_img_data[i * 4] = raw[i];
      canvas_img_data[i * 4 + 1] = raw[i];
      canvas_img_data[i * 4 + 2] = raw[i];
      canvas_img_data[i * 4 + 3] = 255;
    }
  } else {
    throw "unsupported array type";
  }
  ctx.putImageData(canvas_img, 0, 0);
  return {
    url: canvas.toDataURL("image/png"),
    w: w,
    h: h,
    min: min,
    max: max
  };
}

export default {
  name: "image-layer",
  type: "2d-image",
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
    visible: function(newVal) {
      this.layer.setVisible(newVal);
    }
  },
  mounted() {
    this.config.climit = [4, 50];
    this.config.opacity = 1.0;
    this.config.sliders = [
      {
        name: "Z",
        min: 0,
        max: 1000,
        step: 1,
        value: 3,
        changed() {
          console.log("z slider changed.");
        }
      },
      {
        name: "T",
        min: 0,
        max: 100,
        step: 1,
        value: 3,
        changed() {
          console.log("t slider changed.");
        }
      }
    ];
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
      this.layer = await this.getLayer();
      this.map.addLayer(this.layer);
      this.$forceUpdate();
      return this.layer;
    },
    updateOpacity() {
      if (this.layer) this.layer.setOpacity(this.config.opacity);
    },
    selectLayer() {},
    async getLayer() {
      let imgObj;
      const data = this.config.data;
      if (typeof data === "string") {
        imgObj = await url2base64(this.config.data);
      } else if (
        data.imageType &&
        data.size &&
        data.imageType.componentType &&
        data.data
      ) {
        if (data.imageType.componentType !== "uint8_t") {
          throw `Unsupported data type: ${data.imageType.componentType}`;
        }

        if (
          data.imageType.components !== 1 &&
          data.imageType.components !== 3
        ) {
          throw `Unsupported components number: ${data.imageType.components}`;
        }

        if (data.imageType.dimension !== 2) {
          throw `Dimension must be 2`;
        }

        if (data.imageType.pixelType !== 1) {
          throw `Pixel type must be 1`;
        }
        imgObj = array2rgba(data.data, data.size[0], data.size[1]);
        // {type: type, url: canvas.toDataURL("image/png"), w:w, h:h, min: min, max: max}
      } else {
        imgObj = {
          url: "https://images.proteinatlas.org/19661/221_G2_1_red_green.jpg",
          w: 2048,
          h: 2048
        };
      }
      const extent = [0, 0, imgObj.w, imgObj.h];
      const projection = new Projection({
        code: "image",
        units: "pixels",
        extent: extent
      });
      const image_source = new Static({
        url: imgObj.url,
        projection: projection,
        imageExtent: extent
      });
      const image_layer = new ImageLayer({
        source: image_source
      });
      return image_layer;
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style></style>
