export default class FontSizePicker {
  constructor({documentEditor}) {

    //const
    this.DEFAULT_VALUE = -1;

    this.documentEditor = documentEditor;
    this.htmlElement = document.createElement('select');
    this._initHtmlElement();
    this._cleanPicker();
    this._subscribeToDocumentEditorEvents();

    //FIXME - crappy display fix
    this.htmlElement.style.display = 'block';
  }

  _initHtmlElement() {
    var s;

    s = document.createElement('option');
    s.value = this.DEFAULT_VALUE;
    s.text = 'Font size';
    s.disabled = true;
    this.htmlElement.appendChild(s);

    for (var size = 8; size <= 30; size += 2) {
      s = document.createElement('option');
      s.value = size + 'px';
      s.text = size + 'px';
      this.htmlElement.appendChild(s);
    }
  }

  appendToElement(element) {
    element.appendChild(this.htmlElement);
  }

  onValueChange(callback) {
    let _this = this;
    this.htmlElement.addEventListener('change', function () {
      callback(_this.htmlElement.value)
    });
  }

  _cleanPicker() {
    this.htmlElement.value = this.DEFAULT_VALUE;
  }

  _subscribeToDocumentEditorEvents() {

    this.documentEditor.onElementSelected( ({element}) => {
      if (element) {
        let size = this.documentEditor.getSelectedElementStyleAttribute({attribute: 'font-size'});
        if (size) {
          this.htmlElement.value = size;
        }
        else {
          this._cleanPicker();
        }
      }
      else {
        this._cleanPicker();
      }
    });

    this.documentEditor.onElementDeselected( () => {
      this._cleanPicker();
    });
  }
}
