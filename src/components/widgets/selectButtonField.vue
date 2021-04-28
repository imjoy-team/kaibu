<template>
  <div>
    <label :for="item.label" class="label">
      {{ item.label }}
      <sup
        class="has-text-grey-light is-size-7"
        v-if="item.isRequired !== false"
        >*</sup
      >
    </label>
    <div class="control">
      <b-button
        :id="item.label"
        class="select-button"
        @click="resolveCallback(item)"
        :icon-left="item.icon"
        :style="item.style"
      >
        {{ item.label }}
      </b-button>
      <p class="help is-info">{{ trimEllip(item.value, 20) }}</p>
      <p v-if="error" class="help is-danger">
        {{ error }}
      </p>
    </div>
  </div>
</template>
<script>
export default {
  name: "button",
  props: {
    error: {
      type: String,
      default: null
    },
    item: {
      type: Object,
      required: true
    }
  },
  data: () => ({
    value: undefined
  }),
  created() {
    this.value = this.item.value;
    this.item.value && this.$emit("input", this.item.value);
  },
  methods: {
    trimEllip(str, length) {
      if (!str) return str;
      if (typeof str === "object") str = str.toString();
      return str.length > length ? str.substring(0, length) + "..." : str;
    },
    async resolveCallback(item) {
      this.item.value = await Promise.resolve(item.callback());
      this.$emit("input", this.item.value);
    }
  }
};
</script>
