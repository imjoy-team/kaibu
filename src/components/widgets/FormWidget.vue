<template>
  <div class="form-widget">
    <form-json
      :btnReset="{ value: 'Reset' }"
      :btnSubmit="{ value: 'Submit' }"
      :camelizePayloadKeys="true"
      :formFields="jsonFields"
      formName="userProfil"
    >
    </form-json>
  </div>
</template>

<script>
import "vue-form-json/dist/vue-form-json.css";
import formJson from "vue-form-json";

const jsonFields = [
  [
    {
      label: "First Name",
      value: "fir",
      rules: {
        min: 4,
        max: 20
      }
    },
    {
      label: "Last Name",
      placeholder: "Last Name placeholder",
      rules: {
        min: 3
      }
    }
  ],
  {
    html:
      "<div class='box'><article class='media'><div class='media-left'><figure class='image is-64x64'><img src='https://bulma.io/images/placeholders/64x64.png' alt='Image'></figure></div><div class='media-content'><div class='content'><p><strong class='has-text-info'>Info</strong><br>You can also pass html like this box</p></div>"
  }
];
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
    return {};
  },
  computed: {
    jsonFields: () => jsonFields
  },
  mounted() {
    this.$root.$on("formSubmitted", values => alert(JSON.stringify(values)));
    if (this.config._resolve) {
      this.config._resolve({});
    }
  },
  methods: {}
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style></style>
