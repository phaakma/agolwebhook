export const dependencies = {
    fetch: null,
    UserSession: null,
    allowedOrigins: null,
    crypto: null
}



export const call = async (event, context) => {

    console.log("made it into the processEvent method...")

    const { fetch, UserSession, allowedOrigins, crypto } = dependencies;
    const body = JSON.parse(event.body)


    //verify the Webhook with HMAC
    const { webhook_id } = event.pathParameters;
    const secret_key = await getSecretKey(webhook_id);
    const signature = event.headers["x-esriHook-Signature"];
    const hash = crypto
        .createHmac('sha256', secret_key)
        .update(event.body)
        .digest('base64');
    if (`sha256=${hash}` !== decodeURIComponent(signature)) {
        throw new Error(`HMAC Authenticity FAILED!!!`);
    }
    console.log(`HMAC Authenticity verified `)


    const username = process.env.UN;
    const password = Buffer.from(process.env.PW, "base64").toString("ascii");

    //get user session
    const session = new UserSession({ username, password });
    await session.refreshSession();

    console.log(`Session token: ${session.token}`)

    //use changeUrl to get a statusUrl
    const changeUrl = decodeURIComponent(body[0].changesUrl);

    console.log(changeUrl)

    const statusUrlResponse = await fetch(
        `${changeUrl}&f=json&token=${session.token}`,
        {
            method: "GET",
        }
    )

    const response = await statusUrlResponse.json();

    console.log(response);

    const statusUrl = response.statusUrl;



    //wait a short period for json object to become available.


    //use statusUrl to get the resultUrl which is a json object of the attribute information






    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Origin": "https://survey123.arcgis.com",
            "Access-Control-AllowMethods": "OPTIONS,POST,GET",
            "Access-Control-Allow-Credentials": true,
        },
        body: event.body,
    };
};

const getSecretKey = async (webhook_id) => {
    //just a mock database

    const secret_key_database = {
        "0c4ce050-48da-4fc1-9c11-8fc2e42de1f0": "bananas"
    }

    return secret_key_database[webhook_id];
}