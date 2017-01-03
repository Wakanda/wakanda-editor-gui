// TODO: neds a review or rewriting
// not optimized and not 100% generic (need more ...)

import temporaryService from './temporaryService';

class Bijection_ {
	static getDomPath ({from, to, render = false}){
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

			if(render){
				let infos = temporaryService.getinfo(el.parentNode.nodeName.toLowerCase());
				if(infos){
					let toSkip = infos.skip[0];
					if(toSkip === el.nodeName.toLowerCase()){
						stack.shift();
					}
				}
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
			element: renderBody, //element is body in the first call
			render: true
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
			element: body, //element is body in the first call
			render: true
		});
  }

	_fillMap({map, element, body, render}){
		body = body || element;
		let elementDomPath = Bijection.getDomPath({from: body, to: element, render});
		map.set(elementDomPath, element);
		for (var i = 0; i < element.childElementCount; i++) {
			this._fillMap({map, element:element.children[i], body, render});
		}
	}

	getSourceFromRender({element: renderElement}){
		// NOTE: temporarty (for angular directives, not nested, and that not replace tag name)
		let sourceElement = null;
		while ( ( !sourceElement ) && (renderElement !== null) && (renderElement.tagName.toLowerCase() !== 'html') ) {
			let elementDomPath = Bijection.getDomPath({
				from: this._renderBody,
				to: renderElement,
				render: true
			});
			sourceElement = this._sourceMap.get(elementDomPath) || null;
			renderElement = renderElement.parentElement;
		}
		return sourceElement;
	}

	getRenderFromSource({element}){
		let elementDomPath = Bijection.getDomPath({from: this._sourceBody, to: element});
		if(! this._renderMap.has(elementDomPath)){
			// NOTE: temp
			console.log(window.d._rendering);
		}
		return this._renderMap.get(elementDomPath);
	}
}

// NOTE: we use body always as the first element in the tree, this is an assumption that we can modify later

class Bijection {
	static allElementExcept({root, except}){
		let arr = [];
		for(let el of root.children){
			if(el !== except){
				arr.push(el);
				arr = arr.concat(Bijection.allElementExcept({
					root: el,
					except
				}));
			}
		}
		return arr;
	}
	constructor({sourceBody, renderBody}){

		this._renderMap = new WeakMap();
		this._sourceMap = new WeakMap();

		this._renderBody = renderBody;
		this._sourceBody = sourceBody;

		this._init();

	}

	_init(){
		this._renderMap.set(this._renderBody, 'body');
		this._sourceMap.set(this._sourceBody, 'body');

		this._deepBrowse({
			wMap: this._sourceMap,
			fromElement: this._sourceBody,
			currentPath: 'body'
		});
		this._deepBrowse({
			wMap: this._renderMap,
			fromElement: this._renderBody,
			currentPath: 'body',
			render: true
		});
	}

	_deepBrowse({wMap, fromElement, currentPath, render = false}){
		let children = fromElement.children;
		for(let i = 0; i < children.length; i++){
			let el = children[i];
			let elName = el.tagName.toLowerCase();

			let selector =  `${elName}:nth-child(${i+1})`;

			let nextElementPath = currentPath + ' > ' + selector;

			let transcludePath = null;
			if(render && (transcludePath = temporaryService.getTranscludePath({elementName: elName}))) {
				let transcludeElement = el.querySelector(transcludePath);
				if(transcludeElement){
					let otherElements = Bijection.allElementExcept({root: el, except: transcludeElement});
					for(let othEl of otherElements){
						wMap.set(othEl, nextElementPath);
					}
					wMap.set(transcludeElement, nextElementPath);
					wMap.set(el, nextElementPath);
					this._deepBrowse({wMap, fromElement: transcludeElement, currentPath: nextElementPath, render});
				}else{
					console.error('there is an arror here !');
				}
			} else {
				wMap.set(el, nextElementPath);
				this._deepBrowse({wMap, fromElement:el, currentPath: nextElementPath, render});
			}
		}
	}

	getSourceFromRender({element}){
		let path = this._renderMap.get(element);
		return this._sourceBody.parentElement.querySelector(path);
	}

	getRenderFromSource({element}){
		let path = this._sourceMap.get(element);
		let pathArr = path.split(' > ');
		for(let i in pathArr){
			let tagName = pathArr[i].split(':')[0];
			let trans = temporaryService.getTranscludePath({elementName: tagName});
			if(trans){
				pathArr[i] += (" > " + trans);
			}
		}
		return this._renderBody.parentElement.querySelector(pathArr.join(" > "));
	}
}

export default Bijection;
