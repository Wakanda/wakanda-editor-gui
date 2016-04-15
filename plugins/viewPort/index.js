import ResponsiveSelector from "./ResponsiveSelector";
import PortViewService from "./PortViewService";

export default {

  activate({coreModules}) {
    let GUID = coreModules.GUID;
    let pannelsManager = coreModules.panels;
    let documentEditor = GUID.documentEditor;

    let panelContainer = pannelsManager.responsiveButtonsList;

    this._portViewlInstance = new ResponsiveSelector({
      documentEditor,
      container: panelContainer
    });

    this._portViewsService = null;

    return this._portViewlInstance;
  },

  provideServiceV1() {
    if(! this._portViewsService){
      this._portViewsService = new PortViewService({
        responsiveSelector: this._portViewlInstance
      });
    }
    return this._portViewsService;
  }

}
