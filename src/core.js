
var IDE = window.IDE || {};


class Core {
	constructor(coreModules){
		var that = this;

		if( IDE.Core ) {
			throw "Only one instance of core is allowed.";
		}

		this._modulesInstances          = {};

		//not using all to keep the order
		this._readyPromise = coreModules
			.reduce( ( prevActivationPromise, currentModuleName ) => {
				return prevActivationPromise.then( ( ) => {
					return new Promise((resolve, reject) => {
						let moduleContent = require(`./modules/${currentModuleName}/index.js`);
						// TODO: make activate asynchrone
						moduleContent.activate((currentModuleInstance) => {
							console.log(`Core module ${currentModuleName} loaded`);
							this._modulesInstances[currentModuleName] = currentModuleInstance
							resolve();
						});
					});
				})
			}, Promise.resolve());

	}

	get(moduleName) {
		return this._modulesInstances[moduleName];
	}

	onReady(callback) {
		this._readyPromise.then(callback);
	}
}

export default Core;
