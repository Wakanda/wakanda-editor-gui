
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
        if(this._isInputOnFocus()){
          return;
        }
  			this._documentEditor.deselectElement();
  		});

  		//Remove the selected element if any
  		this._keyboardJS.bind('del', () => {
        if(this._isInputOnFocus()){
          return;
        }
  			let element = this._documentEditor.selectedElement;
  			if (element) {
  				let tagName = element.tagName.toLowerCase();
  				if (tagName !== 'body' && tagName !== 'html') {
  					this._documentEditor.removeElement({element});
  				}
  			}
  		});
  	}
    ,

    // NOTE: not sure if this is the most efficient way to do it
    _isInputOnFocus(){
      let isInput = document.activeElement.tagName.toLowerCase() === 'input';
      if(isInput){
        console.warn('key pressed out of context');
      }
      return isInput;
    }

}
