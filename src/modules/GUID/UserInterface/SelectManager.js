class SelectManager {
  constructor({container}) {
    this._container = container;
    this._highLightArea = document.createElement('div');
    this._highLightArea.classList.add('selectb');

    this._container.appendChild(this._highLightArea);
  }

  show(){
    this._highLightArea.style.display = 'block';
  }

  hide(){
    this._highLightArea.style.display = 'none';
  }

  set coords({x: left, y: top, width, height}){
    let style = this._highLightArea.style;
    style.top       = top;
    style.left      = left;
    style.width     = width;
    style.height    = height;

    this.show();
  }

  get coords(){
    let style = this._highLightArea.style;
    return {
      top : style.top,
      left  : style.left,
      width : style.width,
      height  : style.height
    };
  }

}

export default SelectManager;
