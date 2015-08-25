var Module = {
	activate(loaded) {
		//Core Plugin Editor
		IDE.GUID = {};

		require.ensure(["./DocumentEditor", "./UserInterface", "./Pannels/Outline"], function(require) {
			var Editor = require("./DocumentEditor");
			var UserInterface = require("./UserInterface");
			var Outline = require("./Pannels/Outline");
			let path = IDE.qParams.path;
			console.log(IDE.qParams.path);
			let strWebFolder = 'WebFolder';
			let i = path.indexOf(strWebFolder);
			path = path.substring(i + strWebFolder.length);
			//TODO mongoose.exe
			path = `http://localhost:9090${path}`;

			IDE.GUID.documentEditor = new Editor({
				path
			});
			IDE.GUID.userInterface = new UserInterface(IDE.GUID.documentEditor);
			IDE.GUID.documentEditorBroker = IDE.GUID.documentEditor.broker;

			//undoManagement
			let plugin = 'GuidHistoryManager',
				type = 'button';
			let items = [{
				action: 'undo',
				name: 'undo',
				plugin,
				type
			}, {
				action: 'redo',
				name: 'redo',
				plugin,
				type
			}];
			IDE.toolbar.addItems(items);
			// console.log(items);

			//debug infos
			IDE.GUID.documentEditor.onElementSelected(function(arg) {
				console.log(arg.element);
			});

			IDE.GUID.outline = new Outline({containerId: 'outline'});

			// IDE.GUID.documentEditor.onDocumentSizeChange(function(a) {
			// 	console.log(a);
			// });

			//TODO remove this
			let tree = document.getElementById('tree');
			tree.hidden = true;
			console.log('explorer');

			loaded();
		});

	}
}

export default Module;
