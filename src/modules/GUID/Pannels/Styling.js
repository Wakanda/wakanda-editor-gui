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
    li.textContent = 'Red';
    li.addEventListener('click', (e) => {
      _this.documentEditor.changeSelectedElementAttribute({attribute: 'style', value: 'color:red;'});
    });

    this.container.appendChild(li);
  }
}

export default Styling;
