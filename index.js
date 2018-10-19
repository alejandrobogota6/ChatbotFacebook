'use strict';

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')

const app = express()

// weatherman fb page
const token = "EAAKth61pKuQBAEwGklC5zRVGFBSQ9bc29ix9BZBtNZBwUt3tHHcZA5ZC39fI5TAqZBzYFOd8tujQu09ZBwdbIjGscfdUe5R9uFDk1RH5pDbzA3s8VuoXbtK2eBqQ1M3oOsCdv2ZBab70g7u6xFDsdxaS0zz7WGUSZAquoHDn8GBcxQZDZD";

const msngerServerUrl = 'https://usergiochatbot.herokuapp.com/bot';

app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

app.use(express.static('public'))

// Index route
app.get('/', function (req, res) {
    res.send('Hello world, I am Weatherman!.')
})

// for Facebook verification
app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === 'iam-weatherman-bot') {
        res.send(req.query['hub.challenge'])
    }
    res.send('Error, wrong token')
})

// Spin up the server
app.listen(app.get('port'), function () {
    console.log('running on port', app.get('port'))
})


//FBM webhook
app.post('/webhook/', function (req, res) {
    console.log(JSON.stringify(req.body));
    let messaging_events = req.body.entry[0].messaging
    for (let i = 0; i < messaging_events.length; i++) {

        let event = req.body.entry[0].messaging[i]
        let sender = event.sender.id

        let recipient = event.recipient.id
        let time = req.body.entry[0].time

        // we call the MessengerBot here..
        if (event.message && event.message.text) {
            let text = event.message.text
            //send it to the bot
            request({
                url: msngerServerUrl,
                method: 'POST',
                form: {
                    'userUtterance': text
                }
            },
                    function (error, response, body) {
                        //response is from the bot
                        if (!error && response.statusCode == 200) {
                            // Print out the response body
                            //console.log(body)
                            body = body.substring(1, body.length - 1);
                            body = body.replace(/\\/g, '')
                            console.log(body)
                            let botOut = JSON.parse(body)

                            if (botOut.botUtterance != null) {
                                sendTextMessage(sender, botOut.botUtterance)
                            }
                        } else {
                            sendTextMessage(sender, 'Error!')
                        }
                    });
        }
    }


    res.sendStatus(200)
})

function sendTextMessage(sender, text) {
    if (text != 'null') {
        let messageData = { 'text':text
            
        }
            
        request({
            url: 'https://graph.facebook.com/v2.6/me/messages',
            qs: {access_token: token},
            method: 'POST',
            json: {
                recipient: {id: sender},
                message: messageData,

            }
        }, function (error, response, body) {
            if (error) {
                console.log('Error sending messages: ', error)
            } else if (response.body.error) {
                console.log('Error: ', response.body.error)
            }
        })
    }
}


//                              envio de una imagen 
// let messageData = {"attachment": {
//                "type": "image",
//                "payload": {
//                    "url": "https://www.google.com.co/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png"
//                }
//            }
//        }

//                                   botones
//let messageData = {
//            "attachment": {
//                "type": "template",
//                "payload": {
//                    "template_type": "button",
//                    "text": "What do you want to do next?",
//                    "buttons": [
//                        {
//                            "type": "web_url",
//                            "url": "https://www.messenger.com",
//                            "title": "Visit Messenger"
//                        },
//                        {
//                            "type": "postback",   //error en el tipo postback
//                            "title": "Weather this weekend",
//                            "payload": "PAYLOAD_WEEKEND_LONDON"
//                        },
//                        {
//                            "type": "Goto Website",
//                            "url": "https://myweather.com/london",
//                            "title": "More Info"
//                        }
//                    ]
//                }
//            }
//        }
