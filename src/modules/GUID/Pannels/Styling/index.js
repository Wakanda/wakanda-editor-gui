import ColorPicker from './Components/ColorPicker';
import HtmlAttributeInput from './Components/HtmlAttributeInput';
import FontSizePicker from './Components/FontSizePicker';
import FlexboxgridManager from './Components/FlexboxgridManager';
import ResponsiveClassPicker from './Components/ResponsiveClassPicker';
import BoxManager from './Components/BoxManager';
import ClassPicker from './Components/ClassPicker';
import BorderManager from './Components/BorderManager';

class Styling {

  constructor({
    containerId, documentEditor
  }){
    this.documentEditor = documentEditor || IDE.GUID.documentEditor;
    this.container = document.createElement('ul');
    document.getElementById(containerId).appendChild(this.container);

    this.initStyleList();
    // this.stylesheetManager = this.documentEditor.stylesheetManager;
  }

  initStyleList() {

    let _this = this;

    let responsiveClassPicker = new ResponsiveClassPicker({
      documentEditor: this.documentEditor
    });
    responsiveClassPicker.appendToElement(this.container);
    responsiveClassPicker.onValueChange(({newValue, oldValue}) => {
      this.documentEditor.addRemoveClasses({
        classesToAdd: [newValue],
        classesToRemove: [oldValue]
      });
    });

    let idInput = new HtmlAttributeInput({
      documentEditor: this.documentEditor,
      attributeName: 'id',
      placeholder: 'ID'
    });
    idInput.appendToElement(this.container);
    idInput.onValueChange((value) => {
      this.documentEditor.changeElementAttribute({
        attribute: 'id',
        value: value
      });
    });

    this.colorPicker = new ColorPicker({
      documentEditor: this.documentEditor,
      id:'colorPicker',
      placeholder: 'Text color',
      attributeName: 'color'
    });
    this.colorPicker.appendToElement(this.container);
    this.colorPicker.onColorChange((colorHexFormat) => {
      this.documentEditor.changeSelectedElementStyleAttribute({
        attribute: 'color',
        value: '#' + colorHexFormat
      });
    });

    this.bgColorPicker = new ColorPicker({
      documentEditor: this.documentEditor,
      id:'bgColorPicker',
      placeholder: 'Background color',
      attributeName: 'background-color'
    });
    this.bgColorPicker.appendToElement(this.container);
    this.bgColorPicker.onColorChange((colorHexFormat) => {
      this.documentEditor.changeSelectedElementStyleAttribute({
        attribute: 'background-color',
        value: '#' + colorHexFormat
      });
    });

    this.fontSizePicker = new FontSizePicker({
      documentEditor: this.documentEditor
    });
    this.fontSizePicker.appendToElement(this.container);
    this.fontSizePicker.onValueChange((size) => {
      this.documentEditor.changeSelectedElementStyleAttribute({
        attribute: 'font-size',
        value: size
      });
    });

    let flexboxgridManager = new FlexboxgridManager({
      documentEditor: this.documentEditor
    });

    let boxManager = new BoxManager({
      documentEditor: this.documentEditor
    });
    boxManager.appendToElement(this.container);
    let classPicker = new ClassPicker({
      documentEditor: this.documentEditor
    });
    classPicker.appendToElement(this.container);
    classPicker.onClassInputValueChange(({value}) => {
      this.documentEditor.addClass({className: value});
    });

    let borderManager = new BorderManager({
      documentEditor: this.documentEditor
    });
    borderManager.appendToElement(this.container);

    // let saveButton = document.createElement('button');
    // saveButton.textContent = 'Save style';
    // saveButton.addEventListener('click', () => {
    //   console.log("CSS dump\n", _this.stylesheetManager.toString());
    // });
    // this.container.appendChild(saveButton);
  }
}

export default Styling;
