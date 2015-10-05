import ColorPicker from '../Styling/Components/ColorPicker';

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

    this.colorPicker = new ColorPicker({
      documentEditor: this.documentEditor,
      id:'colorPicker',
      placeholder: 'Text color'
    });
    this.colorPicker.appendToElement(this.container);
    this.colorPicker.onColorChange(() => {
      _this.documentEditor.changeSelectedElementColor({
        color: '#' + _this.colorPicker.colorValueHexFormat
      });
    });

    let saveButton = document.createElement('button');
    saveButton.textContent = 'Save style';
    saveButton.addEventListener('click', () => {
      console.log("CSS dump\n", _this.stylesheetManager.toString());
    });
    this.container.appendChild(saveButton);
  }

  subscribeToDocumentEditorEvents() {
    let _this = this;

    this.documentEditor.onElementSelected( ({element}) => {
      if (element) {
        let id = element.getAttribute('id');
        this.inputId.value = id;
      }
    });
  }
}

export default Styling;
