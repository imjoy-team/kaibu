<template>
  <div class="form-widget">
    <form-json
      v-if="jsonFields && jsonFields.length > 0"
      :btnReset="{ value: config.reset_text || 'Reset' }"
      :btnSubmit="{ value: config.submit_text || 'Submit' }"
      :camelizePayloadKeys="config.camelize_payload_keys"
      :formFields="jsonFields"
      :formName="config.name || 'form'"
      :components="components"
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
import formJson from "vue-form-json/dist/vue-form-json.common.js";
import TagInputField from "./tagInputField.vue";
import DropFilesField from "./dropFilesField.vue";
import SelectButtonField from "./selectButtonField.vue";

export default {
  name: "form-widget",
  type: "form",

  components: {
    "form-json": formJson,
    // eslint-disable-next-line vue/no-unused-components
    TagInputField,
    // eslint-disable-next-line vue/no-unused-components
    SelectButtonField,
    // eslint-disable-next-line vue/no-unused-components
    DropFilesField
  },
  props: {
    config: {
      type: Object,
      default: function() {
        return {};
      }
    }
  },
  computed: {
    components: () => ({ TagInputField, SelectButtonField, DropFilesField })
  },
  data() {
    return { jsonFields: [], dropFileFields: {} };
  },
  beforeDestroy() {
    this.$root.$off("formSubmitted", this.handleFormSubmitted);
  },
  mounted() {
    this.jsonFields = this.transformFields(this.config.fields);
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
    transformFields(fields) {
      const typeMapping = {};
      for (let k in this.components) {
        typeMapping[this.components[k].name] = k;
      }
      // mapping type to component name
      for (let field of fields) {
        // convert legacy slots
        if (field.slot === "tagInput") {
          for (let k in field.props) {
            field[k] = field.props[k];
          }
          field.type = "tags";
          delete field.slot;
          delete field.props;
        }
        // convert legacy slots
        if (field.slot === "selectButton") {
          for (let k in field.props) {
            field[k] = field.props[k];
          }
          field.type = "button";
          delete field.slot;
          delete field.props;
        }
        if (typeMapping[field.type]) {
          field.is = typeMapping[field.type];
          delete field.type;
        }
      }
      return fields;
    },
    handleFormSubmitted(result) {
      if (this.config.name && result.formName === this.config.name) {
        this.config.form_submit_callback(result.values);
      }
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
