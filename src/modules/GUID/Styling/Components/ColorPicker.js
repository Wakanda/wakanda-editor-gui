class ColorPicker {

  constructor({documentEditor, id, placeholder}) {
    this.documentEditor = documentEditor;

    this.htmlElement = document.createElement('input');
    this.htmlElement.id = id;
    this.htmlElement.className = 'color';
    this.htmlElement.placeholder = placeholder;
  }

  get colorValueHexFormat() {
    return this.htmlElement.value;
  }

  appendToElement(element) {
    element.appendChild(this.htmlElement);

    //Subscribe to events only when element has been bound to DOM
    this._subscribeToDocumentEditorEvents();
  }

  onColorChange(callback) {
    this.htmlElement.addEventListener('change', callback);
  }

  _rgbStringToRgbObj(rgbString) {
    var arr = rgbString.replace(/[^\d,]/g, '').split(',');
    for (var i = 0; i < 3; i++) {
      arr[i] = parseInt(arr[i]) / 255;
    }
    return {r: arr[0], g: arr[1], b: arr[2]};
  }

  _subscribeToDocumentEditorEvents() {
    let colorPicker = document.getElementById(this.htmlElement.id); //Need to do that to access color() function that is bound later

    this.documentEditor.onElementSelected( ({element: selectedElement}) => {

      if (selectedElement) {
        if (selectedElement.style.color) {
          console.log('color picked', selectedElement.style.color);
          let {r, g, b} = this._rgbStringToRgbObj(selectedElement.style.color);
          colorPicker.color.fromRGB(r, g, b);
        }
        else {
          colorPicker.color.fromRGB(1, 1, 1);
          this.htmlElement.value = null;
        }
      }
    });
  }
}

export default ColorPicker;
