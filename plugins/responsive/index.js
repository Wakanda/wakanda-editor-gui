import ResponsiveSelector from "./ResponsiveSelector";

var IDE = window.IDE;

export default {

  activate() {
    let GUID = IDE.GUID;
    let pannelsManager = IDE.panels;
    let documentEditor = GUID.documentEditor;

    let panelContainer = pannelsManager.responsiveButtonsList;

    let responsivePanelInstance = new ResponsiveSelector({
      documentEditor,
      container: panelContainer
    });
    // TODO: manage the comunication between plugins in the plugins manager (services in atom )
    return responsivePanelInstance;
  }

}
