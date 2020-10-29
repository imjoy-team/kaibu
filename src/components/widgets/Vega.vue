<template>
  <div></div>
</template>
<script>
import * as vega from "vega";
import vegaEmbed from "vega-embed";

export default {
  name: "vega",
  props: ["schema", "options"],
  mounted() {
    vegaEmbed(this.$el, this.schema, this.options || { actions: false }).then(
      res => {
        this.embed = res;
        this.view = res.view;
        this.$emit("ready", { view: res.view, vega });
      }
    );
  },
  data: () => {
    return {
      view: null,
      embed: null
    };
  },
  methods: {
    updateData(dataName, data) {
      const changeSet = vega.changeset().insert(data);
      this.view.change(dataName, changeSet).run();
    },
    clearData(dataName) {
      const changeSet = vega.changeset().remove(() => {
        return true;
      });
      this.view.change(dataName, changeSet).run();
    }
  }
};
</script>
