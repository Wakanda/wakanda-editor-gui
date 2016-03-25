class Core {
	constructor(coreModules){
		var that = this;

		// TODO: singleton
		// if( IDE.Core ) {
		// 	throw "Only one instance of core is allowed.";
		// }
		this._coreModulesNames	= coreModules;
		this._modulesInstances	= {};

		this._readyPromise = Promise.resolve('modules not loaded yet');

	}

	_loadModules({coreModules, argsByModule}){
		return coreModules
		 .reduce( ( prevActivationPromise, currentModuleName ) => {
			 let moduleArgs = argsByModule[currentModuleName];
			 return prevActivationPromise.then( ( ) => {
				 return new Promise((resolve, reject) => {
					 let moduleContent = require(`./modules/${currentModuleName}/index.js`);
					 // TODO: make activate asynchrone
					 moduleContent.activate({
						 loaded: (currentModuleInstance) => {
							 console.log(`Core module ${currentModuleName} loaded`);
							 this._modulesInstances[currentModuleName] = currentModuleInstance;
							 resolve();
							 // TODO: review
						 },
						 getModulMethod: this.get.bind(this),
						 moduleArgs
					 });
				 });
			 })
		 }, Promise.resolve());
	}

	get(moduleName) {
		return this._modulesInstances[moduleName];
	}

	get ready() {
		return this._readyPromise;
	}

	load(argsByModule){
		this._readyPromise = this._loadModules({
			coreModules: this._coreModulesNames,
			argsByModule
		});
		return this._readyPromise;
	}
}

export default Core;
