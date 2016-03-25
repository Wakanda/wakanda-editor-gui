import Toolbar from "./Toolbar"

var Module =  {
	activate({loaded, getModulMethod}){

		let pluginsManager = getModulMethod("plugins");

		var toolbar = new Toolbar({
			options:{
				className : "page_toolbar"
			},
			pluginsManager
		});


		loaded(toolbar);
	}
}

export default Module;
