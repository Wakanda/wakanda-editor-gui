import Angular from './Angular';

export default {

  activate({coreModules}) {// dependencies as argumetns (injection on activation)
    let GUID = coreModules.GUID;
    let pannelsManager = coreModules.panels;

    let panelContainer = pannelsManager.addPanel({panelName: 'Angular'});

    // TODO: load angular
    // angular panel
    let angularPanelInstance = new Angular({
    	documentEditor: GUID.documentEditor,
    	panelContainer,
    	userInterface: GUID.userInterface
    });

    return angularPanelInstance;
  }


}
