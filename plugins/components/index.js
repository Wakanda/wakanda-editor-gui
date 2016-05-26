import ComponentsPanel from './ComponentsPanel';
import Component from './Component';

export default {

  activate({coreModules}) {
    let GUID = coreModules.GUID;
    let pannelsManager = coreModules.panels;

    let panelContainer = pannelsManager.addPanel({panelName: 'NewComponents'});

    let componentsPanel = new ComponentsPanel({
      panelContainer,
      documentEditor: GUID.documentEditor,
      userInterface: GUID.userInterface
    });

    this._componentsPanel = componentsPanel;

    return componentsPanel;
  },

  componentsGroupServiceV1(){
    // NOTE: maybe create a class for managing components Groups
    // including binding components ... (ex strategy DP)
    let componentsPanel = this._componentsPanel;
    return {
      addGroup: componentsPanel.addGroup.bind(componentsPanel),
      createComponentsFromJson: (componentsAsJson) => {
        return componentsAsJson.map((compoJson)=>{
         return new Component({
           manifest: compoJson.manifest,
            template: compoJson.template
          });
        });
      }
    };
  }

}
