<a href="https://kaibu.org" target="_blank" ><img src="https://raw.githubusercontent.com/imjoy-team/kaibu/master/public/static/img/kaibu-banner.svg?sanitize=true" width="380" alt="Kaibu"></img>
</a>

[![Launch ImJoy](https://imjoy.io/static/badge/launch-imjoy-badge.svg)](https://imjoy.io/#/app?plugin=https://kaibu.org/#/app)
[![Binder](https://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/gist/oeway/690c2e62311223ae93e644d542eb8949/master?filepath=Kaibu-jupyter-tutorial.ipynb)
[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/drive/1uwBG7mGnzcycwthucS5-I-KVSajIxUjq)

Kaibu is a web application for visualizing and annotating multi-dimensional images, built with [OpenLayers](https://openlayers.org/) and [itk-vtk-viewer](https://kitware.github.io/itk-vtk-viewer/).

----
***WARNING: This is a work-in-progress repo, you are welcome to try it out but it's not ready for use in production yet.***

Documentation: https://kaibu.org/docs/

## How to use it?

### As standalone appliction: https://kaibu.org

![Kaibu Screenshot](https://raw.githubusercontent.com/imjoy-team/kaibu/master/public/static/img/kaibu-screenshot-1.png)

### As ImJoy plugin

https://imjoy.io/#/app?plugin=https://kaibu.org/#/app

Currently we support `view_image`, `add_image`, `add_shapes` and `add_points`, the definition is mostly the same as [napari](https://napari.org/).

### Kaibu API functions for ImJoy
See documentation https://kaibu.org/docs/#/api

### In a Jupyter notebook
Run `pip install imjoy-jupyter-extension`, then start the the Jupyter notebook. Then you can use the above plugin example in the notebook.

You can try the demo on Binder here: [![Binder](https://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/gist/oeway/690c2e62311223ae93e644d542eb8949/master?filepath=Kaibu-jupyter-tutorial.ipynb)

### Kaibu badges
We provide two badges for you to add to your project:

![open with kaibu](https://kaibu.org/static/badge/open-with-kaibu.svg)

![view in kaibu](https://kaibu.org/static/badge/view-in-kaibu.svg)

```
![open with kaibu](https://kaibu.org/static/badge/open-with-kaibu.svg)

![view in kaibu](https://kaibu.org/static/badge/view-in-kaibu.svg)
```

## Why Kaibu?

`Kaibu` is [a small island in Fiji](https://www.google.com/maps/place/Kaibu+Island/), and we name it to pay tribute to the open source image processing package [Fiji](https://fiji.sc/)/[ImageJ](https://imagej.net). Meanwhile, the layered design of Kaibu is inspired by [Napari](https://napari.org/) which is also named after an island. `Kaibu` in Chinese(开步), it means "to step forward", and yes, it is time to step forward with Kaibu!

<img src="https://raw.githubusercontent.com/imjoy-team/kaibu/master/public/static/img/kaibu-logo.gif?sanitize=true" width="400" alt="Kaibu"></img>


## License

MIT
