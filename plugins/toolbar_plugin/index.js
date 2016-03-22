var IDE = window.IDE;

require("./style.css");

export default {

  activate({coreModules}) {
    this._documentEditor = coreModules.GUID.documentEditor;
    this._toolbar = coreModules.toolbar;
    this._broker = this._documentEditor.broker;
    this._broker.onChange(this._onChange.bind(this));
    this._uiStateIsEdit = this._documentEditor.setUIToEdit(true);
    this._updatePrevEditIcon();
  },

  redo() {
    this._broker.redo();
  },

  undo() {
    this._broker.undo();
  },

  save() {
    this._documentEditor.save().then((saved) => {
      alert('file saved');
    })
  },

  _onChange(args) {
    let { canUndo, canRedo } = args;

    if (canUndo) {
      this._toolbar.swapItemClass("undo", "undo", "undo-enabled");
    } else {
      this._toolbar.swapItemClass("undo", "undo-enabled", "undo");
    }
    if (canRedo) {
      this._toolbar.swapItemClass("redo", "redo", "redo-enabled");
    } else {
      this._toolbar.swapItemClass("redo", "redo-enabled", "redo");
    }
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
