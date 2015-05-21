'use strict';

import geoip from 'alias-example-geoloc-geoip';

export default function(ip){
	return new Promise((resolve, reject) => {
		geoip(ip).then(responseData => {
			var resultData = {};

			resultData.ip = ip || responseData.data.ip;
			resultData.latitude = responseData.data.latitude;
			resultData.longitude = responseData.data.longitude;
			resultData.info = responseData.info;

			return resultData;
		}).then(filteredData => {
			resolve(filteredData);
		}).catch(err => {
			reject(err);
		});
	});
}