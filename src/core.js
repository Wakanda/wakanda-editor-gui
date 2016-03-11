
var IDE = window.IDE || {};


class Core {
	constructor(coreModules){
		var that = this;

		if( IDE.Core ) {
			throw "Only one instance of core is allowed.";
		}

		this.activatedPlugins = [];
		this._modules          = {};

		var _EventEmitter   = require('../lib/micro-events.js');
		this.events = new _EventEmitter();

		coreModules.forEach(function(moduleName){
			console.log(moduleName);
			var module = require(`./modules/${moduleName}/index.js`);

			module.activate(function(){
				that.activatedPlugins.push(moduleName);

				if(that.activatedPlugins.length === coreModules.length){
					that.events.emit("ready");
				}
			});
		});
	}

	get(moduleName) {
		return this._modules[moduleName];
	}

	_activateModule(moduleName) {
		if (!this._modules[moduleName]) {
			throw "Plugin \"" + moduleName + "\" doesn't exist.";
		}
		this._modules[moduleName].isActivated = true;
	}

	onReady(callback) {
		this.events.on("ready", callback);
	}
}

export default Core;
