<a href="https://kaibu.org" target="_blank" ><img src="https://raw.githubusercontent.com/imjoy-team/kaibu/master/public/static/img/kaibu-banner.svg?sanitize=true" width="380" alt="Kaibu"></img>
</a>

Kaibu is a web application for visualizing and annotating multi-dimensional images, built with [OpenLayers](https://openlayers.org/) and [itk-vtk-viewer](https://kitware.github.io/itk-vtk-viewer/).

----
***WARNING: This is a work-in-progress repo, you are welcome to try it out but it's not ready for use in production yet.***

## How to use it?

### As standalone appliction: https://kaibu.org

![Kaibu Screenshot](./public/static/img/kaibu-screenshot-1.png)

### As ImJoy plugin: https://imjoy.io/#/app?plugin=https://kaibu.org

```python
from imjoy import api
import numpy as np

class ImJoyPlugin():
    async def setup(self):
        pass

    async def run(self, ctx):
        viewer = await api.createWindow(src="http://127.0.0.1:8080/")

        # create an random image
        image = np.random.randint(0, 255, [500,500], dtype='uint8')
        # view image
        await viewer.view_image(image)
        
        # add polygons
        points = np.random.randint(0, 500, [100, 2], dtype='uint16').tolist()
        await viewer.add_shapes(points, shape_type="point")

api.export(ImJoyPlugin())
```

You can also try the above code in a Jupyter notebook on binder, [click here](https://mybinder.org/v2/gh/imjoy-team/imjoy-binder-image/master?filepath=imjoy-jupyter-tutorial.ipynb) to launch a notebook on Binder (may take a while to start).

### In a Jupyter notebook
Run `pip install imjoy-jupyter-extension`, then start the the Jupyter notebook. Then you can use the above plugin example in the notebook.

You can also try the demo here: [![Binder](https://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/gh/oeway/690c2e62311223ae93e644d542eb8949/master?filepath=Kaibu-jupyter-example.ipynb)

## Why Kaibu?

`Kaibu` is [a small island in Fiji](https://www.google.com/maps/place/Kaibu+Island/), and we name it to pay tribute to the open source image processing package [Fiji](https://fiji.sc/)/[ImageJ](https://imagej.net). Meanwhile, the layered design of Kaibu is inspired by [Napari](https://napari.org/) which is also named after an island. `Kaibu` in Chinese(开步), it means "to step forward", and yes, it is time to step forward with Kaibu!

<img src="https://raw.githubusercontent.com/imjoy-team/kaibu/master/public/static/img/kaibu-logo.gif?sanitize=true" width="400" alt="Kaibu"></img>


## License

MIT