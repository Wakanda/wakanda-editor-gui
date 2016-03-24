var IDE = window.IDE;

require("./style.css");

export default {

  activate({coreModules}) {
    this._documentEditor = coreModules.GUID.documentEditor;
  },

  save() {
    this._documentEditor.save().then((saved) => {
      alert('file saved');
    })
  }

}
