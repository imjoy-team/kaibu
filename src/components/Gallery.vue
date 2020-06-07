<template>
  <div class="gallery container">
    <p v-if="!collections || collections.length <= 0">
      Nothing to show in the gallery
    </p>
    <div
      class="tile is-ancestor  is-fluid"
      v-for="collection in collections"
      :key="collection.name"
    >
      <div class="tile is-parent">
        <div
          class="card tile is-child"
          v-for="item in collection.items"
          :key="item.name"
        >
          <div class="card-image">
            <figure class="image is-4by3">
              <img
                src="https://bulma.io/images/placeholders/1280x960.png"
                alt="Placeholder image"
              />
            </figure>
          </div>
          <div class="card-content">
            <div class="media">
              <div class="media-left">
                <figure class="image is-48x48">
                  <img
                    src="https://bulma.io/images/placeholders/96x96.png"
                    alt="Placeholder image"
                  />
                </figure>
              </div>
              <div class="media-content">
                <p class="title is-4">{{ item.name }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Gallery",
  props: {
    collections: {
      type: Array,
      default: null
    }
  }
};
</script>
