var IDE = window.IDE;

class PluginsManager {
	constructor(){
		if( IDE.pluginsManager ) {
			throw "Only one instance of the PluginsManager is allowed.";
		}
		
		this.toolbarElements  = [];
		this.EventManager     = IDE.EventManager;
		this.plugins          = {};		
	}
	
	get(pluginName) {
		return this.plugins[pluginName]
	}
	
	load(pluginName) {
		this.plugins[pluginName]          = {};
		this.plugins[pluginName].code     = require(`../plugins/${pluginName}/index.js`);
		this.plugins[pluginName].manifest = require(`../plugins/${pluginName}/manifest.js`);
		
		this.subscribePlugin(pluginName);
		this.registerPluginToolbarElements(pluginName);
	}
	
	registerPluginToolbarElements(pluginName) {
		var toolbarElements = this.plugins[pluginName].manifest.toolbar;
		
		toolbarElements.forEach((element)=>{
			element.plugin = pluginName;
			this.toolbarElements.push(element);
		});
	}
	
	subscribePlugin(pluginName) {
		var subscriptions = this.plugins[pluginName].manifest.subscribe;
		
		subscriptions.forEach( (event)=> this.EventManager.on(event, this.plugins[pluginName].code.on ) );		
	}
	
	getToolbarElements() {
		return this.toolbarElements;
	}
}

export default PluginsManager;