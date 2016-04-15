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

    return this._stylingPanelInstance;
  },

  _addResponsiceClassPicker({portViewService}){
    console.log(portViewService);
  },

  consumedViewPortServiceV1(service){
    let portViewService = service;
    this._addResponsiceClassPicker({portViewService});
  }

}
