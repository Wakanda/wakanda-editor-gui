class Core {
	constructor(coreModules){
		var that = this;

		// TODO: singleton
		// if( IDE.Core ) {
		// 	throw "Only one instance of core is allowed.";
		// }

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
							this._modulesInstances[currentModuleName] = currentModuleInstance;
							resolve();
							// TODO: review
						}, this.get.bind(this));
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
}

export default Core;
