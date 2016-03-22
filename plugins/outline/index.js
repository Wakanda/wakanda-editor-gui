// TODO: use piping events (or observables)

import Outline from './Outline';

// TODO:Daba put css here

export default {

  activate({coreModules}) {
    let GUID = coreModules.GUID;
    let pannelsManager = coreModules.panels;

    let panelContainer = pannelsManager.addPanel({panelName: 'Outline'});

    let outlinePanelInstance = new Outline({
      panelContainer,
      documentEditor: GUID.documentEditor,
      userInterface: GUID.userInterface
    });

    return outlinePanelInstance;
  }

}
