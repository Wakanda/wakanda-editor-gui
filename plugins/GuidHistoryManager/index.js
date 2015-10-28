var IDE = window.IDE;

require("./style.css");

export default {

	activate() {
		this.broker = IDE.GUID.documentEditor.mainBroker;
		this.broker.onChange(this.onChange);
	},

	redo() {
		this.broker.redo();
	},

	undo() {
		this.broker.undo();
	},

	onChange(args) {
		let {canUndo, canRedo} = args;

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
