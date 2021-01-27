import __SNOWPACK_ENV__ from './vizarr_module/__snowpack__/env.js';
import.meta.env = __SNOWPACK_ENV__;

import React from './vizarr_module/web_modules/react.js';
import {useRecoilState, useSetRecoilState } from './vizarr_module/web_modules/recoil.js';
import {createSourceData} from './vizarr_module/_dist_/io.js';

import { layerIdsState, sourceInfoState, viewerViewState } from './vizarr_module/_dist_/state.js';
import Vizarr from './vizarr_module/_dist_/vizarr.js';

import ReactDOM from "./vizarr_module/web_modules/react-dom.js";
import {RecoilRoot} from "./vizarr_module/web_modules/recoil.js";
import {ThemeProvider} from "./vizarr_module/web_modules/@material-ui/styles.js";
import theme2 from "./vizarr_module/_dist_/theme.js";


function Button({ onClick }) {
  const style = { position: 'absolute', right: '30px' };
  return React.createElement('button', { onClick, style }, "It worked!");
}

let resolveVizarr;

export function CustomVizarr() {
  const setLayerIds = useSetRecoilState(layerIdsState);
  const setSourceInfo = useSetRecoilState(sourceInfoState);
  const [setViewState] = useRecoilState(viewerViewState);


  // Copied from './vizarr_modules/_dist_/vizarr.js
  async function addImage(config) {
    // Generate ID unique to image (layer)
    const id = Math.random().toString(36).slice(2);
    // Config is same as ImJoy API
    const sourceData = await createSourceData(config);
    // Adds source info to state
    setSourceInfo((prevSourceInfo) => {
      if (!sourceData.name) {
        sourceData.name = `image_${Object.keys(prevSourceInfo).length}`;
      }
      return {...prevSourceInfo, [id]: sourceData};
    });
    // Update active Layer IDs
    setLayerIds((prevIds) => [...prevIds, id]);
  }

  if(resolveVizarr){
    resolveVizarr({
      setViewState,
      addImage
    }) 
    resolveVizarr = null 
  }
  return React.createElement('div', null,
    React.createElement(Vizarr, null),
    React.createElement(Button, { onClick })
  )
}

window.CreateVizarrViewer = (container)=>{
    return new Promise((resolve)=>{
      resolveVizarr = resolve
      ReactDOM.render(
        /* @__PURE__ */ React.createElement(ThemeProvider, { theme: theme2 },
          /* @__PURE__ */ React.createElement(RecoilRoot, null,
            /* @__PURE__ */ React.createElement(CustomVizarr, null))),
        container
      );
    })
}

document.dispatchEvent(new CustomEvent('vizarr-loaded', { detail: window.VizarrViewer }))

