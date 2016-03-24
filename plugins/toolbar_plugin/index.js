var IDE = window.IDE;

require("./style.css");

export default {

  activate({coreModules}) {
    this._documentEditor = coreModules.GUID.documentEditor;
    this._toolbar = coreModules.toolbar;
    this._uiStateIsEdit = this._documentEditor.setUIToEdit(true);
    this._updatePrevEditIcon();
  },

  save() {
    this._documentEditor.save().then((saved) => {
      alert('file saved');
    })
  },

  prevEdit() {
    this._uiStateIsEdit = this._documentEditor.setUIToEdit(! this._uiStateIsEdit);
    this._updatePrevEditIcon();
  },

  _updatePrevEditIcon() {
    let itemName = "prevEdit";
    let [defClass, prevClass, editClass] = ["prevEdit", "prevEdit-prev", "prevEdit-edit"];
    this._toolbar.removeClassToItem(itemName, defClass);
    if(this._uiStateIsEdit){
      this._toolbar.removeClassToItem(itemName, prevClass);
      this._toolbar.addClassToItem(itemName, editClass);
    }else{
      this._toolbar.removeClassToItem(itemName, editClass);
      this._toolbar.addClassToItem(itemName, prevClass);
    }
  }

}
