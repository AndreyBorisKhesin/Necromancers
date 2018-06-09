from flask import Flask, request, redirect
import twilio.twiml
from twilio.twiml.messaging_response import MessagingResponse
from twilio.rest import Client

app = Flask(__name__)

@app.route('/', methods = ['POST'])
def hello_monkey():
	resp = MessagingResponse()
	resp.message('Your phone number is ' + request.values.get('From') + '.')
	return str(resp)

if __name__ == "__main__":
    app.run()
