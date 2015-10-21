class ColorPicker {

  constructor({documentEditor, id, placeholder}) {
    this.documentEditor = documentEditor;

    this.htmlElement = document.createElement('input');
    this.htmlElement.id = id;
    this.jsColorPicker = new jscolor.color(this.htmlElement);
    this.htmlElement.placeholder = placeholder;

    this._subscribeToDocumentEditorEvents();
  }

  get colorValueHexFormat() {
    return this.htmlElement.value;
  }

  appendToElement(element) {
    element.appendChild(this.htmlElement);
  }

  onColorChange(callback) {
    this.htmlElement.addEventListener('change', () => {
      callback(this.colorValueHexFormat);
    });
  }

  _rgbStringToRgbObj(rgbString) {
    var arr = rgbString.replace(/[^\d,]/g, '').split(',');
    for (var i = 0; i < 3; i++) {
      arr[i] = parseInt(arr[i]) / 255;
    }
    return {r: arr[0], g: arr[1], b: arr[2]};
  }

  _cleanPicker() {
    this.jsColorPicker.fromRGB(1, 1, 1);
    this.htmlElement.value = null;
  }

  _subscribeToDocumentEditorEvents() {

    //TODO: BUG, <body> fires onElementSelected on UI when selected but not here, can not find out why...
    this.documentEditor.onElementSelected( ({element: selectedElement}) => {
      this.selectedElement = selectedElement;

      if (selectedElement) {
        let color = this.documentEditor.getSelectedElementStyleAttribute({attribute:'color'});
        if (color) {
          let {r, g, b} = this._rgbStringToRgbObj(color);
          this.jsColorPicker.fromRGB(r,g,b);
        }
        else {
          this._cleanPicker();
        }
      }
    });

    this.documentEditor.onElementDeselected(() => {
      this.selectedElement = null;
      this._cleanPicker();
    });

    this.documentEditor.onElementStyleAttributeChange(({element, attribute, oldValue, value}) => {

      if (element === this.selectedElement) {
        let color = this.documentEditor.getSelectedElementStyleAttribute({attribute:'color'});
        if (color) {
          let {r, g, b} = this._rgbStringToRgbObj(color);
          this.jsColorPicker.fromRGB(r,g,b);
        }
        else {
          this._cleanPicker();
        }
      }
    });
  }
}

export default ColorPicker;
