// TODO: neds a review or rewriting
// not optimized and not 100% generic (need more ...)
class Bijection {
	static getDomPath ({from, to}){
		let el = to;

		var stack = [];
		while (el.parentNode !== null) {
			var sibCount = 0;
			var sibIndex = 0;

			for (var i = 0; i < el.parentNode.childNodes.length; i++) {
				var sib = el.parentNode.childNodes[i];
				if (sib.nodeName == el.nodeName) {
					if (sib === el) {
						sibIndex = sibCount;
					}
					sibCount++;
				}
			}

			if (el.hasAttribute('id') && el.id != '') {
				stack.unshift(el.nodeName.toLowerCase() + '#' + el.id);
			} else if (sibCount > 1) {
				stack.unshift(el.nodeName.toLowerCase() + ':eq(' + sibIndex + ')');
			} else {
				stack.unshift(el.nodeName.toLowerCase());
			}

			el = el.parentNode;
		}

		//Return ommiting the first element, which is HTML tag
		return stack.slice(1).join(' > ');
	}

	constructor({sourceBody, renderBody}){
		this._renderMap = new Map();
		this._sourceMap = new Map();

		this._renderBody = renderBody;
		this._sourceBody = sourceBody;

		this._fillMap({
			map: this._renderMap,
			element: renderBody //element is body in the first call
		});
		this._fillMap({
			map: this._sourceMap,
			element: sourceBody //element is body in the first call
		});
	}

  set sourceBody(body){
    this._sourceBody = body;
    this._fillMap({
			map: this._sourceMap,
			element: body //element is body in the first call
		});
  }

  set renderBody(body){
    this._renderBody = body;
    this._fillMap({
			map: this._renderMap,
			element: body //element is body in the first call
		});
  }

	_fillMap({map, element, body}){
		body = body || element;
		let elementDomPath = Bijection.getDomPath({from: body, to: element});
		map.set(elementDomPath, element);
		for (var i = 0; i < element.childElementCount; i++) {
			this._fillMap({map, element:element.children[i], body});
		}
	}

	getSourceFromRender({element}){
		let elementDomPath = Bijection.getDomPath({from: this._renderBody, to: element});
		return this._sourceMap.get(elementDomPath);
	}
	getRenderFromSource({element}){
		let elementDomPath = Bijection.getDomPath({from: this._sourceBody, to: element});
		if(! this._renderMap.has(elementDomPath)){
			console.log(window.d._rendering);
		}
		return this._renderMap.get(elementDomPath);
	}
}

export default Bijection;
