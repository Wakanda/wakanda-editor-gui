import helpers from './helpers';
let noop = ()=>{};


class AttributesRenderer{
  constructor({container}){
    this.container = container;
    this.container.appendChild(helpers.createTitle({
      text: 'Attributes'
    }));
    this._ul = document.createElement('ul');
    this.container.appendChild(this._ul);

    let {attributeInput, valueInput} = this.initAddAttribute();
    this._addAttributeInput = attributeInput;
    this._addValueInput = valueInput;
  }
  get ul(){
    return this._ul;
  }
  appendElement({element}){
    this.container.appendChild(element);
  }
  initAddAttribute(){
    let addTitle = helpers.createTitle({text: 'Add Attributes', h: 'h4'});
    let attributeInput = document.createElement('input'),
        valueInput = document.createElement('input');

    attributeInput.type = valueInput.type = 'text';
    attributeInput.style.width = valueInput.style.width = '100px';

    let li = document.createElement('li');

    li.appendChild(attributeInput);
    li.appendChild(valueInput);

    this.container.appendChild(addTitle);
    this.container.appendChild(li);

    let addButton = document.createElement('button');
    addButton.onclick = ()=>{
      this.onClickAdd({
        attributeName: attributeInput.value,
        value: valueInput.value
      });
    };
    addButton.innerText = 'Add';

    li.appendChild(addButton);

    return {attributeInput, valueInput};
  }
  clearAttributesList(){
    this.ul.innerHTML = "";
    this._attributeToInput = new Map();
  }
  fillAttribute({attributeName, value}){
    if(this._attributeToInput.has(attributeName)){
      let input = this._attributeToInput.get(attributeName);
      input.value = value;
    }else{
      let {label, input, li} = helpers.createInputWithLabel({
        labelContent: attributeName,
        content: value,
        withLi :true
      });
      this._attributeToInput.set(attributeName, input);
      input.onchange = ()=>{
        this.onAttributeChange({attributeName, value:input.value});
      };

      this.ul.appendChild(label);
    }
  }

  set onClickAdd(callBack){
    this._onClickAdd = callBack;
  }

  get onClickAdd(){
    return this._onClickAdd || noop;
  }

  set onAttributeChange(callBack){
    this._onAttributeChange = callBack;
  }
  get onAttributeChange(){
    return this._onAttributeChange || noop;
  }

  set onAttributeAdded(callBack){
    this._onAttributeAdded = callBack;
  }
  get onAttributeAdded(){
    return this._onAttributeAdded || noop;
  }
}

export default AttributesRenderer;
