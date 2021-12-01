export const dependencies = {
    fetch: null,
    UserSession: null,
    request: null,
    crypto: null
}

export const call = async (event, context) => {

    console.log("made it into the processEvent method...")

    const { fetch, UserSession, crypto, request } = dependencies;
    const body = JSON.parse(event.body)


    //verify the Webhook with HMAC
    const { webhook_id } = event.pathParameters;
    const secretKey = await getSecretKey(webhook_id);
    const signature = event.headers["x-esriHook-Signature"];
    const hash = crypto
        .createHmac('sha256', secretKey)
        .update(event.body)
        .digest('base64');
    if (`sha256=${hash}` !== decodeURIComponent(signature)) {
        //throw new Error(`HMAC Authenticity FAILED!!!`);
        const result_body = { error: true, message: `HMAC Authenticity FAILED!!!` };
        return {
            statusCode: 401,
            body: JSON.stringify(result_body)
        }
    }

    

    const data = await fetchChangesData(event, UserSession, fetch);

    // Use this switch statement to process different webhooks with different logic.

    // example webhook id: 0c4ce050-48da-4fc1-9c11-8fc2e42de1f0

    let response;
    switch (webhook_id) {
        case "0c4ce050-48da-4fc1-9c11-8fc2e42de1f0":
            response = await webhook1_process_data(data);
            break;
        case "a different webhook id":
            response = await webhook2_process_data(data);
            break;
        default:
            return {
                error: true,
                message: "No handler found for that webhook. Nothing has been achieved."
            }
    }

    return response;
};

const getSecretKey = async (webhook_id) => {
    const webhook_database = {
        "0c4ce050-48da-4fc1-9c11-8fc2e42de1f0": "bananas"
    }

    return webhook_database[webhook_id];
}

const fetchChangesData = async (event, UserSession, fetch) => {

    const body = JSON.parse(event.body)

    const username = process.env.UN;
    const password = Buffer.from(process.env.PW, "base64").toString("ascii");

    //get user session
    const session = new UserSession({ username, password });
    await session.refreshSession();

    //use changeUrl to get a statusUrl
    const changeUrl = decodeURIComponent(body[0].changesUrl);

    console.log("changeUrl: ", changeUrl)
    //example change url:
    //https://services.arcgis.com/hMYNkrKaydBeWRXE/arcgis/rest/services/Webhook_Demo/FeatureServer/extractChanges
    //?serverGens=[1532749,1535498]&async=true&returnUpdates=false&returnDeletes=false&returnAttachments=false

    const changeUrlResponse = await fetch(
        `${changeUrl}&f=json&token=${session.token}`,
        {
            method: "GET",
        }
    )
    const changeUrlResponseJson = await changeUrlResponse.json();

    console.log("changeUrlResponseJson", changeUrlResponseJson);

    const statusUrl = changeUrlResponseJson.statusUrl;

    console.log(`${statusUrl}?f=json&token=${session.token}`)
    //example statusUrl
    //https://services.arcgis.com/hMYNkrKaydBeWRXE/ArcGIS/rest/services/Webhook_Demo/FeatureServer/jobs/e7d91d67-c9df-4d4d-b6db-f018c5c505cb?f=json

    //use statusUrl to get the resultUrl which is a json object of the attribute information

    let resultUrl;

    const maxRetries = 5;
    let retryCount = 0;
    const pause = (_waitTime) => { return new Promise((resolve) => { setTimeout(resolve, _waitTime) }) };

    //wait a short period for json object to become available.
    await pause(2000);

    while (retryCount < maxRetries) {
        retryCount++;
        console.log("retry #", retryCount);
        const statusUrlResponse = await fetch(
            `${statusUrl}?f=json&token=${session.token}`,
            {
                method: 'GET'
            }
        )

        console.log("statusUrlResponse::", statusUrlResponse);

        const statusUrlResponseJson = await statusUrlResponse.json();

        console.log("statusUrlResponseJson::", statusUrlResponseJson)

        if (statusUrlResponseJson.status && statusUrlResponseJson.status === "Completed") {
            resultUrl = statusUrlResponseJson.resultUrl
            break;
        }
        else if (retryCount === maxRetries) {
            return {
                error: true,
                message: `Max retries reached without receiving a final response`
            }
        }
        await pause(2000);
    }

    console.log("resultUrl", resultUrl)
    //example result url
    //https://services.arcgis.com/hMYNkrKaydBeWRXE/ArcGIS/rest/services/Webhook_Demo/FeatureServer/changefiles/3d89a964d1d54c08887894e84adb25cf.json

    const finalResponse = await fetch(
        `${resultUrl}?token=${session.token}`,
        {
            method: 'GET'
        }
    )

    const finalResponseJson = await finalResponse.json();

    console.log(JSON.stringify(finalResponseJson))

    //sample response json is quite large so I have pasted at the bottom of this file

    return { finalResponseJson };
}

const webhook1_process_data = async (data) => {
    return data;
}

const webhook2_process_data = async (data) => {
    return data;
}


//sample changes json

const changes = {
    "layerServerGens": [
        {
            "id": 0,
            "serverGen": 1770625
        }
    ],
    "transportType": "esriTransportTypeUrl",
    "responseType": "esriDataChangesResponseTypeEdits",
    "edits": [
        {
            "id": 0,
            "features": {
                "adds": [
                    {
                        "geometry": {
                            "x": 19628691.27496718,
                            "y": -4546503.497235449
                        },
                        "attributes": {
                            "OBJECTID": 67,
                            "GlobalID": "CF08E663-267C-4371-AFE9-C87875C26038",
                            "CreationDate": 1638329251156,
                            "Creator": "psh_svcs",
                            "EditDate": 1638329251156,
                            "Editor": "psh_svcs"
                        }
                    },
                    {
                        "geometry": {
                            "x": 19629192.423233666,
                            "y": -4547018.943915406
                        },
                        "attributes": {
                            "OBJECTID": 68,
                            "GlobalID": "A39C9D58-9E97-4DD0-A6B8-A2AA64CB04C7",
                            "CreationDate": 1638329253539,
                            "Creator": "psh_svcs",
                            "EditDate": 1638329253539,
                            "Editor": "psh_svcs"
                        }
                    }
                ],
                "updates": [
                    {
                        "geometry": {
                            "x": 19627493.736804496,
                            "y": -4547116.003408822
                        },
                        "attributes": {
                            "OBJECTID": 62,
                            "GlobalID": "E516F064-703A-497A-8093-81A82BEDCB06",
                            "CreationDate": 1638325553017,
                            "Creator": "psh_svcs",
                            "EditDate": 1638329264390,
                            "Editor": "psh_svcs"
                        }
                    }
                ],
                "deleteIds": []
            }
        }
    ]
}