import helpers from './helpers';

class Renderer{
  constructor({title, container}){
    this.container = container;
    this.container.appendChild(helpers.createTitle({
      text: title
    }));
    this._ul = document.createElement('ul');
    this.container.appendChild(this._ul);
  }
  get ul(){
    return this._ul;
  }
  appendElement({element}){
    this.container.appendChild(element);
  }
}


export default Renderer;
