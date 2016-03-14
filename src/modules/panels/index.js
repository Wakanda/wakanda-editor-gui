import PanelsManager from "./PanelsManager";

var Module =  {
	activate(loaded){
		var panels = new PanelsManager({
			panelsContainerId : "side-panel"
		});
		// TODO: remove IDE object affectation from inside modules
		IDE.panels = panels;

		loaded(panels);
	}
}

export default Module;
