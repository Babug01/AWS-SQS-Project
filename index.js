var SLACK_CONFIG = {
	path: {"team1":"/services/TRFAXNXUH/BRTFE0W5D/QoeNUTQ5qSXpSJdPogkabN6L",
		   "team2":"/services/TRFAXNXUH/BRR63T36G/uj1yhWICN6Xh1623g0p4m62t",
		   "team3":"/services/TRFAXNXUH/BRTRNRL5U/oiPXmKLfqAguMOp59bfqrJon"},
	username: "SQS-Queue-Monitor"
};
const aws_account_id = "223381430055";
const aws_accessKeyId = "AKIAJC22Y45HZZNEYQWSA";
const aws_secretAccessKey = "PMh8q0aI7xR7Y81obZfr1qMOVNaFoN35b+9krghu92";
const aws_region = "eu-west-1";
var sqs_webfile = "https://github.com/Babug01/AWS-SQS-Project/blob/master/queues.yaml";
//#######################################################
//#######################################################
const yaml = require('js-yaml');
const fs = require('fs');
const http = require ('https');
var AWS = require('aws-sdk');
const util = require('util');
const querystring = require ('querystring');

var sqs_file = "/tmp/" + Date.now() + ".yaml";

exports.handler = function(event, context) {
    AWS.config.update({
        accessKeyId: aws_accessKeyId,
        secretAccessKey: aws_secretAccessKey,
        region: aws_region
    });
    var sqs = new AWS.SQS();
    
    var queue_base_url = "https://"+aws_region+".queue.amazonaws.com/"+aws_account_id+"/";
    var file = fs.createWriteStream(sqs_file);
    var request = http.get(sqs_webfile, function(response) {
        response.pipe(file);
        file.on('finish', function() {
            //console.log("YAML loaded::");
            try {
            var doc = yaml.safeLoad(fs.readFileSync(sqs_file, 'utf8'));
            for(i=0;i < doc["sqs"].length; i++)
            {
                team_obj = doc["sqs"][i];
                for (var team_name in team_obj) {
                    //console.log("Team: "+team_name+"\n");
                    queues = team_obj[team_name];
                    for (j=0;j<queues.length;j++)
                    {
                        for (var queue in queues[j])
                        {
							//console.log("queue: " + queue + ", limit: " + queues[j][queue]);
							var limit = queues[j][queue];
                            if(queues[j][queue] != "x")
                            {
                                //console.log(queue_base_url+queue);
                                sqs.getQueueAttributes({
                                    QueueUrl: queue_base_url+queue,
                                    AttributeNames: ["ApproximateNumberOfMessages"]
                                }, function (err, result) {
                                    //console.log("$$$$$$$$$$$$");
                                    if (err !== null) {
                                        context.done('error', err);
									}
									var msg_count = parseInt(stripAlphaChars(util.inspect(result["Attributes"]["ApproximateNumberOfMessages"])),10);
									//console.log("Team: "+this.team_name+", Queue: " + this.queue + ", length:"+ msg_count+", limit: " +this.limit);
									if(msg_count > this.limit)
									{
										var messages = "` messages!";
										if(msg_count == 1)
											messages = "` message!"
										alert_msg = "The queue: `" + this.queue + "` has `" + msg_count + messages;
										sendSlackAlert(this.team_name, alert_msg);
									}
								}.bind({team_name: team_name,queue: queue,limit:limit})
							    );
                            }
                        }
                    }
                }
            }
            } catch (err) {
                context.done('error', err);
            }
            //context.done(null, 'done!');
        });
        
    });
};


function stripAlphaChars(source) { 
	var out = source.replace(/[^0-9]/g, ''); 
	return out; 
}



function sendSlackAlert(channel,msg)
{
	console.log("Hi "+channel+" "+msg);
	var mention = "<@channel>";
	var severity = "INFO";
	var color = "#F35A00";

	var alarmMessage = mention+": "+ msg;
	var payloadStr = JSON.stringify({
		"attachments": [
			{
				"fallback": alarmMessage,
				"text": alarmMessage,
				"mrkdwn_in": ["text"],
				"username": SLACK_CONFIG.username,
				"color": color
			}
		],
			"channel":"#"+channel
		});
		var postData = querystring.stringify({
		"payload": payloadStr
		});
		console.log(postData);
		var options = {
			hostname: "hooks.slack.com",
			port: 443,
			path: SLACK_CONFIG.path[channel],
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': postData.length
			}
		};

		var req = http.request(options, function(res) {
			console.log("Got response: " + res.statusCode);
			res.on("data", function(chunk) {
				console.log('BODY: '+chunk);
				//context.done(null, 'done!');
			});
		}).on('error', function(e) {
			context.done('error', e);
		});
		req.write(postData);
		req.end();
}
