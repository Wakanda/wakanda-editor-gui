var IDE = window.IDE;

import {HttpClient} from "../../lib/aurelia-http-client";

require("./style.css");

export default {

	activate() {
		let script
				= this.angularScriptTag
				= document.createElement('script');
		script.src = "http://ajax.googleapis.com/ajax/libs/angularjs/1.3.14/angular.min.js";

		this.script = IDE.GUID.documentEditor.document.getElementById('wakanda-script');
		this.prevIframe = document.createElement('iframe');

		// TODO: remove this
		this.prevIframe.setAttribute('style', 'width: 100%; height: 600;');
	},

	editScript() {
		let scriptEditorDiv = document.createElement('div');
		let editor = ace.edit(scriptEditorDiv);
		editor.setTheme("ace/theme/monokai");
    editor.getSession().setMode("ace/mode/javascript");
		editor.setValue(this.script.innerText);
		editor.setOptions({
	    maxLines: Infinity
		});
		editor.session.setNewLineMode("windows");

		let _this = this;

		bootbox.dialog({
		  message: scriptEditorDiv,
		  title: "Edit Script",
		  buttons: {
		    success: {
		      label: "Save changes",
		      className: "btn-success",
		      callback: () => {
						let content = editor.getSession().getValue();
						_this.script.innerHTML = content;
		      }
		    }
		  }
		});

	},
	preview(){

		let html = IDE.GUID.documentEditor.document.children[0];
		let cloneHtml = html.cloneNode(true);

		let head = cloneHtml.querySelector('head');
		head.appendChild(this.angularScriptTag);

		let fileContent = '<html>' + cloneHtml.innerHTML + '</html>';

		let client = new HttpClient().configure(x => {
	    x.withHeader('Content-Type', 'application/json');
	  });
		client.post('http://localhost:3000/file', {fileName: 'tmp.html', fileContent})
		.then(({response})=>{

			this.prevIframe.src = response;
			let iframePrev = this.prevIframe;

			bootbox.dialog({
				message: iframePrev,
				title: "Preview",
			});
		});

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
