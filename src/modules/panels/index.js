import PanelsManager from "./PanelsManager";

var Module =  {
	activate(loaded){
		var panels = new PanelsManager({
			panelsContainerId : "side-panel"
		});

		loaded(panels);
	}
}

export default Module;
