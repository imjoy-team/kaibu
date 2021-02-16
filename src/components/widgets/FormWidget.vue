<template>
  <div class="form-widget">
    <form-json
      v-if="jsonFields && jsonFields.length > 0"
      :btnReset="{ value: config.reset_text || 'Reset' }"
      :btnSubmit="{ value: config.submit_text || 'Submit' }"
      :camelizePayloadKeys="true"
      :formFields="jsonFields"
      :formName="config.name || 'form'"
    >
      <template slot="tagInput" slot-scope="slotProps">
        <b-taginput
          v-model="slotProps.tags"
          :data="slotProps.options"
          :open-on-focus="slotProps.options && slotProps.options.length > 0"
          autocomplete
          @input="slotProps.updateValue(slotProps.tags)"
          icon="label"
          placeholder="Add a tag"
        >
          <template #empty>
            There are no tags
          </template>
        </b-taginput>
      </template>
      <template slot="selectButton" slot-scope="slotProps">
        <b-button
          class="select-button"
          @click="resolveCallback(slotProps)"
          :icon-left="slotProps.icon"
          :style="slotProps.style"
        >
          {{ slotProps.label }}
        </b-button>
        <p>{{ trimEllip(slotProps.value, 20) }}</p>
      </template>
    </form-json>
    <div class="box" v-else>
      <article class="media">
        <div class="media-content">
          <div class="content">
            <p>
              The form is empty
            </p>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<script>
import "vue-form-json/dist/vue-form-json.css";
import formJson from "vue-form-json/dist/vue-form-json.common.js";

export default {
  name: "form-widget",
  type: "form",
  components: { "form-json": formJson },
  props: {
    config: {
      type: Object,
      default: function() {
        return {};
      }
    }
  },
  data() {
    return { jsonFields: [] };
  },
  beforeDestroy() {
    this.$root.$off("formSubmitted", this.handleFormSubmitted);
  },
  mounted() {
    this.jsonFields = this.config.fields;
    this.config.form_submit_callback =
      this.config.form_submit_callback ||
      function(values) {
        console.log("Form submitted", values);
      };
    this.$root.$on("formSubmitted", this.handleFormSubmitted);
    if (this.config._resolve) {
      const me = this;
      this.config._resolve({
        _rintf: true,
        clear_fields() {
          me.jsonFields = [];
          me.$forceUpdate();
        },
        set_fields(fields) {
          me.jsonFields = fields;
          me.$forceUpdate();
        }
      });
    }
  },
  methods: {
    handleFormSubmitted(result) {
      if (this.config.name && result.formName === this.config.name) {
        this.config.form_submit_callback(result.values);
      }
    },
    trimEllip(str, length) {
      if (!str) return str;
      if (typeof str === "object") str = str.toString();
      return str.length > length ? str.substring(0, length) + "..." : str;
    },
    async resolveCallback(slotProps) {
      const value = await Promise.resolve(slotProps.callback());
      slotProps.updateValue(value);
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.select-button {
  width: 100%;
}
</style>
