'use strict';

export default function(ipAddress){
	return new Promise((resolve, reject) => {
			var url = "https://freegeoip.net/json/"+(ipAddress ? ipAddress : "");

		 	fetch(url).then(res => res.json())
		 	.then(json => {
		 		resolve({ 
		 			data : json, 
		 			info : {
			 			request : url,
						response : { 
				 			status : 200
			 			}
		 			}
		 		});
			}).catch(e => {
				reject({ 
					error : e.message, 
					errorMessage : "Input string is not a valid IP address",
					info: {
						request: url, 
						response : { 
							status : 404
						}
					}
				});
			});

	})
}