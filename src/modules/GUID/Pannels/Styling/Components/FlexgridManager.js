class FlexgridManager {

  constructor({
    documentEditor
  }) {
    this.documentEditor = documentEditor;

    //FIXME: has to find a better way to do that
    this.FLEXGRID_URL = 'http://localhost:9090/flexgrid.css';
    this.MODERNIZR_URL = 'http://localhost:9090/modernizr.js';

    this._injectLib({
      flexgridUrl: this.FLEXGRID_URL,
      modernizrUrl: this.MODERNIZR_URL
    });
  }

  _injectLib({flexgridUrl, modernizrUrl}) {

    let linkTag = document.createElement('link');
    linkTag.rel = 'stylesheet';
    linkTag.href = flexgridUrl;

    let srcTag = document.createElement('script');
    srcTag.type = 'text/javascript';
    srcTag.src = modernizrUrl;

    let b = this.documentEditor.document.body;
    b.appendChild(linkTag);
    b.appendChild(srcTag);
  }
}

export default FlexgridManager;
