<template>
  <div class="control-widget block floating-buttons">
    <b-tooltip
      v-for="elm in config.elements"
      :key="elm.label"
      :label="elm.tooltip || elm.label"
      position="is-bottom"
    >
      <button
        v-if="elm.type === 'button'"
        @click="triggerCallback(elm)"
        class="button is-small"
        style="min-width:120px;"
      >
        <b-icon v-if="elm.icon" :icon="elm.icon"> </b-icon>{{ elm.label }}
      </button>
    </b-tooltip>
  </div>
</template>

<script>
export default {
  name: "control-widget",
  type: "control",
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
  methods: {
    async triggerCallback(elm) {
      try {
        this.$emit("loading", true);
        await elm.callback();
      } finally {
        this.$emit("loading", false);
      }
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style></style>
