import ComponentGroup from './ComponentsGroup';

class ComponentsPanel {
  constructor({documentEditor, containerId, panelContainer}) {
    this._panelContainer = panelContainer;
    this.documentEditor = documentEditor;

    this._componentsGroups = {};

  }

  addGroup({groupName, components}){
    if(! this._componentsGroups[groupName]){
      this._componentsGroups[groupName] = new ComponentGroup({groupName});
      this._panelContainer
        .appendChild(this._componentsGroups[groupName]
          .container);
    }
    this._componentsGroups[groupName]
      .addComponents({components});
    return this._componentsGroups[groupName];
  }

}

export default ComponentsPanel;
