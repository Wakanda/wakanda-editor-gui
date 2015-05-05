/*import Core from "core"
import otherPlugins from "/"


export default class Toolbar {

	constructor (options = {}) {
		Core.plugins.layout.add("header", this.render);

		
	}


}

plugin = plugins.pop();
import `{$plugin}`;

*/

require("./style.css");

import {safeClassReplace} from "../../scripts/Utils";
import Core from "../../src/core2";

var IDE = window.IDE;

class Toolbar {
	constructor(options) {
		
		this.className = options.className;
		
		var container = document.getElementsByClassName(this.className)[0];
		
		this.container  = container;
		this.items      = [];		
		this.itemPrefix = "page-toolbar-item-";
		
		this.addItems(options.items);		
		this.create();
	}
	
	reload(items) {
		this.items = [];
		this.addItems(items);
		this.render();
	}

	addItems(items) {
		this.items.push(...items);
	}
	
	renderItem(item) {
		var action   = item.action;
		var name     = item.name;
		var plugin   = item.plugin;
		var type     = item.type;
		var template = "";
		
		switch(type){
			case "button":
				template = `<li data-plugin="${plugin}" data-command="${action}" class="page-toolbar-item page-toolbar-item-${name}" id="page-toolbar-item-${name}" title="${name}"></li>`
				break;
			
			case "separator":
				template = '<li class="page-toolbar-item page-toolbar-item-separator"></li>';
				break;
		}
		
		return template;
	}
	
	render() {
		var toolbarHtml = "";
		
		toolbarHtml = this.items.map(this.renderItem).join("");	
		
		this.container.innerHTML= `<ul class="page-toolbar-items">${toolbarHtml}</ul>`;
		
	}
	
	hookEvents(){
		this.container.addEventListener("click", function(event){
			var target     = event.target;
			var pluginName = target.getAttribute("data-plugin");
			var command    = target.getAttribute("data-command");			
			var plugin     = IDE.core.getPlugin(pluginName);
			
			plugin.code[command]();
		});
	}
	
	create() {
		this.render();
		this.hookEvents();
	}
	
	getItemContainer(targetId) {
		targetId = this.itemPrefix + targetId;
		
		var container = window.document.getElementById(targetId);
		
		return container;
	}
	
	swapItemClass(item, oldClass, newClass) {
		var container = this.getItemContainer(item);
		newClass = this.itemPrefix + newClass;
		oldClass = this.itemPrefix + oldClass;
		container.className = safeClassReplace(container.className, oldClass, newClass);
	}
	
	addClassToItem(item, newClass){
		var container = this.getItemContainer(item);
		newClass = this.itemPrefix + newClass;
		container.className = container.className + " " + newClass;
	}
	
	removeClassToItem(item, targetClass){
		var container = this.getItemContainer(item); 
		targetClass = this.itemPrefix + targetClass;
		container.className = safeClassReplace(container.className, targetClass, "");
	}
	
	editItemClasses(item, options){
		var toRemove  = options.remove;
		var toAdd     = options.add;
		var container = this.getItemContainer(item);
		
		toRemove.forEach((item)=>{
			this.removeClassToItem(container, item);
		});
		
		toAdd.forEach((item)=>{
			this.removeClassToItem(container, item);
		});		
	}
}

export default Toolbar;

Core.register("Toolbar", Toolbar);