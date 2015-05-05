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
				this.plugins[key].run();
	   	}
	},

	register(name, code) {
		this.toLoad.push({name: name, Class: code});
	},

	get(pluginName) {
		return this.plugins[pluginName];
	},

	subscribePlugin(pluginName, subscriptions) {
		
		if (subscriptions === undefined) return;

		subscriptions.forEach( (event)=> this.EventManager.on(event, this.plugins[pluginName].on ) );		
	}
}