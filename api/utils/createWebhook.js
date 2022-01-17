

const token = ""
const orgId = "hMYNkrKaydBeWRXE"
const serviceName = "Pest_Inspections"
const hookUrl = "https://34bjhmr728.execute-api.us-east-1.amazonaws.com/dev/hello"
const webhookName = "aws_lambda"
const changeTypes = "*"
const signatureKey = ""


const url = `https://services.arcgis.com/${orgId}/ArcGIS/rest/admin/services/${serviceName}/FeatureServer/WebHooks/create?token=${token}`


const payload = {
    name: webhookName,
    changeTypes: changeTypes,
    signatureKey: signatureKey,
    hookUrl: hookUrl,
    contentType: "application / json",
    payloadFormat: "json",
    active: "false",
    scheduleInfo: {
        "name": "",
        "startAt": 1620711894498,
        "state": "enabled",

        "recurrenceInfo": {
            "frequency": "second",
            "interval": 20
        }
    },
    f: "pjson",
    token: token
}