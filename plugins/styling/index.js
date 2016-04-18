import Styling from './Styling';
import ResponsiveClassPicker from './Styling/ResponsiveClassPicker';

// TODO:Daba put css here

export default {
  activate({coreModules}) {
    let GUID = coreModules.GUID;
    let pannelsManager = coreModules.panels;
    this._documentEditor = GUID.documentEditor;

    let panelContainer = pannelsManager.addPanel({panelName: 'Styling'});

    this._stylingPanelInstance = new Styling({
      panelContainer,
      documentEditor: GUID.documentEditor
    });

    this._panelContainer = panelContainer;

    this._responsiveClassPicker = null; // instantiation whene injecting service

    return this._stylingPanelInstance;
  },

  _addResponsiceClassPicker({portViewService}){
    this._responsiveClassPicker = new ResponsiveClassPicker({
      documentEditor: this._documentEditor,
      portViewService : portViewService
    });
    this._responsiveClassPicker.insertFirst(this._stylingPanelInstance.container);
  },

  consumedViewPortServiceV1(service){
    let portViewService = service;
    this._addResponsiceClassPicker({portViewService});
  }

}
