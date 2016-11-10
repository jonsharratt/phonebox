[![Deploy to Docker Cloud](https://files.cloud.docker.com/images/deploy-to-dockercloud.svg)](https://cloud.docker.com/stack/deploy/)

**NOTE:**

**Currently Docker Cloud requires you to be logged in before clicking the above `Deploy to Cloud` button, you will get a 404 otherwise.**

* * *

#phonebox

### Simple support rotas for on call engineers.

Phonebox allows you to manage on call engineer rotas effectivley and easily.  It will call engineers when issues arise within your application.

#### Setup

##### Docker Cloud
Create up a Docker Cloud account if you don't already have one and link a provider and provision your relevant node cluster and nodes.  If you don't already use Docker Cloud then you won't need much in your cluster to run phonebox.

[Getting Started with Docker Cloud](https://docs.docker.com/docker-cloud/getting-started/)

##### Twilio Account
Second thing to create is a Twilio account and get the following details so that you can set the relevant environment variables when deploying to Docker Cloud.

1. Account SID
2. Auth Token
3. Purchased Registered Phone Number

![Image of Twilkio](https://s3-eu-west-1.amazonaws.com/learn.craftship.io/twilio_details.png)


#### Setup / Deploy Phonebox
You can simply use Docker Cloud to get up and running with which ever provider you currently are using in your organisation.  Docker Cloud was chosen for this reason.  You just need to link you account with Docker Cloud, whilst logged in click the "Deploy to Cloud" button at the top of the README.

In the `Stacks / Wizard` populate the following `ENV` variables:

`TWILIO_SID=` Twilio Account SID

`TWILIO_TOKEN=` Twilio Auth Token

`TWILIO_FROM_NUMBER=` Twilio, Registered Phone Number in Account

####

**Thats it!**

#### Managing Rotas
Currently to manage the rotas you just need to update the [rota.json](https://github.com/craftship/phonebox/blob/master/src/workers/rota.json) file and re-depoly the workers.

By default it will phone and text message people within the rota.

#### Supported Third Party Hooks
The following list will expand as more and more hooks / ingress workers are created to support how alerts are texted and spoken over the phone.

The base url is always the api in your Docker Cloud stack e.g. `http://api.phonebox.123456abc.svc.dockerapp.io`:

![Image of Docker Cloud Dashboard](https://s3-eu-west-1.amazonaws.com/learn.craftship.io/docker_url.png)

## New Relic Web Hook

You can setup in your alerts of New Relic a custom webhook and add the relevant base url with the following path:

`http://api.phonebox.[your_uid].svc.dockerapp.io/ingress/newrelic`

* * *

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)


