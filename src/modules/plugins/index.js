import PluginsManager from "./PluginsManager"

var Module =  {
	// TODO: review
	activate({loaded, getModulMethod}){

		var plugins    = new PluginsManager({getModulMethod});

		loaded(plugins);
	}
}

export default Module;

// TODO: manage error messages
