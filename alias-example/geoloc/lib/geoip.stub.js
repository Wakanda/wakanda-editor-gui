'use strict';

export default function(ipAddress){
  return new Promise((resolve, reject) => {
      if(ipAddress && ipAddress.length < 8){
        reject({ 
          error : "error message is going to appear here",
          errorMessage : "Input string is not a valid IP address" ,
          info : {
            request: "test mode", 
            response : { 
              status : 404
            }
          }
        });
      }else{
        resolve({ 
          data : {"longitude":4.9,"latitude":52.3667,"asn":"AS196752","offset":"2","ip":(ipAddress || "46.19.37.108"),"area_code":"0","continent_code":"EU","dma_code":"0","timezone":"Europe\/Amsterdam","country_code":"NL","isp":"Tilaa B.V.","country":"Netherlands","country_code3":"NLD"}, 
          info : {
            request: "test mode", 
            response : { 
              status : 200
            }
          }
        });
      }
  });
}
