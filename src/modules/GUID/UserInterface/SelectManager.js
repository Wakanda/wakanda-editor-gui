import AreaManager from './AreaManager';


class SelectManager extends AreaManager {
  constructor({container}) {
    super({container, className: 'selectb'});

    let area = super.element;

    this._moveIcon = document.createElement('div');
    this._moveIcon.classList.add('move');
    area.appendChild(this._moveIcon);

    this._initDnDEvents();

  }

  _initDnDEvents(){
      this._moveIcon.setAttribute("draggable", true);

      this._moveIcon.addEventListener("drag", (e) => {
        console.log('data from event', e.dataTransfer.getData("infos"));
      });
      this._moveIcon.addEventListener("dragstart", (e) => {
  			let coords = {
          x: e.pageX,
          y: e.pageY
        };
        let infos = {
          coords,
          draggedFrom: 'whiteboard'
        }
        let infosStr = JSON.stringify(infos);
        e.dataTransfer.setData("infos", infosStr);
      });
  }

}

export default SelectManager;
