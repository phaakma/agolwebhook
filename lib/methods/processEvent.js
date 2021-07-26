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
    console.log(`HMAC Authenticity verified `)

    //0c4ce050-48da-4fc1-9c11-8fc2e42de1f0

    let response;

    switch (webhook_id) {
        case "0c4ce050-48da-4fc1-9c11-8fc2e42de1f0":
            response = await webhook1(event, UserSession, fetch);
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

const webhook1 = async (event, UserSession, fetch) => {

    const body = JSON.parse(event.body)

    const username = process.env.UN;
    const password = Buffer.from(process.env.PW, "base64").toString("ascii");

    console.log(username)

    //get user session
    const session = new UserSession({ username, password });
    await session.refreshSession();

    console.log(`Session token: ${session.token}`)

    //use changeUrl to get a statusUrl
    const changeUrl = decodeURIComponent(body[0].changesUrl);

    console.log("changeUrl: ", changeUrl)

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

        console.log("statusUrlResponse", statusUrlResponse);

        const statusUrlResponseJson = await statusUrlResponse.json();

        console.log("statusUrlResponseJson::::::::::::::");
        console.log(statusUrlResponseJson)

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

    console.log("we finished trying to fetch...", retryCount)
    console.log("resultUrl", resultUrl)



    const finalResponse = await fetch(
        `${resultUrl}?token=${session.token}`,
        {
            method: 'GET'
        }
    )

    console.log("we have a final response...")

    const finalResponseJson = await finalResponse.json();

    console.log(JSON.stringify(finalResponseJson))



    return { finalResponseJson };
}