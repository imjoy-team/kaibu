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

 - image: an image URL, base64 encoded image or a numpy array in Python
 - options:
    - type: String, image layer type, currently supports `2d-image`(OpenLayers 2D image layer), `itk-vtk` (ITK/VTK Viewer 2D/3D layer) or `vector`(OpenLayers vector feature layer).
    - name: String, name of the image layer


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

 - shapes: a list of shapes, each shape is a list of coordinates
 - options:
    - name: String, name of the image layer
    - shape_type: String, type of the shape, "polygon", "path", "rectangle"
    - edge_width: String, width of the edge
    - edge_color: String, color of the edge, should be an hex string format, for example: `#F7350B`, you can use https://htmlcolorcodes.com/color-picker/ to pick a color.
    - face_color: String, color for filling the face, hex string format, same as `edge_color`
    - size: Number, size of the shape
    - label: String, label fo the shape


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

 - points: a list of points, each point is a list of two values for the coordinate with x, y.
 - options:
    - name: String, name of the image layer
    - edge_width: String, width of the edge
    - edge_color: String, color of the edge, should be an hex string format, for example: `#F7350B`, you can use https://htmlcolorcodes.com/color-picker/ to pick a color.
    - face_color: String, color for filling the face, hex string format, same as `edge_color`
    - size: Number, size of the shape
    - label: String, label fo the shape


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

 - options:
    - name: String, name of the widget panel
    - type: String, type of the widget panel, the supported types are: `control`, `tree`, `vega`.
    - other type-specific options 

For `type="control"`, you can add buttons and dropdown with callback function attached, the supported elements types are `button`, `dropdown`.

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


For `type="tree"`, you can pass a tree with nodes and set callback for the double click events. See an example below:

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

For `type="vega"`, you can pass any vega schema which enables supporting a large variety of chart types, see examples here: https://vega.github.io/vega/examples/.


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
 - options:
    - id: String, id of the layer to be removed

### set_loader(enable)
Show a loading animation
 - enable: Boolean, whether the loader should be displayed

### set_mode(mode)
Set the UI mode of the viewer
 - mode: String, it should be one of the following options:
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
