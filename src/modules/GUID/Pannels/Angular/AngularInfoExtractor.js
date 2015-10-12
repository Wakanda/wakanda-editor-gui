import AngularApplication from './AngularApplication';

// TODO: wrap asynchronous in a more efficient way
class AngularInfoExtractor {
	constructor({ scripts }) {
		this.scripts = scripts;
		let applicationsPromisesUr = [];// TODO: onReady

		this.scripts.forEach((script)=>{
			let scriptApplicationsPromise = this.getApplicationsFromScript({script});
			applicationsPromisesUr.push(scriptApplicationsPromise);
		});

		// TODO: reduce

		this._applicationsPromises = Promise.all(applicationsPromisesUr)
				.then((applicationsPromiseArray)=>{
					let allApplications = applicationsPromiseArray.reduce((allApps, apps)=>{
						return allApps.concat(apps);
					}, []);
					return AngularInfoExtractor.mergeApplications({applications: allApplications});
				});

    // this.informationsPromise = extractInfos();
	}

	// TODO: (maybe) when to stop (external libs)
	static mergeApplications({applications}){
		let nameToAppMap = new Map();
		applications.forEach((currentApp)=>{
			let currentAppName = currentApp.name;
			if(! nameToAppMap.has(currentAppName) ){
				nameToAppMap.set(currentAppName, currentApp);
			}else{
				//mergeRecipes
				let baseApp, extApp;
				let existingApp = nameToAppMap.get(currentAppName);
				if(existingApp.script){// declaration
					[baseApp, extApp] = [existingApp, currentApp];
				}else if(currentApp.script){
					[baseApp, extApp] = [currentApp, existingApp];
					nameToAppMap.set(currentAppName, currentApp);
				}else{
					console.error(`Fatal (for the moment) error there is an error on ${currentAppName} declaration`);
				}
				if(baseApp.script){// another check
					let extRecipes = extApp.recipes;
					baseApp.addRecipes({recipes: extRecipes});
				}
			}
		});
		// build dependencies
		let allAppsNames = nameToAppMap.keys();
		[...allAppsNames].forEach((currentAppName)=>{
			let currentApp = nameToAppMap.get(currentAppName);
			// for the moment we do not check dependencies cycles
			let currentAppDependenciesNames = currentApp.dependenciesNames;
			let currentAppDependencies = currentAppDependenciesNames.map((appName)=>{
				let app = nameToAppMap.get(appName);
				nameToAppMap.delete(appName);
				return app;
			});
			currentApp.addDependencies({applications: currentAppDependencies});
		});

		return [...nameToAppMap.values()];
	}

	get applicationsPromise(){
		return this._applicationsPromises;
	}

	getApplicationsFromScript({script}){
		return this.extractInfos({script}).then(({applications})=>{
			return applications.map((application)=>{
				return new AngularApplication({application, script});
			});
		});
	}

	// NOTE: Experimental
	extractInfos({script}) {
		return script
			.codePromise
			.then((code) => {
				let allCode = `
				${this.theMagicAngular}
				var myFunction = function(angular){
					${code}
					return infos;
				};
				let thisArg = {};
				myFunction.call(thisArg, magicAngular);
			`;

				let infos = eval(allCode);

				return infos;
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
				application.declaration = true;
			}

			return application;
		};


		`;
	}

}

export default AngularInfoExtractor;
