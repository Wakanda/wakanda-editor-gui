import ComponentGroup from './ComponentsGroup';

class ComponentsPanel {
  constructor({documentEditor, containerId, panelContainer}) {
    this._panelContainer = panelContainer;
    this._documentEditor = documentEditor;

    this._componentsGroups = {};

  }

  addGroup({groupName, components}){
    if(! this._componentsGroups[groupName]){
      // we pass the document editor because we do not have automatic dependencies injection (maybe in the future)
      this._componentsGroups[groupName] = new ComponentGroup({
        groupName,
        documentEditor: this._documentEditor
      });
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
