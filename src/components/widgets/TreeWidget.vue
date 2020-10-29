<template>
  <div class="list-widget">
    <!-- <p>{{ lastEvent }}</p> -->
    <sl-vue-tree
      v-model="config.nodes"
      ref="slVueTree"
      :allow-multiselect="allowMultiselect"
      @select="nodeSelected"
      @drop="nodeDropped"
      @toggle="nodeToggled"
      @nodedblclick="nodeDbClick"
    >
      <template slot="title" slot-scope="{ node }">
        <span class="item-icon">
          <b-icon
            icon="file-outline"
            class="small-icon"
            v-if="node.isLeaf"
          ></b-icon>
          <b-icon icon="folder-outline" class="small-icon" v-else></b-icon>
        </span>

        {{ node.title }}
      </template>

      <template slot="toggle" slot-scope="{ node }">
        <span v-if="!node.isLeaf">
          <b-icon
            icon="chevron-down"
            class="small-icon"
            v-if="node.isExpanded"
          ></b-icon>
          <b-icon icon="chevron-right" class="small-icon" v-else></b-icon>
        </span>
      </template>

      <template slot="draginfo">
        {{ selectedNodesTitle }}
      </template>
    </sl-vue-tree>
  </div>
</template>

<script>
import "./sl-vue-tree-light.css";
import SlVueTree from "sl-vue-tree";

export default {
  name: "tree-widget",
  type: "tree",
  components: { SlVueTree },
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
      lastEvent: "No last event",
      selectedNodesTitle: "",
      allowMultiselect: false
    };
  },
  created() {
    this.config.allow_multi_select = this.allowMultiselect;
  },
  mounted() {
    if (this.config._resolve) {
      const me = this;
      this.config._resolve({
        _rintf: true,
        get_nodes() {
          return me.config.nodes;
        },
        clear_nodes() {
          me.config.nodes = [];
          me.$forceUpdate();
        },
        set_nodes(nodes) {
          me.config.nodes = nodes;
          me.$forceUpdate();
        }
      });
    }
  },
  methods: {
    toggleVisibility: function(event, node) {
      const slVueTree = this.$refs.slVueTree;
      event.stopPropagation();
      const visible = !node.data || node.data.visible !== false;
      slVueTree.updateNode(node.path, { data: { visible: !visible } });
      this.lastEvent = `Node ${node.title} is ${
        visible ? "visible" : "invisible"
      } now`;
    },

    async nodeSelected(nodes) {
      this.selectedNodesTitle = nodes.map(node => node.title).join(", ");
      this.lastEvent = `Select nodes: ${this.selectedNodesTitle}`;
      if (this.config.node_select_callback) {
        try {
          this.$emit("loading", true);
          await this.config.node_select_callback(nodes);
        } finally {
          this.$emit("loading", false);
        }
      }
    },

    async nodeToggled(node) {
      this.lastEvent = `Node ${node.title} is ${
        node.isExpanded ? "expanded" : "collapsed"
      }`;
      if (this.config.node_toggle_callback) {
        try {
          this.$emit("loading", true);
          await this.config.node_toggle_callback(node);
        } finally {
          this.$emit("loading", false);
        }
      }
    },

    async nodeDbClick(node) {
      if (this.config.node_dbclick_callback) {
        try {
          this.$emit("loading", true);
          await this.config.node_dbclick_callback(node);
        } finally {
          this.$emit("loading", false);
        }
      }
    },

    async nodeDropped(nodes, position) {
      this.lastEvent = `Nodes: ${nodes
        .map(node => node.title)
        .join(", ")} are dropped ${position.placement} ${position.node.title}`;
      if (this.config.node_drop_callback) {
        try {
          this.$emit("loading", true);
          await this.config.node_drop_callback(nodes, position);
        } finally {
          this.$emit("loading", false);
        }
      }
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.small-icon > .mdi-24px.mdi:before {
  font-size: 18px !important;
}
.small-icon {
  height: 1rem;
  width: 1rem;
}
</style>
