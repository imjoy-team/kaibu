<template>
  <div class="viv" style="height:100%;width:100%;">
    <react
      :component="component"
      :loader="options.loader"
      :sliderValues="options.sliderValues"
      :colorValues="options.colorValues"
      :channelIsOn="options.channelIsOn"
      :loaderSelection="options.loaderSelection"
      :initialViewState="options.initialViewState"
      :colormap="options.colormap.length > 0 && options.colormap"
      :overview="options.overview"
      :overviewOn="options.overviewOn"
      :hoverHooks="options.hoverHooks"
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
  methods: {
    setPixelValues(event) {
      console.log("Pixel value", event);
    }
  }
};
</script>
