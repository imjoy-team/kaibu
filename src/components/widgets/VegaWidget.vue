<template>
  <div>
    <p v-if="title" class="vega-title">{{ title }}</p>
    <vega
      :spec="config.spec"
      :options="config.options"
      @ready="vegaReady"
      ref="main"
    ></vega>
  </div>
</template>

<script>
import Vega from "@/components/widgets/Vega";

export default {
  name: "vega-widget",
  type: "vega",
  components: { vega: Vega },
  props: {
    config: {
      type: Object,
      default: function() {
        return {};
      }
    }
  },
  data() {
    return {
      title: null
    };
  },
  created() {
    // TODO: switch to spec key completely later
    this.config.spec = this.config.spec || this.config.schema
    this.config.options = this.config.options || {};
    this.config.options.width = this.config.options.width || 200;
  },
  mounted() {
    this.title = this.config.title;
  },
  methods: {
    vegaReady({ view, vega }) {
      if (this.config.click_callback) {
        view.addEventListener("click", async (event, item) => {
          try {
            this.$emit("loading", true);
            await this.config.click_callback(item.datum);
          } finally {
            this.$emit("loading", false);
          }
        });
      }
      if (this.config._resolve) {
        this.config._resolve({
          _rintf: true,
          append: this.appendDataPoint,
          clear_data: this.clearData,
          set_title: this.setTitle,
          set_expression_function(name, func) {
            vega.expressionFunction(name, func);
          }
        });
      }
    },
    setTitle(title) {
      this.title = title;
      this.$forceUpdate();
    },
    appendDataPoint(dataName, data) {
      this.$refs.main.updateData(dataName, data);
    },
    clearData() {
      this.$refs.main.clearData();
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.vega-title {
  text-align: center;
  font-size: 12px;
}
</style>
