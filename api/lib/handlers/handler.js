const AWS = require('aws-sdk');
import { UserSession } from "@esri/arcgis-rest-auth";
require('isomorphic-form-data');
import fetch from 'node-fetch';
import { setDefaultRequestOptions, request } from '@esri/arcgis-rest-request';
// use node-fetch for each request instead of relying on a global
setDefaultRequestOptions({ fetch })
import crypto from 'crypto';

export const handleWebhook = async (event, context) => {

  console.log(event);

  let result = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Origin": "*",
      "Access-Control_Allow-Credentials": true
    }
  };

  try {

    //verify the Webhook with HMAC
    const { webhook_id } = event.pathParameters;
    console.log(`webhook id: ${webhook_id}`)
    const webhookRecord = await getWebhookRecord(webhook_id);
    if (!webhookRecord) throw new Error(`No webhook record found for ${webhook_id}`)

    const signature = event.headers["x-esriHook-Signature"];
    const hash = crypto
      .createHmac('sha256', webhookRecord.key)
      .update(event.body)
      .digest('base64');
    if (`sha256=${hash}` !== decodeURIComponent(signature)) {
      throw new Error(`HMAC Authenticity FAILED!!!`);
    }

    console.log(`Passed the signature key test!`)

    // launch state machine

    console.log(`ARN: ${webhookRecord.statemachine_arn}`)

    const params = {
      stateMachineArn: webhookRecord.statemachine_arn,
      input: JSON.stringify(event)
    }

    const StepFunctions = new AWS.StepFunctions()

    // Execute StepFunction
    // @see https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/StepFunctions.html#startExecution-property
    let stateMachineResult = null
    try {
      stateMachineResult = await StepFunctions.startExecution(params).promise()
      console.log(`Statemachine id: ${stateMachineResult}`)
    } catch (e) {
      console.log('Error:', e)
    } 

    result.body = JSON.stringify({ message: "Webhook processed." })

  }
  catch (err) {
    const result_body = { error: true, message: err.toString() };
    result.statusCode = 400;
    result.body = JSON.stringify(result_body);
    console.error(result_body);
  }
  finally {
    console.log(result)
    return result;
  }


};

const getWebhookRecord = async (webhook_id) => {
  const webhook_database = {
    "0c4ce050-48da-4fc1-9c11-8fc2e42de1f0": {
      "statemachine_arn": "arn:aws:states:us-east-1:801084929830:stateMachine:mySampleStateMachine-dev",
      "key": "bananas"
    },
    "536bb86f-9a75-4fa6-b05a-a225efc53bbc": {
      "statemachine_arn": "arn:aws:states:us-east-1:801084929830:stateMachine:mySampleStateMachine-dev",
      "key": "bananas"
    },
    "78649830-cf5b-4992-bd14-99a1f6fb389d": {
      "statemachine_arn": "arn:aws:states:us-east-1:801084929830:stateMachine:mySampleStateMachine-dev",
      "key": "bananas"
    },
    "c436d762-d547-4bbb-b2b0-5a4f0b03cfa9": {
      "statemachine_arn": "arn:aws:states:us-east-1:801084929830:stateMachine:mySampleStateMachine-dev",
      "key": "bananas"
    },
  }

  return webhook_database[webhook_id];
}

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