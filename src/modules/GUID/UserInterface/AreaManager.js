class AreaManager {
  constructor({container, className}) {
    this._container = container;
    this._divArea = document.createElement('div');
    this._divArea.classList.add(className);

    this._container.appendChild(this._divArea);
  }

  show(){
    this._divArea.style.display = 'block';
  }

  hide(){
    this._divArea.style.display = 'none';
  }

  get element(){
    return this._divArea;
  }

  set coords({x: left, y: top, width, height}){
    let style = this._divArea.style;
    style.top       = top;
    style.left      = left;
    style.width     = width;
    style.height    = height;

    this.show();
  }

  get coords(){
    let style = this._divArea.style;
    return {
      top : style.top,
      left  : style.left,
      width : style.width,
      height  : style.height
    };
  }

}

export default AreaManager;
