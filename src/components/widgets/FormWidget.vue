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
import formJson from "vue-form-json";

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
  mounted() {
    this.jsonFields = this.config.fields;
    this.config.form_submit_callback =
      this.config.form_submit_callback ||
      function(values) {
        console.log("Form submitted", values);
      };
    this.$root.$on("formSubmitted", this.config.form_submit_callback);
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
  methods: {}
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style></style>
