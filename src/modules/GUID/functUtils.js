let functUtils = {
	identity: function(arg) {
		return arg;
	},
	fillwithName: function(element, fillWithArg) {
		var fillWith = element.tagName.toLowerCase();
		if (fillWithArg !== undefined) {
			fillWith = fillWithArg;
		}
		element.innerHTML = '<span>' + fillWith + '</span>';
		return element;
	},
	mapNameOfObject: function(attribute) {
		return attribute.name;
	},
	domNodesFromHTML: function(html) {
		var div = DOCUMENT.createElement('div');
		div.innerHTML = html;
		var elements = div.childNodes;

		return elements;
	},
	elementFromTemplate({template}) {
    let tmpDiv = document.createElement('div');
    tmpDiv.innerHTML = template;
    return tmpDiv.firstChild;
  }
}

export default functUtils;
