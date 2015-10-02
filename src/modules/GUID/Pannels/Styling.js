class Styling {
  constructor({
    containerId, documentEditor
  }){
    this.documentEditor = documentEditor || IDE.GUID.documentEditor;
    this.container = document.createElement('ul');
    document.getElementById(containerId).appendChild(this.container);

    this.initStyleList();

    console.log('Styling pannel loaded');
  }

  initStyleList() {

    let _this = this;
    let li = document.createElement('li');
    let input = document.createElement('input');
    input.className = 'color';

    input.addEventListener('change', (e) => {
      _this.documentEditor.changeSelectedElementAttribute({attribute: 'style', value:'color: #' + input.value});
    });

    li.appendChild(input);
    this.container.appendChild(li);

    let saveButton = document.createElement('button');
    saveButton.textContent = 'Save style';
    saveButton.addEventListener('click', () => {
      console.log('style saving');
      this.stylesheetToString(_this.documentEditor.iframeStyleSheet);
    });
    this.container.appendChild(saveButton);
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
