
// TODO:Daba put css here

export default {

  activate({coreModules}) {
    let GUID = coreModules.GUID;

    this._documentEditor = GUID.documentEditor;

    this._keyboardJS = require('../../lib/keyboardjs');
    this._initKeyboardWatchers();

  },

	_initKeyboardWatchers() {

  		//Deselect the selected element if any
  		this._keyboardJS.bind('esc', () => {
  			this._documentEditor.deselectElement();
  		});

  		//Remove the selected element if any
  		this._keyboardJS.bind('del', () => {
  			let element = this._documentEditor.selectedElement;
  			if (element) {
  				let tagName = element.tagName.toLowerCase();
  				if (tagName !== 'body' && tagName !== 'html') {
  					this._documentEditor.removeElement({element});
  				}
  			}
  		});
  	}
}
