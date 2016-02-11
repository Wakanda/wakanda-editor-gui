var IDE = window.IDE;

require("./style.css");

export default {

  activate() {
      this.broker = IDE.GUID.documentEditor.broker;
      this.broker.onChange(this.onChange);
    },

    redo() {
      this.broker.redo();
    },

    undo() {
      this.broker.undo();
    },

    save() {
      IDE.GUID.documentEditor.save().then((saved) => {
        alert('file saved');
      })
    },

    onChange(args) {
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
    }

}
