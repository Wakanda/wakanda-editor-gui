require("../styles/common.css");
require("../styles/editor.css");
require("../styles/tree.css");
require("../styles/guid.css");

//- LOAD CORE -//
import Core from "./core";

// TODO: separate
//- INITIALIZE CORE -//
let gui = new Core([
	"plugins",
	"toolbar",
	"panels",
	"GUID"
]);

export default gui;
