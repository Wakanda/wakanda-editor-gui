class Styling {
  constructor({
    containerId, documentEditor
  }){
    this.documentEditor = documentEditor || IDE.GUID.documentEditor;
    this.container = document.createElement('ul');
    document.getElementById(containerId).appendChild(this.container);

    this.initStyleList();
    this.subscribeToDocumentEditorEvents();

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
    let inputColor = document.createElement('input');
    inputColor.className = 'color';

    inputColor.addEventListener('change', (e) => {
      _this.documentEditor.changeSelectedElementAttribute({attribute: 'style', value:'color: #' + inputColor.value});
    });

    liColor.appendChild(inputColor);
    this.container.appendChild(liColor);

    let saveButton = document.createElement('button');
    saveButton.textContent = 'Save style';
    saveButton.addEventListener('click', () => {
      console.log('style saving');
      this.stylesheetToString(_this.documentEditor.iframeStyleSheet);
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

  stylesheetToString(stylesheet) {

    var cssFileContent = '';

    for (var i = 0; i < stylesheet.rules.length; i++) {
      let rule = stylesheet.rules[i];
      cssFileContent += rule.cssText + "\n";
    }

    console.log('css file content', cssFileContent);
  }
}

export default Styling;
