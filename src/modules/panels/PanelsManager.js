// NOTE: maybe using angular or react ... to create html rendering ..

var IDE = window.IDE || {};

class PanelsManager {
	constructor({panelsContainer, panelsContainerId}) {

    this._panelsContainer = panelsContainer || document.querySelector(`#${panelsContainerId}`);
    this._tabsList        = this._panelsContainer.querySelector('#tabs-list');
    this._tabContent      = this._tabContentContainer = this._panelsContainer.querySelector('.tab-content');

    this._responsiveButtonsListContainer = this._panelsContainer.querySelector(`#responsiveButtonsList`);

    this._panelsMap = new Map();

	}
  // NOTE: maybe changing this name to a generic one
  get responsiveButtonsList(){
    return this._responsiveButtonsListContainer;
  }

	addPanel({panelName}){
		if(! this._panelsMap.has(panelName)){
			this._panelsMap.set(panelName, this._addPanel({panelName}));
		} else {
			console.warn(`panel ${panel} already created`);
		}
		return this._panelsMap.get(panelName).content;
	}

  _addPanel({panelName}){
		let panelNameLowerCase = panelName.toLowerCase();
    let li = document.createElement('li');
		li.innerHTML = `<a data-toggle="tab" href="#${panelNameLowerCase}">${panelName}</a>`;
		// NOTE: maybe cause ids overlap
		let content = document.createElement('div');
		content.setAttribute('class', 'cloud-ide-tree unselectable tab-pane');
		content.setAttribute('id', panelNameLowerCase);
		content.innerHTML = `<h3>${panelName}</h3>`;

		this._tabsList.appendChild(li);
		this._tabContent.appendChild(content);

		return { li, content };
  }
	_removePanel({panelName}){
		console.warn('removing panel', panelName);
		let {li, content} = this._panelsMap.get(panelName);
		[li, content].forEach((elm)=>{
			elm.parentElement.removeChild(elm);
		});
	}

	hookEvents(){
		this.container.addEventListener("click", function(event){
			var target     = event.target;
			var pluginName = target.getAttribute("data-plugin");
			var command    = target.getAttribute("data-command");
			var plugin     = IDE.plugins.get(pluginName);

			plugin.code[command]();
		});
	}

	getPanelContainer({panelName}) {
		let panelObj = this._panelsMap.get(panelName);
		if(panelObj){
			return panelObj.content;
		} else {
			return null;
		}
	}

}

export default PanelsManager;