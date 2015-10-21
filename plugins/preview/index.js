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
		this.angularScriptTag	= document.createElement('script');
		this.angularRouteScriptTag = document.createElement('script');
		this.angularScriptTag.src = "http://ajax.googleapis.com/ajax/libs/angularjs/1.3.14/angular.min.js";
		this.angularRouteScriptTag.src = "http://ajax.googleapis.com/ajax/libs/angularjs/1.3.14/angular-route.js";

		this.prevIframe = document.createElement('iframe');
		this.prevIframe.setAttribute('style', 'width: 100%; height: 600;');
	},

	preview(){
		let cloneHtml = IDE.GUID.documentEditor.htmlClone;

		let head = cloneHtml.querySelector('head');
		let firstScript = head.querySelector('script');
		head.insertBefore(this.angularScriptTag, firstScript);
		head.insertBefore(this.angularRouteScriptTag, firstScript);


		let fileContent = helpers.domElementToString({element:cloneHtml});

		let client = new HttpClient().configure(x => {
	    x.withHeader('Content-Type', 'application/json');
	  });
		client.post('http://localhost:3000/file', {fileName: 'tmp.html', fileContent})
		.then(({response})=>{

			this.prevIframe.src = response;
			let iframePrev = this.prevIframe;
			iframePrev.onLoad = function(){
				log(this.contentWindow.location);
			};

			bootbox.dialog({
				message: iframePrev,
				title: "Preview",
			});
		});

	}

}
