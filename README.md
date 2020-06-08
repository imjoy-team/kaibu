<a href="https://kaibu.org" target="_blank" ><img src="https://raw.githubusercontent.com/imjoy-team/kaibu/master/public/static/img/kaibu-banner.svg?sanitize=true" width="380" alt="Kaibu"></img>
</a>

Kaibu is a web application for visualizing and annotating multi-dimensional images, built with [OpenLayers](https://openlayers.org/) and [itk-vtk-viewer](https://kitware.github.io/itk-vtk-viewer/).

----
***WARNING: This is a work-in-progress repo, you are welcome to try it out but it's not ready for use in production yet.***

## How to use it

### As standalone appliction: https://kaibu.org

![Kaibu Screenshot](./public/static/img/kaibu-screenshot-1.png)

### As ImJoy plugin: https://imjoy.io/#/app?plugin=https://kaibu.org

```python
import numpy as np

image1 = np.random.randint(30, 255, [50,100], dtype='uint8')
image2 = np.random.randint(0, 180, [100,50], dtype='uint8')

# define two layers
layers = [
    {"name": "test image 1", "image": image1, "type": "itk-vtk"},
    {"name": "test image 2", "image": image2, "type": "itk-vtk"}
]

# show the layers with Kaibu
api.createWindow(type="Kaibu",
                 src="https://kaibu.org/", 
                 data={"layers": layers})
```

## Why Kaibu?

`Kaibu` is [a small island in Fiji](https://www.google.com/maps/place/Kaibu+Island/), and we name it to pay tribute to the open source image processing package [Fiji](https://fiji.sc/)/[ImageJ](https://imagej.net). Meanwhile, the layered design of Kaibu is inspired by [Napari](https://napari.org/) which is also named after an island. `Kaibu` in Chinese(开步), it means "to step forward", and yes, it time to step forward with Kaibu!

<img src="https://raw.githubusercontent.com/imjoy-team/kaibu/master/public/static/img/kaibu-logo.gif?sanitize=true" width="400" alt="Kaibu"></img>


## License

MIT