var IDE = window.IDE;

// TODO: use depInjection
// TODO: use piping events

import Outline from './Outline';

// TODO:Daba put css here

export default {

  activate() {
    let GUID = IDE.GUID;
    let pannelsManager = IDE.panels;

    let panelContainer = pannelsManager.addPanel({panelName: 'Outline'});

    let outlinePanelInstance = new Outline({
      panelContainer,
      documentEditor: GUID.documentEditor,
      userInterface: GUID.userInterface
    });

    return outlinePanelInstance;
  }

}
