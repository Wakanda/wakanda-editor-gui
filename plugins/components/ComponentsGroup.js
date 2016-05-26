
class ComponentGroup {
  constructor({groupName}) {
    this._div = document.createElement('div');
    let title = document.createElement('h4');
    title.textContent = groupName;
    this._div.appendChild(title);
    let list = document.createElement('ul');
    this._div.appendChild(list);
  }

  get container(){
    return this._div;
  }

  addComponents({components}) {
    for (let c of components) {
      let div = document.createElement('div');
      div.innerHTML = c.name;

      div.getComponent = () => {
        return c;
      };

      this.container.appendChild(div);
    }
  }

}

export default ComponentGroup;
