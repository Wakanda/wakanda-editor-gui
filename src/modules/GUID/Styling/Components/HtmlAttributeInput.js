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

  _subscribeToDocumentEditorEvents() {
    this.documentEditor.onElementSelected( ({element: selectedElement}) => {
      if (selectedElement) {
        this.htmlElement.value = selectedElement.getAttribute(this.attributeName);;
      }
    });

    this.documentEditor.onElementDeselected(() => {
      this.htmlElement.value = null;
    });
  }
}

export default HtmlAttributeInput;
