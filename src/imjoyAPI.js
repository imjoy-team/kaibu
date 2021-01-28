import { reshape } from "mathjs";

const itkVtkViewer = window.itkVtkViewer;

const dtypeToTypedArray = {
  int8: "Int8Array",
  int16: "Int16Array",
  int32: "Int32Array",
  uint8: "Uint8Array",
  uint16: "Uint16Array",
  uint32: "Uint32Array",
  float32: "Float32Array",
  float64: "Float64Array",
  array: "Array"
};

const ArrayBufferView = Object.getPrototypeOf(
  Object.getPrototypeOf(new Uint8Array())
).constructor;

function toArray(data) {
  if (
    typeof data === "number" ||
    typeof data === "string" ||
    typeof data === "boolean" ||
    data === null ||
    data === undefined
  ) {
    return data;
  }
  if (data instanceof ArrayBuffer) {
    return Array.from(new Uint8Array(data));
  }
  if (data instanceof ArrayBufferView) {
    return Array.from(data);
  }
  if (Array.isArray(data)) return data.map(toArray);
  if (data.constructor === Object) {
    if (data._rtype) {
      if (data._rtype !== "ndarray") throw "Invalid input type: " + data._rtype;
      const arraytype = eval(dtypeToTypedArray[data._rdtype]);
      return reshape(Array.from(new arraytype(data._rvalue)), data._rshape);
    }
    const obj = {};
    Object.entries(data).forEach(arr => {
      obj[arr[0]] = toArray(arr[1]);
    });
    return obj;
  } else {
    throw new Error("Unsupported type conversion");
  }
}

export async function setupImJoyAPI({
  addLayer,
  removeLayer,
  clearLayers,
  addWidget,
  setLoader,
  setMode,
  selectWidgetTab
}) {
  setMode("lite");
  const imjoyRPC = await window.imjoyLoader.loadImJoyRPC({
    api_version: "0.2.3"
  });

  const api = await imjoyRPC.setupRPC({
    name: "Kaibu",
    version: "0.1.0",
    description:
      "Kaibu--a web application for visualizing and annotating multi-dimensional images",
    type: "rpc-window"
  });

  api.registerCodec({
    name: "itkimage",
    decoder: itkVtkViewer.utils.convertToItkImage
  });
  const service_api = {
    setup() {
      api.log("Kaibu loaded successfully.");
    },
    async run(ctx) {
      if (ctx.data && ctx.data.layers) {
        const layer_apis = [];
        for (let config of ctx.data.layers) {
          const layer = await addLayer(config);
          layer_apis.push(layer.getLayerAPI());
        }
        return layer_apis;
      }
    },
    add_layer: addLayer,
    remove_layer: removeLayer,
    clear_layers: clearLayers,
    async view_image(image_array, config) {
      config = config || {};
      config.type = config.type || "itk-vtk";
      config.name = config.name || config.type;
      config.data = image_array;
      const layer = await addLayer(config);
      return layer.getLayerAPI();
    },
    async add_shapes(shape_array, config) {
      config = config || {};
      config.type = "vector";
      config.data = toArray(shape_array);
      const layer = await addLayer(config);
      return layer.getLayerAPI();
    },
    async add_points(point_array, config) {
      config = config || {};
      config.type = "vector";
      config.data = toArray(point_array);
      config.shape_type = "MultiPoint";
      const layer = await addLayer(config);
      return layer.getLayerAPI();
    },
    async set_ui(config) {
      config.type = config.type || "control";
      config.name = config.title;
      return await addWidget(config);
    },
    async add_widget(config) {
      return await addWidget(config);
    },
    async set_loader(enable) {
      setLoader(enable);
    },
    async set_timeout(func, time) {
      return setTimeout(func, time);
    },
    async clear_timeout(id) {
      clearTimeout(id);
    },
    async set_mode(mode) {
      setMode(mode);
    },
    async select_widget_tab(tab) {
      selectWidgetTab(tab);
    }
  };

  service_api.add_image = service_api.view_image;
  api.export(service_api);
}
