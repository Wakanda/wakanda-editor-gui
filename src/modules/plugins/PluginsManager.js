// NOTE: using fileManager to load plugins
class PluginsManager {
	constructor({getModulMethod}){
		// TODO: review
		this._getModulMethod = getModulMethod;

		var _EventEmitter   = require('../../../lib/micro-events.js');
		this.events = new _EventEmitter();

		this._services = {};

		this.toolbarElements  = [];
		this.plugins          = {};
	}

	_addServices({services}){
		for(let serviceName in services){
			let servicesSet = services[serviceName];
			let myService = this._services[serviceName] = this._services[serviceName] || {};
			for(let version in servicesSet){
				let service = servicesSet[version];
				// TODO: review
				myService[version] = service;
			}
		}
		//inject added service in active plugins
		for(let pluginName in this.plugins){
			if(this.plugins[pluginName].active){
				this._injectServices({pluginName, services});
			}
		}
	}

	get(pluginName) {
		return this.plugins[pluginName]
	}

	load(pluginName) {
		this.plugins[pluginName]          = {};
		this.plugins[pluginName].code     = require(`../../../plugins/${pluginName}/index.js`);
		this.plugins[pluginName].manifest = require(`../../../plugins/${pluginName}/manifest.js`);
		this.plugins[pluginName].active		= false;
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
			this.plugins[pluginName].active = true;
			this._registerServices({pluginName});
			this._injectServices({pluginName});
		}catch(e){
			console.warn(e);
		}

		this.events.emit("plugin_activated", this.plugins[pluginName]);
	}

	_injectServices({pluginName, services}){
		let plugin = this.plugins[pluginName];
		let consumedServices = plugin.manifest.consumedServices || {};
		for(let serviceName in consumedServices){
			let servicesSet = consumedServices[serviceName];
			let serviceToInjectSet = (services || this._services)[serviceName];// optimisation
			if(serviceToInjectSet){
				for(let version in servicesSet){
					let injectionFunctionName = servicesSet[version];
					let serviceToInject = serviceToInjectSet[version];
					if(serviceToInject){
						if(plugin.code[injectionFunctionName]){
							plugin.code[injectionFunctionName](serviceToInject);
						}
					}
				}
			}
		}
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

	_registerServices({pluginName}){
		let plugin = this.plugins[pluginName];
		let servicesProvidersNames = plugin.manifest.providedServices || {};
		let providedServices = {};
		for(let serviceName in servicesProvidersNames){
			providedServices[serviceName] = {};
			let servicesSet = servicesProvidersNames[serviceName];
			for(let version in servicesSet){
				let serviceProviderName = servicesSet[version];
				let serviceFromPlugin = plugin.code[serviceProviderName]();
				providedServices[serviceName][version] = serviceFromPlugin;
			}
		}
		this._addServices({services: providedServices});
	}

	_getDependenciesOfPlugin(pluginName){
		let dependenciesManifest = this.plugins[pluginName].manifest.dependencies;
		let coreModuleDependenciesManifest = dependenciesManifest.coreModules;
		let dependencies = {};
		dependencies.coreModules = coreModuleDependenciesManifest
			.reduce((retObj, coreModuleName)=>{
				// NOTE: get the module with internal dependenci injection or IoC
				// TODO: review
				let coreModule = this._getModulMethod(coreModuleName);
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
