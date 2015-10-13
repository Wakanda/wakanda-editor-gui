class HtmlAttributeInput {
  constructor ({documentEditor, attributeName, placeholder}) {
    this.documentEditor = documentEditor;
    this.attributeName = attributeName;

    this.htmlElement = document.createElement('input');
    this.htmlElement.placeholder = placeholder;

    this._subscribeToDocumentEditorEvents();
  }

  appendToElement(element) {
    element.appendChild(this.htmlElement);
  }

  onValueChange(callBack) {
    let _this =  this;
    this.htmlElement.addEventListener('change', function () {
      callBack(_this.htmlElement.value);
    });
  }

  _subscribeToDocumentEditorEvents() {
    this.documentEditor.onElementSelected( ({element: selectedElement}) => {
      if (selectedElement) {
        this.htmlElement.value = selectedElement.getAttribute(this.attributeName);
      }
    });

    this.documentEditor.onElementAttributeChange(({element, attribute, oldValue, value}) => {
      if (attribute === this.attributeName) {
        this.htmlElement.value = value;
      }
    });
  }
}

export default HtmlAttributeInput;
