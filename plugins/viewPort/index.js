import ResponsiveSelector from "./ResponsiveSelector";

export default {

  activate({coreModules}) {
    let GUID = coreModules.GUID;
    let pannelsManager = coreModules.panels;
    let documentEditor = GUID.documentEditor;

    let panelContainer = pannelsManager.responsiveButtonsList;

    this._responsivePanelInstance = new ResponsiveSelector({
      documentEditor,
      container: panelContainer
    });
    // TODO: manage the comunication between plugins in the plugins manager (services in atom )
    return this._responsivePanelInstance;
  },
  // NOTE: without versioning
  provideServiceV1() {
    return this._responsivePanelInstance.viewPortService;
  }

}
