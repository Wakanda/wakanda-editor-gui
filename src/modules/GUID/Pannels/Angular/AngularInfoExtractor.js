// import AngularApplication from './AngularApplication';
// import magicAngular from './magicAngular';

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
				${magicAngular}
				var myFunction = function(angular){
					${code}
					return infos;
				};
				let thisArg = {};
				myFunction.call(thisArg, magicAngular);\n`
				;

				let infos = eval(allCode);

				return infos;
			});
	}

}

export default AngularInfoExtractor;
