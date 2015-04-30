//first draft for the core
class Core {

	constructor(options) {
		
		this.corePlugins = [
			"toolbar",
			"request"
		];

		this.plugins 			= {};
		this.toolbarElements  	= [];
		
		/*
 		* Create EventEmitter
 		*/
		let _EventEmitter		= require('../lib/micro-events.js');
		this.EventManager		= new _EventEmitter;
		
		/*
 		* load toolbar
 		*/
		this.loadPlugin("toolbar", {
			className : "page_toolbar",
			items : []
		});

		//this.loadPlugin("request"); //@todo
  	}

  	getPlugin(pluginName) {
		return this.plugins[pluginName];
  	}

  	loadPlugin(pluginName, conf) {
		
		if (this.plugins[pluginName]) {
			console.warn("a plugin already use this name");
			return;
		}

		this.plugins[pluginName]          = {};
		this.plugins[pluginName].code     = require("../plugins/"+pluginName+"/index.js");
		this.plugins[pluginName].manifest = require("../plugins/"+pluginName+"/manifest.js");

		if (typeof this.plugins[pluginName].code === "function") {
			this.plugins[pluginName].inst = new this.plugins[pluginName].code(conf);
		}

		if (this.corePlugins.indexOf(pluginName) !== -1) {
			this[pluginName] = this.plugins[pluginName].inst;
		}

		this.subscribePlugin(pluginName);
		this.registerPluginToolbarElements(pluginName);

  	}

	registerPluginToolbarElements(pluginName) {

		var toolbarElements = this.plugins[pluginName].manifest.toolbar;

		if (toolbarElements === undefined) return;
		
		toolbarElements.forEach((element)=>{
			element.plugin = pluginName;
			this.toolbarElements.push(element);
		});

		this.plugins.toolbar.inst.reload(this.toolbarElements);
	}

	getToolbarElements() {
		return this.toolbarElements;
	}

	subscribePlugin(pluginName) {
		var subscriptions = this.plugins[pluginName].manifest.subscribe;
		
		if (subscriptions === undefined) return;

		subscriptions.forEach( (event)=> this.EventManager.on(event, this.plugins[pluginName].code.on ) );		
	}
}

export default Core;