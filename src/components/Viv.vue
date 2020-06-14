<template>
  <div class="viv" style="height:100%;width:100%;">
    <react
      :passedProps="passedProps"
      :component="component"
      :loader="options.loader"
      :sliderValues="options.sliders"
      :colorValues="options.colors"
      :channelIsOn="options.isOn"
      :loaderSelection="options.selections"
      :initialViewState="options.initialViewState"
      :colormap="options.colormap.length > 0 && options.colormap"
      :overview="options.overview"
      :overviewOn="options.overviewOn"
      :hoverHooks="{ handleValue: setPixelValues }"
    />
  </div>
</template>

<script>
import { ReactWrapper } from "vuera";
import { PictureInPictureViewer } from "@hubmap/vitessce-image-viewer";

export default {
  name: "Viv",
  props: ["options"],
  data() {
    return {
      component: PictureInPictureViewer
    };
  },
  components: { react: ReactWrapper },
  computed: {
    passedProps() {
      return this.options;
    }
  },
  methods: {
    setPixelValues(event) {
      console.log("Pixel value", event);
    }
  }
};
</script>
