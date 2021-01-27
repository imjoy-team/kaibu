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

## Kaibu API

### view_image(image, options)

Add an image layer

- `image`: an image URL, base64 encoded image or a numpy array in Python
- options:
    - `type`: String, image layer type, currently supports `2d-image`(OpenLayers 2D image layer), `itk-vtk` (ITK/VTK Viewer 2D/3D layer) or `vector`(OpenLayers vector feature layer).
    - `name`: String, name of the image layer

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
    - `label`: String, label fo the shape
    - `draw_enable`: Boolean, switch on the markup tool
    - `draw_label`: String, set the label for the markup tool
    - `draw_freehand`: Boolean, switch on freehand mode for the markup tool
    - `draw_shape_type`: String, choose a shape type for the markup tool, should be one of the following: "polygon", "path", "rectangle"
    - `draw_edge_width`: Integer, set the edge width of the markup tool
    - `draw_edge_color`: String, set the edge color for the markup tool, should be an hex string format, same as `edge_color`
    - `draw_face_color`: String, set the face color for the markup tool, should be an hex string format, same as `edge_color` 
    - `draw_size`: Integer, set the size for the point size for the markup tool, only used when draw_shape_type="point"
    - `select_feature_callback`: Function, a function which will be called when a new feature is selected, the feature object will be passed as input argument
    - `add_feature_callback`: Function, a function which will be called when a new feature is added to the layer, the feature object will be passed as input argument
    - `remove_feature_callback`: Function, a function which will be called when a new feature is removed from the layer, the feature object will be passed as input argument
    - `change_feature_callback`: Function, a function which will be called when a new feature is updated, the feature object will be passed as input argument

**Returns**
An object with the layer api functions:
 - `name`: String, the name of the layer
 - `id`: String, the id of the layer
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

### add_widget(options)

Add a widget panel with buttons, file tree or graph.

**Arguments**
 - `options`:
    - `name`: String, name of the widget panel
    - `type`: String, type of the widget panel, the supported types are: `control`, `form` `tree`, `vega`.
    - other type-specific options

**Returns**
An object with the layer api functions, depending on the widget types, the api functions are different, see below.


#### Control Widget
For `type="control"`, you can add buttons and dropdown with callback function attached, the supported elements types are `button`, `dropdown`. 
**Arguments**
 - `name`: String, name of the widget panel
 - `type`: String, type of the widget panel, it must be `control` for control widget
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
 - `fields`: Array, an array of fields, see [here](https://github.com/14nrv/vue-form-json/blob/master/src/components/Form/fields.json) for an example array with the supported fields.

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
                            {"text": "Zambia", "value": "ZB", "selected": true},
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
 - `node_dbclick_callback`: Function, a callback function triggered when the user double click on a node, one argument with the node object will be passed to the function
 - `nodes`: Array, an array of node objects. One node is an object with some fixed fields, for example: `{"title": 'Item1', "isLeaf": True, "isExpanded": True}`, a node can also contain `children` which is an inner array of nodes. 

**Returns**
The returned layer api object consist of:
 - `clear_nodes`: Function, a function for clearing all the nodes in the tree, it takes no argument
 - `set_nodes`: Function, a function for setting new nodes in the tree, it takes one argument:
    - `nodes`: Array, an array of nodes, and one node is an object with some fixed fields, for example: `{"title": 'Item1', "isLeaf": True, "isExpanded": True}`, a node can also contain `children` which is an inner array of nodes.
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
                    {"title": 'Item1', "isLeaf": True},
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

### clear_layers()

Remove all the layers

### remove_layer(options)

Remove a specific layer by its id

**Arguments**
 - `options`:
    - `id`: String, id of the layer to be removed

### set_loader(enable)

Show a loading animation

**Arguments**
 - `enable`: Boolean, whether the loader should be displayed

### set_mode(mode)

Set the UI mode of the viewer

**Arguments**
 - `mode`: String, it should be one of the following options:
    - `"lite"`: minimal UI mode
    - `"full"`: full UI mode

### set_timeout(callback, time)

A simple wrapper to the `setTimeout` function in Javascript

### clear_timeout(callback, time)

A simple wrapper to the `clearTimeout` function in Javascript

## Example: Interactive segmentation with Kaibu

See the example project repository [here](https://github.com/imjoy-team/imjoy-interactive-segmentation).

[![launch ImJoy](https://imjoy.io/static/badge/launch-imjoy-badge.svg)](https://imjoy.io/#/app?workspace=kaibu&plugin=https://raw.githubusercontent.com/imjoy-team/imjoy-interactive-segmentation/master/interactive_trainer.py)
[![Binder](https://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/gh/imjoy-team/imjoy-interactive-segmentation/master?filepath=Tutorial.ipynb)
[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imjoy-team/imjoy-interactive-segmentation/blob/master/Tutorial.ipynb)

## Implementation details

The implementation of the ImJoy API can be found [here](https://github.com/imjoy-team/kaibu/blob/master/src/imjoyAPI.js) (search for the `service_api` object).

Each layer object also exposes api, you can find the defined functions for [VectorLayer](https://github.com/imjoy-team/kaibu/blob/master/src/components/layers/VectorLayer.vue) and [ItkVtkLayer](https://github.com/imjoy-team/kaibu/blob/master/src/components/layers/ItkVtkLayer.vue)(search for the `getLayerAPI()` function).

You can also try a demo in a Jupyter notebook by clicking [here](https://mybinder.org/v2/gist/oeway/690c2e62311223ae93e644d542eb8949/master?filepath=Kaibu-jupyter-tutorial.ipynb) to launch a notebook on Binder (may take a while to start).
