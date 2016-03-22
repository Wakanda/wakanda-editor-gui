var IDE = window.IDE;

import Styling from './Styling';

// TODO:Daba put css here

export default {

  activate() {
    let GUID = IDE.GUID;
    let pannelsManager = IDE.panels;

    let panelContainer = pannelsManager.addPanel({panelName: 'Styling'});

    let stylingPanelInstance = new Styling({
      panelContainer,
      documentEditor: GUID.documentEditor
    });
    // TODO: manage the comunication between plugins in the plugins manager (services in atom )
    return stylingPanelInstance;
  }

}
