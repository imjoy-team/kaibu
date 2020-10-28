<template>
  <div class="form-widgett"></div>
</template>

<script>
export default {
  name: "form-widget",
  type: "form",
  props: {
    config: {
      type: Object,
      default: function() {
        return {};
      }
    }
  },
  data() {
    return {};
  },
  mounted() {
    if (this.config._resolve) {
      this.config._resolve({});
    }
  },
  methods: {}
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style></style>
