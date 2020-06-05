<template>
  <div class="home">
    <ImageViewer msg="Welcome to Your Vue.js App" />
  </div>
</template>

<script>
// @ is an alias to /src
import ImageViewer from "@/components/ImageViewer.vue";

export default {
  name: "Home",
  components: {
    ImageViewer
  }
};
</script>
