class Styling {
  constructor({
    containerId, documentEditor
  }){
    this.documentEditor = documentEditor || IDE.GUID.documentEditor;
    this.container = document.createElement('ul');
    document.getElementById(containerId).appendChild(this.container);

    this.initStyleList();
    this.subscribeToDocumentEditorEvents();
    this.stylesheetManager = this.documentEditor.stylesheetManager;

    console.log('Styling pannel loaded');
  }

  initStyleList() {

    let _this = this;

    let liId = document.createElement('li');
    this.inputId = document.createElement('input');
    this.inputId.placeholder = 'ID';
    liId.appendChild(this.inputId);
    this.container.appendChild(liId);

    let liColor = document.createElement('li');
    this.inputColor = document.createElement('input');
    this.inputColor.id = 'colorPicker';
    this.inputColor.className = 'color';
    this.inputColor.placeholder = 'Color';
    this.inputColor.addEventListener('change', () => {
      // _this.documentEditor.changeSelectedElementAttribute({attribute: 'style', value:'color: #' + _this.inputColor.value});
      _this.documentEditor.changeSelectedElementColor({color: '#' + _this.inputColor.value});
    });

    liColor.appendChild(this.inputColor);
    this.container.appendChild(liColor);

    let saveButton = document.createElement('button');
    saveButton.textContent = 'Save style';
    saveButton.addEventListener('click', () => {
      console.log("CSS dump\n", _this.stylesheetManager.toString());
    });
    this.container.appendChild(saveButton);
  }

  rgbStringToRgbObj(rgbString) {
    var arr = rgbString.replace(/[^\d,]/g, '').split(',');
    for (var i = 0; i < 3; i++) {
      arr[i] = parseInt(arr[i]) / 255;
    }
    return {r: arr[0], g: arr[1], b: arr[2]};
  }

  subscribeToDocumentEditorEvents() {
    let _this = this;

    this.documentEditor.onElementSelected( ({element}) => {
      if (element) {
        let id = element.getAttribute('id');
        this.inputId.value = id;

        //Update color picker to set the selected element color to it
        let colorPicker = document.getElementById('colorPicker');
        if (element.style.color) {
          console.log('color picked', element.style.color);
          let {r, g, b} = this.rgbStringToRgbObj(element.style.color);
          colorPicker.color.fromRGB(r, g, b);
        }
        else {
          colorPicker.color.fromRGB(1, 1, 1);
          this.inputColor.value = null;
        }
      }
    });
  }
}

export default Styling;
