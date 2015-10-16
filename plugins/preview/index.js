var IDE = window.IDE;

import {HttpClient} from "../../lib/aurelia-http-client";

require("./style.css");

var helpers = {
	domElementToString({element}){
		let span = document.createElement('span');
		span.appendChild(element);
		return span.innerHTML;
	}
};

export default {

	activate() {
		let script
				= this.angularScriptTag
				= document.createElement('script');
		script.src = "http://ajax.googleapis.com/ajax/libs/angularjs/1.3.14/angular.min.js";

		this.prevIframe = document.createElement('iframe');
		this.prevIframe.setAttribute('style', 'width: 100%; height: 600;');
	},

	preview(){

		let html = IDE.GUID.documentEditor.document.children[0];
		let cloneHtml = html.cloneNode(true);

		let head = cloneHtml.querySelector('head');
		let firstScript = head.querySelector('script');
		head.insertBefore(this.angularScriptTag, firstScript);


		let fileContent = helpers.domElementToString({element:cloneHtml});

		let client = new HttpClient().configure(x => {
	    x.withHeader('Content-Type', 'application/json');
	  });
		client.post('http://localhost:3000/file', {fileName: 'tmp.html', fileContent})
		.then(({response})=>{

			this.prevIframe.src = response;
			let iframePrev = this.prevIframe;

			bootbox.dialog({
				message: iframePrev,
				title: "Preview",
			});
		});

	}

}
