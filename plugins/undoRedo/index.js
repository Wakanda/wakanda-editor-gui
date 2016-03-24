var IDE = window.IDE;

require("./style.css");

export default {

  activate({coreModules}) {
    this._documentEditor = coreModules.GUID.documentEditor;
    this._toolbar = coreModules.toolbar;
    this._broker = this._documentEditor.broker;
    this._broker.onChange(this._onChange.bind(this));
  },

  redo() {
    this._broker.redo();
  },

  undo() {
    this._broker.undo();
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
  }

}
