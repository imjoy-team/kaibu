<!-- taken from https://vuejsexamples.com/responsive-image-content-comparison-slider-built-with-vue/ -->
<template>
  <div class="itk-vtk-layer">
    <section id="toolbar"></section>
    <b-field label="opacity">
      <b-slider
        v-model="config.opacity"
        @input="updateOpacity"
        :min="0"
        :max="1.0"
        :step="0.1"
      ></b-slider>
    </b-field>
  </div>
</template>

<script>
import { Map, View } from "ol";
import { Pointer } from "ol/interaction";
import Layer from "ol/layer/Layer";
import { Projection } from "ol/proj";
import { getCenter } from "ol/extent";

const itkVtkViewer = window.itkVtkViewer;

var CanvasLayer = /*@__PURE__*/ (function(Layer) {
  function CanvasLayer(options) {
    Layer.call(this, options);
    this.viewerElement = document.createElement("div");
    this.viewerElement.classList.add("ol-layer");
    this.viewerElement.style.position = "absolute";
    this.sync_callback = options.sync_callback;
  }

  if (Layer) CanvasLayer.__proto__ = Layer;
  CanvasLayer.prototype = Object.create(Layer && Layer.prototype);
  CanvasLayer.prototype.constructor = CanvasLayer;

  CanvasLayer.prototype.getSourceState = function getSourceState() {
    return "ready";
  };

  CanvasLayer.prototype.render = function render() {
    if (this.sync_callback) {
      this.sync_callback();
    }
    this.viewerElement.style.opacity = this.getOpacity();
    return this.viewerElement; //return the viewer element
  };

  return CanvasLayer;
})(Layer);

function convertImageUrl2Itk(url) {
  return new Promise(resolve => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const image = new Image();
    image.onload = function() {
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0, image.width, image.height);
      const imageData = ctx.getImageData(0, 0, image.width, image.height);
      const vtkImage = itkVtkViewer.utils.vtkITKHelper.convertItkToVtkImage({
        imageType: {
          dimension: 2,
          pixelType: 1,
          componentType: "uint8_t",
          components: 4
        },
        name: "test image",
        origin: [0, 0],
        spacing: [1, 1],
        direction: { data: [1, 0, 0, 1] },
        size: [image.width, image.height],
        data: new Uint8Array(imageData.data.buffer)
      });
      resolve(vtkImage);
    };
    image.crossOrigin = "Anonymous";
    image.src = url;
  });
}

// eslint-disable-next-line no-unused-vars
function generateData3D() {
  const size = [100, 100, 100];
  const imgArray = new Uint16Array(new ArrayBuffer(100 * 100 * 100 * 2));
  for (let i = 0; i < 100 * 100 * 100; i++) {
    imgArray[i] = Math.floor(Math.random() * Math.floor(65535));
  }
  const imageData = itkVtkViewer.utils.vtkITKHelper.convertItkToVtkImage({
    imageType: {
      dimension: 3,
      pixelType: 1,
      componentType: "uint16_t",
      components: 1
    },
    name: "test image",
    origin: [0, 0, 0],
    spacing: [1, 1, 1],
    direction: { data: [1, 0, 0, 0, 1, 0, 0, 0, 1] },
    size: size,
    data: imgArray
  });
  return imageData;
}

export default {
  name: "itk-vtk-layer",
  type: "vtk",
  props: {
    map: {
      type: Map,
      default: null
    },
    selected: {
      type: Boolean,
      default: false
    },
    visible: {
      type: Boolean,
      default: false
    },
    config: {
      type: Object,
      default: function() {
        return {};
      }
    }
  },
  data() {
    return {
      layer: null
    };
  },
  watch: {
    visible: function(newVal) {
      this.layer.setVisible(newVal);
      this.synchronizeVtkCoordinate();
      this.renderWindow.render();
    }
  },
  mounted() {
    this.config.opacity = 1.0;
    this.config.sliders = [
      {
        name: "T",
        min: 0,
        max: 100,
        step: 1,
        value: 3,
        changed() {
          console.log("t slider changed.");
        }
      }
    ];
    Promise.resolve(this.getLayer()).then(layer => {
      this.layer = layer;
      this.config.layer = layer;
      this.map.addLayer(this.layer);
      const projection = new Projection({
        code: "image",
        units: "pixels",
        extent: this.extent
        // axisOrientation: 'esu',
      });
      this.map.setView(
        new View({
          projection: projection,
          center: getCenter(this.extent),
          zoom: 1,
          minZoom: -10
        })
      );
      this.enableItkInteraction();
      this.synchronizeVtkCoordinate();
      this.renderWindow.render();
      this.$forceUpdate();
    });
  },
  beforeDestroy() {
    if (this.layer) {
      this.map.removeLayer(this.layer);
    }
  },
  created() {},
  methods: {
    updateOpacity() {
      if (this.layer) this.layer.setOpacity(this.config.opacity);
    },
    selectLayer() {},
    async getLayer() {
      const containerStyle = {
        position: "relative",
        width: "100%",
        height: "100vh",
        minHeight: "400px",
        minWidth: "400px",
        margin: "1",
        padding: "1",
        top: "0",
        left: "0",
        overflow: "hidden",
        display: "block-inline"
      };
      const viewerStyle = {
        backgroundColor: [0, 0, 0, 0],
        containerStyle: containerStyle
      };

      var itk_layer = new CanvasLayer({
        sync_callback: this.synchronizeVtkCoordinate
      });
      const imageData = await convertImageUrl2Itk(
        "https://images.proteinatlas.org/19661/221_G2_1_red_green.jpg"
      ); //generateData2D();
      const extent_3d = imageData.getExtent();
      this.extent = [extent_3d[0], extent_3d[2], extent_3d[1], extent_3d[3]];
      const viewer = itkVtkViewer.createViewer(itk_layer.viewerElement, {
        viewerStyle: viewerStyle,
        image: imageData,
        pointSets: null,
        geometries: null,
        use2D: true,
        rotate: false,
        uiContainer: document.getElementById("toolbar")
      });
      const viewProxy = viewer.getViewProxy();
      const renderWindow = viewProxy.getRenderWindow();
      renderWindow.getViews()[0].initialize();
      // viewer.setViewMode('ZPlane');
      this.viewProxy = viewer.getViewProxy();
      this.viewProxy.updateOrientation(2, 1, [0, 1, 0]);
      this.renderWindow = this.viewProxy.getRenderWindow();
      this.interactor = this.renderWindow.getInteractor();
      const view = this.interactor.getView();

      // we will disable the wheel and mousedown event,
      // but keep mouse move for the corner annotation
      view
        .getContainer()
        .removeEventListener("wheel", this.interactor.handleWheel);
      view
        .getContainer()
        .removeEventListener("mousedown", this.interactor.handleMouseDown);

      this.renderer = this.viewProxy.getRenderer();
      viewer.setUserInterfaceCollapsed(true);
      setTimeout(() => {
        viewer.setUserInterfaceCollapsed(false);
      }, 10);
      this.viewer = viewer;
      return itk_layer;
    },
    convertCoordinates(x, y) {
      const view = this.interactor.getView();
      const renderPosition = { x: x, y: y };
      const bounds = view.getContainer().getBoundingClientRect();
      const canvas = view.getCanvas();
      const scaleX = canvas.width / bounds.width;
      const scaleY = canvas.height / bounds.height;
      // recover mouse clientX and clientY: https://kitware.github.io/vtk-js/api/Rendering_Core_RenderWindowInteractor.html
      const map_pixel_pos = this.map.getEventPixel({
        clientX: renderPosition.x / scaleX + bounds.left,
        clientY: bounds.height - renderPosition.y / scaleY + bounds.top
      });
      const mapPosition = this.map.getCoordinateFromPixelInternal(
        map_pixel_pos
      );
      // const projection = this.map.getProjection();
      const c = itkVtkViewer.utils.vtkCoordinate.newInstance();
      c.setRenderer(this.renderer);
      c.setCoordinateSystemToDisplay();
      c.setValue(renderPosition.x, renderPosition.y);
      const worldPosition = c.getComputedWorldValue();
      return { mapPosition: mapPosition, worldPosition: worldPosition };
    },
    synchronizeMapCoordinate() {
      const map_veiw = this.map.getView();
      const resolution = map_veiw.getResolution();
      const center = map_veiw.getCenter();
      const p1 = this.convertCoordinates(0, 0);
      const p2 = this.convertCoordinates(1, 1);
      const res_factor = resolution / (p1.mapPosition[0] - p2.mapPosition[0]);
      const new_res = Math.abs(
        (p1.worldPosition[0] - p2.worldPosition[0]) * res_factor
      );
      if (new_res !== 0 && new_res !== resolution) {
        map_veiw.setResolution(new_res);
      }
      const diff_x = p1.worldPosition[0] - p1.mapPosition[0];
      const diff_y = p1.worldPosition[1] - p1.mapPosition[1];
      map_veiw.setCenter([center[0] + diff_x, center[1] + diff_y]);
    },
    synchronizeVtkCoordinate() {
      const camera = this.viewProxy.getCamera();
      // const map_veiw = this.map.getView();
      // const center = map_veiw.getCenter();
      // const viewTranslation = camera.getPhysicalTranslation();
      const pscale = camera.getParallelScale();
      const p1 = this.convertCoordinates(0, 0);
      const p2 = this.convertCoordinates(100, 100);
      const scale_factor = pscale / (p1.worldPosition[0] - p2.worldPosition[0]);
      const new_scale = Math.abs(
        (p1.mapPosition[0] - p2.mapPosition[0]) * scale_factor
      );
      if (new_scale && new_scale !== pscale) {
        camera.setParallelScale(new_scale);
        this.viewProxy.updateDataProbeSize();
        this.viewProxy.updateScaleBar();
      }
      const p3 = this.convertCoordinates(0, 0);
      const diff_x = p3.worldPosition[0] - p3.mapPosition[0];
      const diff_y = p3.worldPosition[1] - p3.mapPosition[1];
      // map_veiw.setCenter([center[0]+diff_x, center[1]+diff_y]);
      const viewFocus = camera.getFocalPoint();
      const viewPoint = camera.getPosition();
      camera.setFocalPoint(
        viewFocus[0] - diff_x,
        viewFocus[1] - diff_y,
        viewFocus[2]
      );
      camera.setPosition(
        viewPoint[0] - diff_x,
        viewPoint[1] - diff_y,
        viewPoint[2]
      );
      camera.computeDistance();
      this.viewProxy.renderLater();
    },
    enableItkInteraction() {
      this.itkInteraction = new Pointer();
      this.itkInteraction.handleEvent = e => {
        this.itkInteraction.updateTrackedPointers_(e);
        const interactor = this.interactor;
        if (e.type == "pointermove") {
          interactor.handleMouseMove(e.originalEvent);
        }
        //return true means propagate the event
        return true;
      };
      this.map.addInteraction(this.itkInteraction);
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
#toolbar {
  position: relative;
}
</style>
