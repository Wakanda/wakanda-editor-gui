class FlexboxgridManager {

    constructor({
      documentEditor
    }) {
      this.documentEditor = documentEditor;

      //FIXME: has to find a better way to do that
      this.FLEXBOXGRID_URL = '../lib/flexboxgrid.min.css';

      this._injectLib({
        flexboxgridUrl: this.FLEXBOXGRID_URL
      });
    }

    _injectLib({flexboxgridUrl}) {

      let linkTag = document.createElement('link');
      linkTag.rel = 'stylesheet';
      linkTag.href = flexboxgridUrl;

      let h = this.documentEditor.document.head;
      h.appendChild(linkTag);
    }
}

export default FlexboxgridManager;
