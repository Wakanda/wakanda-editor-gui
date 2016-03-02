var IDE = window.IDE;

require("./style.css");

export default {

  activate() {
      this._documentEditor = IDE.GUID.documentEditor;
      this._broker = this._documentEditor.broker;
      this._uiStateIsEdit = this._documentEditor.setUIToEdit(true);
      this._updatePrevEditIcon();
      this._broker.onChange(this._onChange);
    },

    redo() {
      this._broker.redo();
    },

    undo() {
      this._broker.undo();
    },

    save() {
      IDE.GUID.documentEditor.save().then((saved) => {
        alert('file saved');
      })
    },

    _onChange(args) {
      let { canUndo, canRedo } = args;

      if (canUndo) {
        IDE.toolbar.swapItemClass("undo", "undo", "undo-enabled");
      } else {
        IDE.toolbar.swapItemClass("undo", "undo-enabled", "undo");
      }
      if (canRedo) {
        IDE.toolbar.swapItemClass("redo", "redo", "redo-enabled");
      } else {
        IDE.toolbar.swapItemClass("redo", "redo-enabled", "redo");
      }
    },

    prevEdit() {
      this._uiStateIsEdit = this._documentEditor.setUIToEdit(! this._uiStateIsEdit);
      this._updatePrevEditIcon();
    },

    _updatePrevEditIcon() {
      let itemName = "prevEdit";
      let [defClass, prevClass, editClass] = ["prevEdit", "prevEdit-prev", "prevEdit-edit"];
      IDE.toolbar.removeClassToItem(itemName, defClass);
      if(this._uiStateIsEdit){
        IDE.toolbar.removeClassToItem(itemName, prevClass);
        IDE.toolbar.addClassToItem(itemName, editClass);
      }else{
        IDE.toolbar.removeClassToItem(itemName, editClass);
        IDE.toolbar.addClassToItem(itemName, prevClass);
      }
    }

}
