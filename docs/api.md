# Kaibu API for ImJoy

## Basic usage

Kaibu is a web application for visualizing and annotating multi-dimensional images, built with [OpenLayers](https://openlayers.org/) and [itk-vtk-viewer](https://kitware.github.io/itk-vtk-viewer/).

You can use Kaibu as an standalone web app at https://kaibu.org, or as an [ImJoy](https://imjoy.io/) plugin in Python or Javascript:

?> Note: This is an ImJoy interactive document with which you can directly edit and run sample code, please make sure you are reading this from https://kaibu.org/docs/#/api.

<!-- tabs:start -->

#### ** JavaScript **

```js
// show as an inline window
api.createWindow({src: "https://kaibu.org/#/app", name: "Kaibu"})
// show as a dialog
api.showDialog({src: "https://kaibu.org/#/app", name: "Kaibu"})
```

Try the example below:
<!-- ImJoyPlugin: {"type": "web-worker", "editor_height": "400px"} -->
```js
class ImJoyPlugin {
    async setup() {}
    async run(ctx) {
        const viewer = await api.createWindow({src: "https://kaibu.org/#/app", name: "Kaibu"})
        await viewer.view_image("https://images.proteinatlas.org/61448/1319_C10_2_blue_red_green.jpg")
    }
}
api.export(new ImJoyPlugin())
```

#### ** Python **

```js
// show as an inline window
api.createWindow(src="https://kaibu.org/#/app", name="Kaibu")
// show as a dialog
api.showDialog(src="https://kaibu.org/#/app", name="Kaibu")
```

Try the example below:

<!-- ImJoyPlugin: {"type": "native-python", "editor_height": "400px"} -->
```python
from imjoy import api

class ImJoyPlugin():
    async def setup(self):
        pass

    async def run(self, ctx):
        viewer = await api.createWindow(src="https://kaibu.org/#/app")

        await viewer.view_image("https://images.proteinatlas.org/61448/1319_C10_2_blue_red_green.jpg")

api.export(ImJoyPlugin())
```
<!-- tabs:end -->

By default, if Kaibu is accessed as an ImJoy plugin, the so called `minimal` UI mode will be applied. If you want a full UI options such as allow user to add new layer, you can pass `mode: 'full'` as a config option. For example:

<!-- ImJoyPlugin: {"type": "web-worker", "editor_height": "400px"} -->
```js
class ImJoyPlugin {
    async setup() {}
    async run(ctx) {
        const viewer = await api.createWindow({src: "https://kaibu.org/#/app", name: "Kaibu", config: {mode: 'full'}})
    }
}
api.export(new ImJoyPlugin())
```

Similarly, you can also control the sidebar by passing `open_sidebar: true` or `open_sidebar: false` to `config`.
## Kaibu API

### view_image(image, options)

Add an image layer

**Arguments**
 
- `image`: an image URL, base64 encoded image or a numpy array in Python.
- options:
    - `type`: String, image layer type, currently supports `2d-image`(OpenLayers 2D image layer), `itk-vtk` (ITK/VTK Viewer 2D/3D layer) or `vector`(OpenLayers vector feature layer).
    - `name`: String, name of the image layer
**Returns**
 A layer object with the following fields:
 - `id`: String, the id of the layer
 - `name`: String, the name of the layer
 - `set_image`: Function, a function used to update the image in the layer
 - `set_blending`: Function, a function used to update the blending model of the layer
 - `set_opacity`: Function, a function used to update the opacity of the layer
 - Other ITK/VTK Viewer functions defined at https://kitware.github.io/itk-vtk-viewer/api/ (Note: the function names should be converted from camel case to snake case, e.g. `setUnits` will become `set_units`)


By default, the ITK/VTK Viewer will be used to display the image, it supports 4-dimensional images. In Python, you can pass an numpy array as a 3D color image to the viewer. The ordering of the dimensions are `[Z, Y, X, C]`.

Example in Python:

<!-- ImJoyPlugin: {"type": "native-python", "editor_height": "400px", "requirements": ["imageio", "numpy"]} -->
```python
from imjoy import api
import imageio

class ImJoyPlugin():
    async def setup(self):
        pass

    async def run(self, ctx):
        viewer = await api.createWindow(src="https://kaibu.org/#/app")

        # read a sample image
        image = imageio.imread('imageio:chelsea.png')

        # view image
        await viewer.view_image(image, type="itk-vtk", name="Chelsea")
        
        # you can also display an 3D color image (with arbitrary number of channels)
        # image = np.random.randint(0, 155, size=[80, 100, 100, 5]).astype('uint8')
        # await viewer.view_image(image, type="itk-vtk", name="3d-color-image")

api.export(ImJoyPlugin())
```

### add_shapes(shapes, options)
Add a vector layer with polygons

**Arguments**
 - `shapes`: a list of shapes, each shape is a list of coordinates
 - `options`:
    - `name`: String, name of the image layer
    - `shape_type`: String, type of the shape, should be one of the following: "polygon", "path", "rectangle"
    - `edge_width`: String, width of the edge
    - `edge_color`: String, color of the edge, should be an hex string format, for example: `#F7350B`, you can use https://htmlcolorcodes.com/color-picker/ to pick a color.
    - `face_color`: String, color for filling the face, hex string format, same as `edge_color`
    - `size`: Number, size of the shape
    - `label`: String, label of the shape
    - `text_placement`: String, how should the label text be placed, possible values are `null` (won't display), `point` and `line`
    - `draw_enable`: Boolean, switch on the markup tool
    - `select_enable`: Boolean, switch on the selection tool (draw_enable must be set to false)
    - `draw_label`: String, set the label for the markup tool
    - `draw_max_label_count`: Number, the maximum number of feature for the current `draw_label`, if exceeded, some features will be automatically removed
    - `draw_freehand`: Boolean, switch on freehand mode for the markup tool
    - `draw_shape_type`: String, choose a shape type for the markup tool, should be one of the following: "polygon", "path", "rectangle"
    - `draw_edge_width`: Integer, set the edge width of the markup tool
    - `default_edge_width`: Integer, the default edge width of the markup tool
    - `draw_edge_color`: String, set the edge color for the markup tool, should be an hex string format, same as `edge_color`
    - `default_edge_color`: String, the default edge color for the markup tool
    - `draw_face_color`: String, set the face color for the markup tool, should be an hex string format, same as `edge_color` 
    - `default_face_color`: String, the default face color for the markup tool
    - `draw_size`: Integer, set the size for the point size for the markup tool, only used when draw_shape_type="point"
    - `default_size`: Integer, the default value of the point size for the markup tool
    - `predefined_tags`: Array, for tagging features in the layer, a set of tags will be displayed for the user to choose from
    - `single_tag_mode`: Boolean, if set to true, only one tag is allowed for a feature
    - `user_name`: String, for making comment on each feature, the user name will be applied for the current user
    - `select_feature_callback`: Function, a function which will be called when a new feature is selected, the feature object will be passed as input argument
    - `add_feature_callback`: Function, a function which will be called when a new feature is added to the layer, the feature object will be passed as input argument
    - `remove_feature_callback`: Function, a function which will be called when a new feature is removed from the layer, the feature object will be passed as input argument
    - `change_feature_callback`: Function, a function which will be called when a new feature is updated, the feature object will be passed as input argument
    - `key_press_callback`: Function, a function which will be called when a key is pressed, an object with `code`, `meta_key`, `ctrl_key`, `alt_key`, `shift_key` will be passed to the callback. By default the default key binding (e.g. Ctrl-Z) will keep working, to prevent propagate to the default key bindings, the callback should return `true`.

**Returns**
An object with the layer api functions:
 - `name`: String, the name of the layer
 - `id`: String, the id of the layer
 - `update_config`: Function, update the config layer config, it takes one argument:
    - `config`: the new config, it can contain one or more options described in **Arguments**. For example, it can be used to update the markup tool setting.
 - `clear_features`: Function, a function that can be called for clear all the features in the layer, it takes no arguments
 - `update_feature`: Function, a function for updating the feature, it takes two arguments:
    - `id`: String, the id of an existing feature to be updated
    - `new_feature`: Object, the new feature object with geometry and properties
 - `set_features`: Function, replace the features in the layer with an array of new features, it takes one argument:
    - `features`: Array, an array of new features
 - `select_feature`: Function, select a feature, it takes one argument:
    - `id`: String, the id of an existing feature to be selected
 - `select_features`: Function, select an array of features, it takes one argument:
    - `ids`: Array, an array of features ids
 - `add_feature`: Function, add a new feature, it takes one argument:
    - `new_feature`: Object, the new feature object
 - `add_features`: Function, add an array of new features, it takes one argument:
    - `new_features`: Array, an array of features
 - `remove_feature`: Function, remove a feature, it takes one argument:
    - `id`: String, the id of an existing feature to be removed
 - `remove_features`: Function, remove an array of features, it takes one argument:
    - `ids`: Array, an array of features ids
 - `get_features`: Function, get all the features of the layer, it takes no argument

Example in Python:

<!-- ImJoyPlugin: {"type": "native-python", "editor_height": "400px", "requirements": ["imageio", "numpy"]} -->
```python
from imjoy import api
import imageio
import numpy as np

class ImJoyPlugin():
    async def setup(self):
        pass

    async def run(self, ctx):
        viewer = await api.createWindow(src="https://kaibu.org/#/app")

        # view image
        image = imageio.imread('imageio:chelsea.png')
        await viewer.view_image(image, type="itk-vtk", name="Chelsea")

        # add polygon to a vector layer
        triangle = np.array([[11, 13], [111, 113], [22, 246]], dtype='uint16')
        await viewer.add_shapes([ triangle ], shape_type="polygon", edge_color="red", name="triangle")

api.export(ImJoyPlugin())
```

### add_points(points, options)

Add a vector layer with points

**Arguments**
 - `points`: a list of points, each point is a list of two values for the coordinate with x, y.
 - `options`: same as `add_shapes` above

**Returns**
same as `add_shapes` above


Example in Python:

<!-- ImJoyPlugin: {"type": "native-python", "editor_height": "400px", "requirements": ["imageio", "numpy"]} -->
```python
from imjoy import api
import imageio
import numpy as np

class ImJoyPlugin():
    async def setup(self):
        pass

    async def run(self, ctx):
        viewer = await api.createWindow(src="https://kaibu.org/#/app")

        # read a sample image
        image = imageio.imread('imageio:chelsea.png')
        await viewer.view_image(image, type="itk-vtk", name="Chelsea")

        # add points to a vector layer
        points = np.random.randint(0, 500, [100, 2], dtype='uint16')
        await viewer.add_points(points, face_color="purple", name="points")

api.export(ImJoyPlugin())
```

### get_layer_ids()

Get all the layer ids.

**Returns**
An array of layer ids.

### get_layer(key)

Get a layer by its id or name.

**Arguments**
 - `key`: String, the id or name of the layer

**Returns**
The layer object corresponding to the id or name.
If the layer is not found, it will return `null`.

### add_widget(options)

Add a widget panel with buttons, file tree or graph.

**Arguments**
 - `options`:
    - `name`: String, name of the widget panel
    - `type`: String, type of the widget panel, the supported types are: `control`, `form` `tree`, `vega`.
    - `attach_to`: String or null, if set, it means this widget will be attached to a layer (match by its name) and will be shown with the layer properties
    - `max_height`: Number, the maximum pixel height of the widget, the default value is 400.
    - other type-specific options

**Returns**
An object with the layer api functions, depending on the widget types, the api functions are different, see below.


#### Control Widget
For `type="control"`, you can add buttons and dropdown with callback function attached, the supported elements types are `button`, `dropdown`. 
**Arguments**
 - `name`: String, name of the widget panel
 - `type`: String, type of the widget panel, it must be `control` for control widget
 - `attach_to`: String or null, if set, it means this widget will be attached to a layer (match by its name) and will be shown with the layer properties
 - `max_height`: Number, the maximum pixel height of the widget, the default value is 400.
 - `elements`: Array, an array of control element with different types. For example, a button: `{"type": "button", "label": "Say Hello", "callback": say_hello}` and a dropdown menu: `{"type": "dropdown","label": "Mode","options": ["Mode A", "Mode B"], "callback": select_mode}`

**Returns**
The returned layer api object consist of:
 - `clear_elements`: Function, a function for clearing all the control elements
 - `set_elements`: Function, a function for setting the control elements, it takes one argument:
    - `elements`: Array, an array of control elements, each element can have `type` (`button`, `dropdown`), `label` and `callback`, see the example below.

See an example below:
<!-- ImJoyPlugin: {"type": "native-python", "editor_height": "400px", "requirements": ["imageio", "numpy"]} -->
```python
from imjoy import api

class ImJoyPlugin():
    async def setup(self):
        pass

    async def run(self, ctx):
        viewer = await api.createWindow(src="https://kaibu.org/#/app")

        async def say_hello():
            await api.alert('Hello!')

        async def select_mode(mode):
            await api.alert("Selected mode: " + mode)

        await viewer.add_widget(
            {
                "_rintf": True,
                "name": "Control",
                "type": "control",
                "elements": [
                    {
                        "type": "button",
                        "label": "Say Hello",
                        "callback": say_hello,
                    },
                    {
                        "type": "dropdown",
                        "label": "Mode",
                        "options": ["Mode A", "Mode B"],
                        "callback": select_mode,
                    },
                ],
            })

api.export(ImJoyPlugin())
```

#### Form Widget
For `type="form"`, you can show a form with many fields for the user to fill. 

**Arguments**
 - `name`: String, the name of the form
 - `type`: String, type of the widget panel, it must be `form` for form widget
 - `attach_to`: String or null, if set, it means this widget will be attached to a layer (match by its name) and will be shown with the layer properties
 - `max_height`: Number, the maximum pixel height of the widget, the default value is 400.
 - `camelize_payload_keys`: Boolean, whether the keys (derived from the `label` property of the field) should be converted too camel style
 - `form_submit_callback`: Function, a callback function which will be called when the user submit the form. It carries one argument which are the values of the form.
 - `fields`: Array, an array of fields, see [here](https://github.com/14nrv/vue-form-json/blob/master/src/components/Form/fields.json) for an example array with the supported fields. By default, all the fields are mandatory, you can also make it not mandatory by setting `isRequired: false`.
    In addition to the standard fields supported by `vue-form-json`, we also provide custom fields types:
    - `tags`:
    ```json
    {
        "type": "tags",
        "label": "book tags",
        "options": ["drama", "sci-fi"],
        "placeholder": "Add a tag",
        "icon": "label",
        "value": ["drama"],
        "allow_new": true,
    }
    ```
    - `button`:
    ```js
    {
        "type": "button",
        "label": "select a file", "callback": ()=>{
            // do something here
            // you can return some value here
            // and it will be filled as part of the form
            return file
        }
    
    }
    ```
    - `files`:
    ```js
    {
        type: "files",
        label: "my-files"
    }
    ```
**Returns**
The returned layer api object consist of:
 - `clear_fields`: Function, remove all the fields in the form
 - `set_fields`: Function, set an array of fields, different field types are supported, see [here](https://github.com/14nrv/vue-form-json/blob/master/src/components/Form/fields.json) for an example array with the supported fields.

<!-- ImJoyPlugin: {"type": "native-python", "editor_height": "400px", "requirements": ["imageio", "numpy"]} -->
```python
from imjoy import api

class ImJoyPlugin():
    async def setup(self):
        pass

    async def run(self, ctx):
        viewer = await api.createWindow(src="https://kaibu.org/#/app")

        async def form_submit_callback(fields):
            await api.alert("Selected mode: " + str(fields))

        await viewer.add_widget(
            {
                "_rintf": True,
                "name": "My Form",
                "type": "form",
                "form_submit_callback": form_submit_callback,
                "fields": [
                    {
                        "label": "First Name",
                        "value": "fir",
                        "rules": {
                            "min": 4,
                            "max": 20
                        }
                    },
                     {
                        "label": "Country",
                        "type": "select",
                        "iconLeft": "globe-americas",
                        "placeholder": "Select your option",
                        "options": [
                            "Afghanistan",
                            "Åland Islands",
                            "Albania",
                            "Algeria",
                            "...",
                            "Western Sahara",
                            {"text": "Yemen", "value": "YE"},
                            {"text": "Zambia", "value": "ZB", "selected": True},
                            "Zimbabwe"
                        ]
                    },
                    {
                        "html": "<div class='box'><article class='media'><div class='media-left'><figure class='image is-64x64'><img src='https://bulma.io/images/placeholders/64x64.png' alt='Image'></figure></div><div class='media-content'><div class='content'><p><strong class='has-text-info'>Info</strong><br>You can also pass html like this box</p></div>"
                    },
                ],
            })

api.export(ImJoyPlugin())
```


#### Tree Widget
For `type="tree"`, you can pass a tree with nodes and set callback for the double click events.

**Arguments**
 - `name`: String, name of the tree
 - `type`: String, type of the widget panel, it must be `tree` for tree widget
 - `attach_to`: String or null, if set, it means this widget will be attached to a layer (match by its name) and will be shown with the layer properties
 - `max_height`: Number, the maximum pixel height of the widget, the default value is 400.
 - `node_dbclick_callback`: Function, a callback function triggered when the user double click on a node, one argument with the node object will be passed to the function
 - `node_drop_callback`: Function, a callback function triggered when the user drag and drop a node, two arguments will be passed `nodes` (the ones that are being moved) and `position` (the reference node).
 - `node_toggle_callback`: Function, a callback function triggered when the user toggle a node.
 - `nodes`: Array, an array of node objects. One node is an object with some fixed fields, for example: `{"title": 'Item1', "isLeaf": True, "isExpanded": True}`, a node can also contain `children` which is an inner array of nodes. 

**Returns**
The returned layer api object consist of:
 - `clear_nodes`: Function, a function for clearing all the nodes in the tree, it takes no argument
 - `set_nodes`: Function, a function for setting new nodes in the tree, it takes one argument:
    - `nodes`: Array, an array of nodes, and one node is an object with some fixed fields, for example: `{"title": 'Item1', "isLeaf": True, "isExpanded": True}`, a node can also contain `children` which is an inner array of nodes. Each node can also contain any custom data via the `data` key.
 - `get_nodes`: Function, a function for retrieving the nodes in the tree, it takes no argument.


See an example below:

<!-- ImJoyPlugin: {"type": "native-python", "editor_height": "400px", "requirements": ["imageio", "numpy"]} -->
```python
from imjoy import api

class ImJoyPlugin():
    async def setup(self):
        pass

    async def run(self, ctx):
        viewer = await api.createWindow(src="https://kaibu.org/#/app")

        async def node_dbclick_callback(node):
            await api.alert("selected node:" + str(node))

        tree = await viewer.add_widget(
            {
                "_rintf": True,
                "type": "tree",
                "name": "Samples",
                "node_dbclick_callback": node_dbclick_callback,
                "nodes": [
                    {"title": 'Item1', "isLeaf": True, "data": {"my-custom-data": 123}},
                    {"title": 'Item2', "isLeaf": True},
                    {"title": 'Folder1'},
                    {"title": 'Folder2', "isExpanded": True,
                        "children": [
                            {"title": 'Item3', "isLeaf": True},
                            {"title": 'Item4', "isLeaf": True}
                        ]
                    }
                ],
            }
        )

api.export(ImJoyPlugin())
```

In the above example, if you want to update the tree later, you can do the following:

```python
# Update the tree
await tree.clear_nodes()
nodes = [
    #...new tree nodes...
]
await tree.set_nodes(nodes)
```

#### Vega Widget
For `type="vega"`, you can pass any vega schema which enables supporting a large variety of chart types, see examples here: https://vega.github.io/vega/examples/. 
**Arguments**
 - `name`: String, name of the widget panel
 - `type`: String, type of the widget panel, it must be `vega` for vega widget
 - `attach_to`: String or null, if set, it means this widget will be attached to a layer (match by its name) and will be shown with the layer properties
 - `max_height`: Number, the maximum pixel height of the widget, the default value is 400.
 - `spec`: Object or String, a vega spec object or URL

**Returns**
The returned layer api object consist of:
 - `append`: Function, a function for appending a data point to the chart, it takes two arguments:
    - `dataName`: the name of the dataset in the chart
    - `data`: the data point to be appended
 - `clear_data`: Function, clear all the data point in the chart, it takes no argument
 - `set_title`: Function, set the title of the chart, it takes a string as input argument
 - `set_expression_function`: set a custom vega expressionFunction, for example, to be used in the spec for transforming data

<!-- ImJoyPlugin: {"type": "native-python", "editor_height": "400px", "requirements": ["numpy"]} -->
```python
from imjoy import api

class ImJoyPlugin():
    async def setup(self):
        pass

    async def run(self, ctx):
        viewer = await api.createWindow(src="https://kaibu.org/#/app")

        async def node_dbclick_callback(node):
            await api.alert("selected node:" + str(node))

        chart = await viewer.add_widget(
            {
                "_rintf": True,
                "name": "Bar chart",
                "type": "vega",
                "spec": "https://raw.githubusercontent.com/vega/vega/master/docs/examples/bar-chart.vg.json",
            }
        )

api.export(ImJoyPlugin())
```

For displaying a line chart for example, you can take the spec from https://vega.github.io/vega/examples/line-chart/ and replace the `values`(under `data`) with your line data.

In Python, you can also use [altair](https://altair-viz.github.io/) to obtain the spec.


### select_widget(widget_name)
Activate a specific widget tab

### clear_layers()

Remove all the layers

### remove_layer(options)

Remove a specific layer by its id

**Arguments**
 - `options`:
    - `id`: String, id of the layer to be removed

### set_sliders(sliders)

Set an array of sliders shown in the bottom

**Arguments**
 - `sliders`: Array, an array of slider objects, one slider can contain the following fields:
    - `name`: String, name of the slider, it should be short, ideally one letter
    - `min`: Number, the minimum value of the slider
    - `max`: Number, the maximum value of the slider
    - `step`: Number, the sliding step
    - `value`: Number or Array, the default value of the slider, if an array of two values is given, then it will become a range slider.
    - `change_callback`: Function, the callback function called when the slider value changed

Example in Javascript:
<!-- ImJoyPlugin: {"type": "web-worker", "editor_height": "400px"} -->
```js
class ImJoyPlugin {
    async setup() {}
    async run(ctx) {
        const viewer = await api.createWindow({src: "https://kaibu.org/#/app", name: "Kaibu"})
        await viewer.view_image("https://images.proteinatlas.org/61448/1319_C10_2_blue_red_green.jpg")
        await viewer.set_sliders([
            {
                _rintf: true,
                name: "Z",
                min: 0,
                max: 1000,
                step: 1,
                value: [200, 400], // this makes it a range slider
                change_callback() {
                    console.log("z slider changed.");
                }
            },
            {
                _rintf: true,
                name: "T",
                min: 0,
                max: 100,
                step: 1,
                value: 10,
                change_callback() {
                    console.log("t slider changed.");
                }
            }
        ])

        await viewer.update_slider("T", 30)
    }
}
api.export(new ImJoyPlugin())
```

### update_slider(name, value)

Update a slider value by its name

**Arguments**
 - `name`: String, the name of the slider
 - `value`: Number or Arrary, the value for the slider, or an array with two elements

(Also, see the example above)
### set_loader(enable)

Show a loading animation

**Arguments**
 - `enable`: Boolean, whether the loader should be displayed

### set_mode(mode)

Set the UI mode of the viewer

**Arguments**
 - `mode`: String, it should be one of the following options:
    - `"lite"`: minimal UI mode
    - `"full"`: full UI mode, with additional options such as open local files and add new layer etc.

### open_sidebar(open)

Open or hide the side bar

**Arguments**
 - `open`: Boolean, true for open, false for hide

### set_timeout(callback, time)

A simple wrapper to the `setTimeout` function in Javascript

### clear_timeout(callback, time)

A simple wrapper to the `clearTimeout` function in Javascript

## Example 1: Skin image annotation

The follow code block shows a simple example on annotating skin image with a form widget.
<!-- ImJoyPlugin: {"type": "web-worker", "editor_height": "400px", "hide_code_block": true} -->
```js
class ImJoyPlugin {
  async setup() {}
  async run(ctx) {
    const viewer = await api.createWindow({
      src: "https://kaibu.org/#/app",
      name: "Kaibu"
    })
    await viewer.view_image("https://raw.githubusercontent.com/dasoto/skincancer/master/images/test.png", {
      name: "skin image"
    })
    await viewer.add_shapes([],{name: "ROI"})
    await viewer.add_widget({
      "_rintf": true,
      "name": "Labels",
      "type": "form",
      "form_submit_callback": function (values) {
        api.showMessage(JSON.stringify(values))
      },
      "fields": [{
        "label": "Skin Cancer Type",
        "type": "radio",
        "items": [{
            "text": "Normal",
            "value": "Normal",
            "checked": true
          },
          "Melanoma",
          "Squamous cell carcinoma"
        ]
        },
        {
          "label": "Comment",
          "placeholder": "",
          "isRequired": false
      }],
    })
  }
}
api.export(new ImJoyPlugin())
```

## Example 2: Annotate multi-frame CT images

In the following code block we show how to use the sliders to annotate a 3D volume frame by frame and save the annotation as json file.
You can also find a [Jupyter notebook here](https://github.com/imjoy-team/kaibu/blob/master/notebooks/AnnotateCTImages-Kaibu.ipynb) which is recommended if you want to run it locally.

<!-- ImJoyPlugin: {"type": "native-python", "editor_height": "400px", "requirements": ["numpy", "pydicom"], "hide_code_block": true} -->
```python
import os
import json
from imjoy import api
from pydicom import dcmread
from pydicom.data import get_testdata_file


path = get_testdata_file("eCT_Supplemental.dcm")
ds = dcmread(path)
ct_volume = ds.pixel_array # the example volume has only two frames
MAX_FRAMES = 100
annotations = {}
ANNOTATION_DIR = './annotations'
os.makedirs(ANNOTATION_DIR, exist_ok=True)

def save_annotation(filename, annotation):
    with open(os.path.join(ANNOTATION_DIR, filename), 'w') as outfile:
        json.dump(annotation, outfile)

class ImJoyPlugin():
    async def setup(self):
        self.image_layer = None
        self.currrent_index = 0

    async def run(self, ctx):
        viewer = await api.createWindow(src="https://kaibu.org/#/app", fullscreen=True)
        self.image_layer = await viewer.view_image(ct_volume[0, :, :])
        self.annotation_layer = await viewer.add_shapes([], 
                                                        name="annotation", 
                                                        draw_enable=False, 
                                                        draw_label="my roi",
                                                        draw_shape_type="polygon",
                                                        draw_edge_color="#0080ff")

        async def save_current_annotation():
            # save the annotation before change to the next layer
            # this will be a json object in geojson format
            # you can save it as json file
            # to convert geojson to mask image, 
            # see here: https://github.com/imjoy-team/imjoy-interactive-segmentation/blob/4c920bd6b619407bfe2ddf321f4452a4517adbbd/imgseg/geojson_utils.py#L51
            annotations[self.currrent_index] = await self.annotation_layer.get_features()
            # save as json file on disk
            save_annotation('annotation_frame'+str(self.currrent_index)+'.json', annotations[self.currrent_index])

        async def goto_next():
            index = (self.currrent_index + 1) % MAX_FRAMES
            await viewer.update_slider("Z", index)
            self.currrent_index = index
            await switch_frame(index)

        async def switch_frame(index):
            try:
                # make sure we don't exceed the MAX_FRAMES
                index = index % MAX_FRAMES
                await viewer.set_loader(True)
                await save_current_annotation()
                self.currrent_index = index
                # The example data have only 2 frames, here we use `index % 2` to repeat the frames
                await self.image_layer.set_image(ct_volume[index % ct_volume.shape[0], :, :])

                # restore the annotation if available
                if index in annotations:
                    self.annotation_layer.set_features(annotations[index])
                else:
                    self.annotation_layer.clear_features()

            finally:
                await viewer.set_loader(False)

        await viewer.set_sliders([
        {
            "_rintf": True,
            "name": "Z",
            "min": 0,
            "max": MAX_FRAMES,
            "step": 1,
            "value": self.currrent_index,
            "change_callback": switch_frame
        }])


        await viewer.add_widget(
        {
            "_rintf": True,
            "name": "Control",
            "type": "control",
            "elements": [
                {
                    "type": "button",
                    "label": "Save",
                    "callback": save_current_annotation,
                },
                {
                    "type": "button",
                    "label": "Next",
                    "callback": goto_next,
                }
            ],
        })

api.export(ImJoyPlugin())
```
## Example 3: Interactive segmentation with Kaibu

See the example project repository [here](https://github.com/imjoy-team/imjoy-interactive-segmentation).

[![launch ImJoy](https://imjoy.io/static/badge/launch-imjoy-badge.svg)](https://imjoy.io/#/app?workspace=kaibu&plugin=https://raw.githubusercontent.com/imjoy-team/imjoy-interactive-segmentation/master/interactive_trainer.py)
[![Binder](https://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/gh/imjoy-team/imjoy-interactive-segmentation/master?filepath=Tutorial.ipynb)
[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imjoy-team/imjoy-interactive-segmentation/blob/master/Tutorial.ipynb)

## Implementation details

The implementation of the ImJoy API can be found [here](https://github.com/imjoy-team/kaibu/blob/master/src/imjoyAPI.js) (search for the `service_api` object).

Each layer object also exposes api, you can find the defined functions for [VectorLayer](https://github.com/imjoy-team/kaibu/blob/master/src/components/layers/VectorLayer.vue) and [ItkVtkLayer](https://github.com/imjoy-team/kaibu/blob/master/src/components/layers/ItkVtkLayer.vue)(search for the `getLayerAPI()` function).

You can also try a demo in a Jupyter notebook by clicking [here](https://mybinder.org/v2/gist/oeway/690c2e62311223ae93e644d542eb8949/master?filepath=Kaibu-jupyter-tutorial.ipynb) to launch a notebook on Binder (may take a while to start).
