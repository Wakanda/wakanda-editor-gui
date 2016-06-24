import AttributesPanel from './AttributesPanel';

export default {

  activate({coreModules}) {// dependencies as argumetns (injection on activation)
    let GUID = coreModules.GUID;
    let pannelsManager = coreModules.panels;

    let panelContainer = pannelsManager.addPanel({panelName: 'Attributes'});

    let attributesPanelInstance = new AttributesPanel({
      documentEditor: GUID.documentEditor,
      panelContainer
    });

    return attributesPanelInstance;
  }

  // TODO: use disposable nand compositeDisposable to implement deactive 

}
