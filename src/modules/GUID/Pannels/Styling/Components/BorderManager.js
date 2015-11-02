import ColorPicker from './ColorPicker';

class BorderManager {
  constructor({documentEditor}) {
    this.documentEditor = documentEditor;

    this.htmlElement = null;
    this.borderStyles = ['dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset'];
    this.modes = ['all', 'top', 'right', 'bottom', 'left'];
    this.modeButtons = {};
    this.classButtonOn = 'btn-primary';
    this.classButtonOff = 'btn-default';
    this.currentMode = null;

    this._initHtmlElement();
    this._initButtonListeners();
    this._updateUI();
  }

  appendToElement(element) {
    element.appendChild(this.htmlElement);
  }

  _initHtmlElement() {
    let div = this.htmlElement = document.createElement('div');

    let title = document.createElement('h6');
    title.innerHTML = 'Border';
    div.appendChild(title);

    for(let mode of this.modes) {
      let button = document.createElement('a');
      button.setAttribute('role', 'button');
      button.text = mode;
      button.className = 'btn btn-default btn-xs';
      button.isOn = false;

      this.modeButtons[mode] = button;

      div.appendChild(button);
    }

    this.sizeInput = document.createElement('input');
    this.sizeInput.placeholder = 'Border width';
    this.sizeInput.type = 'number';
    this.sizeInput.min = 0;
    div.appendChild(this.sizeInput);

    this.colorPicker = new ColorPicker({
      documentEditor: this.documentEditor,
      id: 'border-color-picker',
      placeholder: 'Border color',
      attributeName: 'border-color'
    });
    this.colorPicker.appendToElement(div);

    this.styleSelect = document.createElement('select');
    let s = document.createElement('option');
    s.value = 'none';
    s.text = 'Border style';
    s.disabled = true;
    this.styleSelect.appendChild(s);
    this.styleSelect.value = 'none';

    for (let s of this.borderStyles) {
      let option = document.createElement('option');
      option.value = s;
      option.text = s;
      this.styleSelect.appendChild(option);
    }
    div.appendChild(this.styleSelect);
  }

  _toggleButton({button, on}) {

    button.isOn = on;
    if (on) {
      button.classList.remove(this.classButtonOff);
      button.classList.add(this.classButtonOn);
    }
    else {
      button.classList.remove(this.classButtonOn);
      button.classList.add(this.classButtonOff);
    }
  }

  _disableAllSingleButtons() {
    for (let m of this.modes) {
      if (m !== 'all') {
        this._toggleButton({
          button: this.modeButtons[m],
          on: false
        });
      }
    }
  }

  _enableMode({mode}) {
    if (mode === 'all') {
      this.currentMode = 'all';
    }
    else {
      if (!this.currentMode || !(typeof this.currentMode === 'object')) { //array in this case
        this.currentMode = [];
      }
      if (this.currentMode.indexOf(mode) === -1) {
        this.currentMode.push(mode);
      }
    }
    this._updateUI();
  }

  _disableMode({mode}) {
    if (mode === 'all') {
      this.currentMode = null;
    }
    else
    {
      if (this.currentMode && (typeof this.currentMode === 'object')) {
        let index = this.currentMode.indexOf(mode);
        if (index !== -1) {
          this.currentMode.splice(index, 1);
        }
      }
    }
    this._updateUI();
  }

  //Enable or disable components of this manager according to current mode
  _updateUI() {
    if (!this.currentMode || this.currentMode.length === 0) {
      this.colorPicker.disable();
      this.sizeInput.disabled = true;
      this.styleSelect.disabled = true;
      this._cleanManager();
    }
    else {
      this.colorPicker.enable();
      this.sizeInput.disabled = false;
      this.styleSelect.disabled = false;
    }
  }

  _cleanManager() {
    this.colorPicker._cleanPicker();
    this.sizeInput.value = null;
    this.styleSelect.value = 'none';
  }

  _initButtonListeners() {

    let allButton = this.modeButtons['all'];
    allButton.addEventListener('click', () => {
      this._disableAllSingleButtons();

      if (allButton.isOn) {
        this._disableMode({mode: 'all'});
      }
      else {
        this._enableMode({mode: 'all'});
      }

      this._toggleButton({
        button: allButton,
        on: !allButton.isOn
      });
      console.log('currentMode:', this.currentMode);
    });

    for (let mode of this.modes) {
      if (mode !== 'all') {
        let button = this.modeButtons[mode];

        button.addEventListener('click', () => {
          this._toggleButton({
            button: allButton,
            on: false
          });

          if (button.isOn) {
            this._disableMode({mode});
          }
          else {
            this._enableMode({mode});
          }

          this._toggleButton({
            button,
            on: !button.isOn
          });
          console.log('currentMode:', this.currentMode);
        });
      }
    }
  }
}

export default BorderManager;
