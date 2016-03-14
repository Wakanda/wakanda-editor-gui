import AttributesPanel from './AttributesPanel';

var IDE = window.IDE;

export default {

  activate() {
    let GUID = IDE.GUID;
    let pannelsManager = IDE.panels;

    let panelContainer = pannelsManager.addPanel({panelName: 'Attributes'});

    let attributesPanelInstance = new AttributesPanel({
      documentEditor: GUID.documentEditor,
      panelContainer
    });

    return attributesPanelInstance;
  }

}
