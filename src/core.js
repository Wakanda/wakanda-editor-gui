export default {

	init() {
	
		/*
 		* Create EventEmitter
 		*/
		let _EventEmitter		= require('../lib/micro-events.js');
		this.EventManager		= new _EventEmitter;

	},
	
	toLoad: [],

	plugins: {},

	run() {

		this.init();

		this.toLoad.forEach((plugin) => {
			this.plugins[plugin.name] = new plugin.Class(plugin.Class.conf); 
		});

	   	for (let key of Object.keys(this.plugins)) {
			var toRun = this.plugins[key].run;
			if (toRun)
				toRun.call(this.plugins[key]);
	   	}
	},

	register(name, code) {
		this.toLoad.push({name: name, Class: code});
	},

	get(pluginName) {
		return this.plugins[pluginName];
	}
	
}