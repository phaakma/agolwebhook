# Serverless Use Webhooks with ArcGIS Online


Setting up a webhook:
https://www.esri.com/arcgis-blog/products/arcgis-online/sharing-collaboration/how-to-create-a-hosted-feature-service-webhook/

That link shows how to set one up and link it to Integromat

REST API Documentation:
https://developers.arcgis.com/rest/services-reference/online/web-hooks-create-feature-service-.htm



Webhook samples for the admin webhooks, includes local python and node servers too.
https://github.com/Esri/webhooks-samples


This one shows setting up a webhook with AWS Lambda, but only the admin webhooks, not feature services.
https://www.esri.com/arcgis-blog/products/arcgis-enterprise/administration/webhooks-dev-summit-2019/


This is a blog on integrating ArcGIs Survey123 with AWS Lambda. It focuses on using the AWS GUI though. It does have helpful notes on CORS etc so need to read.
https://www.esri.com/arcgis-blog/products/survey123/developers/integrating-arcgis-survey123-with-aws-lambda/

This blog from cartolab was helpful for understanding how to verify the secret key with HMAC using Nodejs.
https://www.cartolab.com/blog/secure-arcgis-feature-service-webhooks-with-node.js


https://community.esri.com/t5/python-questions/verifying-webhook-secret/td-p/1031099

