



let service = {
	getinfo: function(bName) {
		if(bName === 'ion-list'){
			return {
				// the first div
				skip: ['div']
			}
		}		else{
			return null;
		}
	},

	getTranscludePath: function({elementName}) {
		if(elementName.toLowerCase() === 'ion-list'){
			return 'div:nth-child(1)';
		}else if(elementName.toLowerCase() === 'ion-content'){
				return 'div:nth-child(1)';
		}else{
			return null;
		}
	}
};

export default service;




//ion-list => ion-list > div
