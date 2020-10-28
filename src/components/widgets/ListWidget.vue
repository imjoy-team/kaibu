<template>
  <div class="list-widget">
    <b-menu>
      <b-menu-list>
        <b-menu-item
          class="is-small"
          v-for="elm in config.elements"
          :key="elm.label"
          @click="config.select_callback(elm)"
        >
          <template slot="label">
            {{ elm.label }}
          </template>
        </b-menu-item>
      </b-menu-list>
    </b-menu>
  </div>
</template>

<script>
export default {
  name: "list-widget",
  type: "list",
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
  created() {
    this.config.select_callback = this.config.select_callback || function() {};
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
<style scoped>
.menu-list {
  font-size: 14px;
  line-height: 0.9;
}
</style>
