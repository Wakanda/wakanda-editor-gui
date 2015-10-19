class ClassPicker {
  constructor({documentEditor}) {
    this.documentEditor = documentEditor;

    this.htmlElement = null;
    this.addInput = null;
    this.classList = null;

    this._initHtmlElement();
    this._subscribeToDocumentEditorEvents();
  }

  _initHtmlElement() {
    let div = document.createElement('div');
    this.htmlElement = div;

    let title = document.createElement('h6');
    title.innerHTML = 'Classes';
    div.appendChild(title);

    this.addInput = document.createElement('input');
    div.appendChild(this.addInput);

    this.classList = document.createElement('ul');
    div.appendChild(this.classList);
  }

  _classToElementList({className})  {
    let li = document.createElement('li');
    let classDiv = document.createElement('div');
    classDiv.innerHTML = className;
    li.appendChild(classDiv);

    return li;
  }

  _emptyClassList() {
    while (this.classList.firstChild) {
      this.classList.removeChild(this.classList.firstChild);
    }
  }

  appendToElement(element) {
    if (this.htmlElement) {
      element.appendChild(this.htmlElement);
    }
  }

  _subscribeToDocumentEditorEvents() {
    this.documentEditor.onElementSelected(({element}) => {
      this._emptyClassList();
      for (let c of element.classList) {
        this.classList.appendChild(this._classToElementList({className: c}));
      }
    });
  }
}

export default ClassPicker;
