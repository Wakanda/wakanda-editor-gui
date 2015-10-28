import helpers from '../helpers';
import Renderer from '../Renderer';

let noop = ()=>{};

class AttributesRenderer extends Renderer{
  constructor({container, angularPage}){
    super({ title: 'Attributes :', container });

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
