# aws-lambda-monitor-sqs-slack
AWS Lambda function to monitor SQS queue to a Slack channel

<img width="200" src="https://github.com/Ismail-AlJubbah/aws-lambda-monitor-sqs-slack/raw/master/imgs/sqs.png"/>   <img width="100" src="https://github.com/Ismail-AlJubbah/aws-lambda-monitor-sqs-slack/raw/master/imgs/arrow.png"/>  <img width="200" src="https://github.com/Ismail-AlJubbah/aws-lambda-monitor-sqs-slack/raw/master/imgs/lambda.png"/>   <img width="100" src="https://github.com/Ismail-AlJubbah/aws-lambda-monitor-sqs-slack/raw/master/imgs/arrow.png"/>   <img width="200" src="https://github.com/Ismail-AlJubbah/aws-lambda-monitor-sqs-slack/raw/master/imgs/slack.png"/>

# Problem:

There are some SQS queues on amazon (+/- 10 queues, but the number of queues is growing every month). Queues are for different applications, different teams, and have different characteristics (error queues, different purposes, different thresholds etc.). The teams are responsible for adding new queues and specifying which queues are applicable to be monitored.

As a DevOps team we would like to monitor these queues by providing an automation solution which creates a monitor per queue according to a definition file where the queues are specified. So that we can be alerted whenever something goes wrong with the queues.

# Use case:
Team 1 queues:
test_devops_makelaars
test_devops_makelaars_errors
Team 2 queues:
test_devops_new_houses
test_devops_new_houses_errors
test_devops_edited_houses
test_devops_edited_houses_errors
test_devops_removed_houses
test_devops_removed_houses_errors
Team 3 queues:
test_devops_stats_phone_clicks
test_devops_stats_phone_clicks_errors
test_devops_stats_facebook_clicks
test_devops_stats_facebook_clicks_errors

# Solution
Most of the people preferred Slack as a communication platform between teams, sending a notification to a team Slack channel is a good way to integrate between the alarting system and team comunication.

Queue list are stored in yaml file and YAML is a human-readable structured data format. It is less complex and ungainly than XML or JSON, but provides similar capabilities.

A team can define thier queues in this simple YAML format:
   ```YAML
   - team2:
     - test_devops_new_houses: 10
     - test_devops_edited_houses: x
     - test_devops_removed_houses: x
     - test_devops_new_houses_errors: 0
     - test_devops_edited_houses_errors: 0
     - test_devops_removed_houses_errors: 0
   ```
The ERROR queue will have limit value `0`, where you can use `x` for the queue you want to skip.

AWS Lambda function will run every minute to check the defined queue in the YAML file stored in [Github](https://github.com/Babug01/AWS-SQS-Project/blob/master/queues.yaml), where stakeholder can edit it easily.

# Setup

Setup steps:
- Create Slack App and allow it to post to a team channel.
- Create AWS SQS Queues and IAM.
- Add the keys in Lambda source code.
- Create AWS Lambda function and delopy the code.
- Test it.

### First, let's start by creating a Slack App:
1. let's say you have the following Slack channels: `team1`, `team2`,`team3`; where the channel name is the same as your team name defined in the YAML file.

2. Then click on `+ Add an app`, or go to channel setting.

3. This will open Slack Admin panel on the browser; you have to have admin permission on your Slack team to access it, click on `Build'.

4. Click `Start Building` then `Create App`, chose your team and name the app `AWS-Watcher`; if you wish to have a diffrent name you should change the name in the source code as well.

5. On `Basic Information` click `Incoming Webhooks` under `Add features and functionality'. Activate it by swiping to `On`, then click the bottom button `Add New Webhook to Workspace`.

6. Select your team channel, to allow the app to post on it.Repeat the steps for all your teams defined in the YAML file, then copy all the Webhook URLs, we gonna use it in Lambda source code.

7. Go Back to Basic Information. Under `Display Information` add description, icon and backgorund color to your Slack App, then hit `Save Changes`. Finally, go back to your team Slack channel, you should see the integration message.

### Second, create AWS Queues and the IAM user:
1. On AWS Console, select a region, then `SQS` and create your queues and go to `IAM`, and create a new user with `Programmatic access'.
Click Next, select `Attach exisiting policies directly`, search for `sqs`, then select `AmazonSQSFullAccess`, this will allow this user to access the queues.Click Next, copy the Access Key ID and Secret access key, we gonna use them in AWS Lambda function.

### Third, Add the keys to Lambda:
1. Clone or Download this repo, open `index.js`, on top of the file you need to edit the variables of Slack Webhook URL and AWS keys:
<img width="900" src="https://github.com/Ismail-AlJubbah/aws-lambda-monitor-sqs-slack/raw/master/imgs/s3-1.png"/>

### Fourth, Create and Deploy AWS Lambda function:
1. On AWS Console, select a region, go to Lambda, click on `Author from scratch'.Name the function `Aws-sqs-queue-slack`, select `Choose an existing role` on Role, and `service-role/sqspoller` for Existing role, then hit `Create function`.

2. Compress the file `index.js` and the directory `node_modules` to a zip file.

3. Back to AWS console, on `Code entry type`, select `Upload a .ZIP file`, select the ZIP file from your machine. On `Triggers`, click, `Add trigger`. On `Rule`, select `Create a new rule`, for `Rule name` type `everymin`, for `Rule type` choose `Schedule expression`, type `rate(1 minute)`, then click `Submit` and Click `Save`.

### Test:
You can test using AWS Console or AWS CLI, I will show you how to test using the CLI:

## Nice!!
