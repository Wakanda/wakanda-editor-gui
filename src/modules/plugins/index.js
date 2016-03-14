import PluginsManager from "./PluginsManager"

var Module =  {
	activate(loaded){
		var plugins    = new PluginsManager();
		IDE.plugins = plugins;

		loaded(plugins);
	}
}

export default Module;
