import Styling from './Styling';

// TODO:Daba put css here

export default {
  activate({coreModules}) {
    let GUID = coreModules.GUID;
    let pannelsManager = coreModules.panels;

    let panelContainer = pannelsManager.addPanel({panelName: 'Styling'});

    this._stylingPanelInstance = new Styling({
      panelContainer,
      documentEditor: GUID.documentEditor
    });
    // TODO: manage the comunication between plugins in the plugins manager (services in atom )
    return this._stylingPanelInstance;
  },

  consumedViewPortServiceV1(service){
    this._stylingPanelInstance.portViews = service.portViews;
    // this._stylingPanelInstance.setChangeViewFunction(service.setPortView);
  }

}
