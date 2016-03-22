var IDE = window.IDE || {};
// NOTE: using fileManager to load plugins
class PluginsManager {
	constructor(){

		var _EventEmitter   = require('../../../lib/micro-events.js');
		this.events = new _EventEmitter();

		this.toolbarElements  = [];
		this.plugins          = {};
	}

	get(pluginName) {
		return this.plugins[pluginName]
	}

	load(pluginName) {
		this.plugins[pluginName]          = {};
		this.plugins[pluginName].code     = require(`../../../plugins/${pluginName}/index.js`);
		this.plugins[pluginName].manifest = require(`../../../plugins/${pluginName}/manifest.js`);
	}
	// TODO: private ?
	loadMultiple(plugins) {
		plugins.forEach((plugin)=>this.load(plugin));
		/*
		var that = this;
		plugins.forEach(function(plugin){
			that.load(plugin);
		});
		*/

		//For now the load is Synchronous
		this.events.emit("all_loaded");
	}

	activate(pluginName){
		/*
		 * Behaviour to be discussed
		 */
		this.registerPluginToolbarElements(pluginName);
		try{
			// NOTE: just the coreModules dependencies
			let dependencies = this._getDependenciesOfPlugin(pluginName);
			// NOTE: return value is not used now
			this.plugins[pluginName].code.activate(dependencies);
		}catch(e){
			console.warn(e);
		}

		this.events.emit("plugin_activated", this.plugins[pluginName]);
	}

	registerPluginToolbarElements(pluginName) {
		var toolbarElements = this.plugins[pluginName].manifest.toolbar;

		toolbarElements.forEach((element)=>{
			element.plugin = pluginName;
			this.toolbarElements.push(element);
		});
	}

	getToolbarElements() {
		return this.toolbarElements;
	}

	onPluginActivated(callback){
		this.events.on("plugin_activated", callback );
	}

	onPluginsLoaded(callback){
		this.events.on("all_loaded", callback );
	}

	onPluginsActivated(callback){
		this.events.on("all_activated", callback );
	}

	_getDependenciesOfPlugin(pluginName){
		let dependenciesManifest = this.plugins[pluginName].manifest.dependencies;
		let coreModuleDependenciesManifest = dependenciesManifest.coreModules;
		let dependencies = {};
		dependencies.coreModules = coreModuleDependenciesManifest
			.reduce((retObj, coreModuleName)=>{
				// NOTE: get the module with internal dependenci injection or IoC
				let coreModule = IDE.Core.get(coreModuleName);
				if(coreModule){
					retObj[coreModuleName] = coreModule;
				}else {
					console.warn(`${pluginName} plugin tries to use an undefined coreModule: ${coreModuleName}`);
				}
				return retObj;
			},{});

			return dependencies;
	}
}

export default PluginsManager;
