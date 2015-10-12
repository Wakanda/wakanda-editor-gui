
class AngularInfoExtractor {
	constructor({ script }) {
		this.script = script;

    // this.informationsPromise = extractInfos();
	}

	// NOTE: Experimental
	extractInfos() {
		return this.script
			.codePromise
			.then((code) => {
				let allCode = `
				${this.theMagicAngular}
				(function(angular){
					${code}
					return infos;
				})(magicAngular);
			`;

				let infos = eval(allCode);

				return {
					extractorInstance: this,
					infos
				};
			});

	}

	get theMagicAngular() {
		return `

		var magicAngular = {};
		var infos = {
			applications: []
		};
		var RecipeFunctions = {};
		var createControllerFunction = function(application) {
			return function(controllerName, controllerContent) {
				application.recipes.controller = application.recipes.controller || [];
				var controller = {
					controllerName: controllerName,
					controllerContent: controllerContent
						//injections ...
				};
				application.recipes.controller.push(controller);
				return application;
			};
		};

		var createValueFunction = function(application) {
			return function(key, value) {
				application.recipes.value = application.recipes.value || [];
				var keyVal = {
					key: key,
					value: value
				};
				application.recipes.value.push(keyVal);
				return application;
			};
		};
		var createFactoryFunction = function(application) {
			return function(factoryName, factoryContent) {
				application.recipes.factory = application.recipes.factory || [];
				var factory = {
					factoryName: factoryName,
					factoryContent: factoryContent
				};
				application.recipes.factory.push(factory);
				return application;
			};
		};
		var createServiceFunction = function(application) {
			return function(serviceName, serviceContent) {
				application.recipes.service = application.recipes.service || [];
				var service = {
					serviceName: serviceName,
					serviceContent: serviceContent
				};
				application.recipes.service.push(service);
				return application;
			};
		};
		var createProviderFunction = function(application) {
			return function(providerName, providerContent) {
				application.recipes.provider = application.recipes.provider || [];
				var provider = {
					providerName: providerName,
					providerContent: providerContent
				};
				application.recipes.provider.push(provider);
				return application;
			};
		};
		var createDirectiveFunction = function(application) {
			return function(directiveName, directiveContent) {
				application.recipes.directive = application.recipes.directive || [];
				var directive = {
					directiveName: directiveName,
					directiveContent: directiveContent
				};
				application.recipes.directive.push(directive);
				return application;
			};
		};
		var createFilterFunction = function(application) {
			return function(directiveName, directiveContent) {
				application.recipes.filter = application.recipes.filter || [];
				var filter = {
					filterName: filterName,
					filterContent: filterContent
				};
				application.recipes.filter.push(filter);
				return application;
			};
		};
		var createConstantFunction = function(application) {
			return function(constantName, constantContent) {
				application.recipes.constant = application.recipes.constant || [];
				var constant = {
					constantName: constantName,
					constantContent: constantContent
				};
				application.recipes.constant.push(constant);
				return application;
			};
		};
		var createConfigFunction = function(application) {
			return function(configContent) {// configs do not have names
				application.recipes.config = application.recipes.config || [];
				var config = {
					// configName: configName,
					configContent: configContent
				};
				application.recipes.config.push(config);
				return application;
			};
		};

		magicAngular.module = function(appName, dependencies) {
			var newApp = {
				applicationName: appName,
		    recipes: {}
			};

			var index = infos.applications.map(function(application) {
				return application.applicationName;
			}).indexOf(appName);

			var application = infos.applications[index] || newApp;

			if (index == -1) {
				infos.applications.push(application);
			}

			application.controller = createControllerFunction(application);
			application.factory = createFactoryFunction(application);
			application.service = createServiceFunction(application);
			application.provider = createProviderFunction(application);
			application.directive = createDirectiveFunction(application);
			application.filter = createFilterFunction(application);
			application.constant = createConstantFunction(application);
		  application.config = createConfigFunction(application);

			if (dependencies) {
				application.dependencies = dependencies;
			}

			return application;
		};


		`;
	}

}

export default AngularInfoExtractor;
