class ClassPicker {
  constructor({documentEditor}) {
    this.documentEditor = documentEditor;

    this.htmlElement = null;
    this.addInput = null;
    this.classList = null;
    this.selectedElement = null;

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
    this.classList.className = 'panelClassList';
    div.appendChild(this.classList);
  }

  _classToElementList({className})  {
    let li = document.createElement('li');
    let classDiv = document.createElement('div');
    let textSpan = document.createElement('span');
    textSpan.innerHTML = className;
    li.appendChild(classDiv);

    let deleteSpan = document.createElement('span');
    deleteSpan.innerHTML = '&times;';
    deleteSpan.className = 'elementClassDelete';
    deleteSpan.addEventListener('click', () => {
      console.log('had to delete class ' + className + ' on element');
      this._removeClassNameOnSelectedElement({className});
      this.classList.removeChild(li);
    });
    classDiv.appendChild(deleteSpan);
    classDiv.appendChild(textSpan);

    return li;
  }

  onClassInputValueChange(callback) {
    this.addInput.addEventListener('change', () => {
      callback({value: this.addInput.value});
      this.addInput.value = null;
    })
  }

  _removeClassNameOnSelectedElement({className}) {
    this.documentEditor.removeClass({className});
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

  _reinitClassList({element}) {
    this._emptyClassList();
    for (let c of element.classList) {
      this.classList.appendChild(this._classToElementList({className: c}));
    }
  }

  _subscribeToDocumentEditorEvents() {
    this.documentEditor.onElementSelected(({element}) => {
      this.selectedElement = element;
      this._reinitClassList({element});
    });

    this.documentEditor.onElementClassadd(({element}) => {
      if (element === this.selectedElement) {
        this._reinitClassList({element});
      }
    });
  }
}

export default ClassPicker;
