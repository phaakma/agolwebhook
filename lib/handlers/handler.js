import { UserSession } from "@esri/arcgis-rest-auth";
require('isomorphic-form-data');
import fetch from 'node-fetch';
import { setDefaultRequestOptions, request } from '@esri/arcgis-rest-request';
// use node-fetch for each request instead of relying on a global
setDefaultRequestOptions({ fetch })
import crypto from 'crypto';

import * as processEvent from "../methods/processEvent"



export const handleWebhook = async (event, context) => {

  console.log(event);

  let result = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Origin": "*arcgis.com",
      "Access-Control_Allow-Credentials": true
    }
  };

  try {

    processEvent.dependencies.UserSession = UserSession;
    processEvent.dependencies.fetch = fetch;
    processEvent.dependencies.crypto = crypto;
    processEvent.dependencies.request = request;

    const processResponse = await processEvent.call(event, context);

    console.log("We are back in the main handler from the processEvent...")

    result = { ...result, ...processResponse };
    // result.body = JSON.stringify(result_body);
  }
  catch (err) {
    const result_body = { error: true, message: err.toString() };
    result.statusCode = 400;
    result.body = JSON.stringify(result_body);
    console.error(result_body);
  }
  finally {
    return result;
  }


};


//sample payload

const samplePayload = [
  {
    "name": "aws_lambda",
    "layerId": 0,
    "orgId": "hMYNkrKaydBeWRXE",
    "serviceName": "Pest_Inspections",
    "lastUpdatedTime": 1620712326267,
    "changesUrl": "https%3a%2f%2fservices.arcgis.com%2fhMYNkrKaydBeWRXE%2fArcGIS%2frest%2fservices%2fPest_Inspections%2fFeatureServer%2fextractChanges%3fserverGens%3d%5b1404636%2c1404640%5d%26async%3dtrue%26returnUpdates%3dfalse%26returnDeletes%3dfalse%26returnAttachments%3dfalse",
    "events": [
      "FeaturesCreated"
    ]
  }
]