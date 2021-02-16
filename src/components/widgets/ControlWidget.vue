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
        :style="elm.style"
        style="min-width:120px;"
      >
        <b-icon v-if="elm.icon" :icon="elm.icon"> </b-icon>{{ elm.label }}
      </button>
      <b-dropdown
        v-else-if="elm.type === 'dropdown'"
        v-model="elm.value"
        :style="elm.style"
        @change="triggerCallback(elm, $event)"
        aria-role="list"
      >
        <b-button
          style="height: 27px;"
          class="is-primary"
          slot="trigger"
          slot-scope="{ active }"
          :icon-left="elm.icon"
        >
          <span>{{ elm.value === undefined ? elm.label : elm.value }}</span>
          <b-icon :icon="active ? 'menu-up' : 'menu-down'"></b-icon>
        </b-button>
        <b-dropdown-item
          v-for="opt in elm.options"
          :key="opt"
          :value="opt"
          aria-role="listitem"
          >{{ opt }}</b-dropdown-item
        >
      </b-dropdown>
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
      const me = this;
      this.config._resolve({
        _rintf: true,
        clear_elements() {
          me.config.elements = [];
          me.$forceUpdate();
        },
        set_elements(elements) {
          me.config.elements = elements;
          me.$forceUpdate();
        }
      });
    }
  },
  methods: {
    async triggerCallback(elm, opt) {
      try {
        this.$emit("loading", true);
        if (opt !== undefined) await elm.callback(opt);
        else await elm.callback();
      } finally {
        this.$emit("loading", false);
      }
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.control-widget {
  min-height: 200px;
}
</style>
