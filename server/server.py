from flask import Flask, request, redirect, jsonify
from flask_cors import CORS
from json import loads
import twilio.twiml
from twilio.twiml.messaging_response import MessagingResponse
from twilio.rest import Client

app = Flask(__name__)
CORS(app)

@app.route('/', methods = ['POST'])
def root():
	resp = MessagingResponse()
	resp.message('Your phone number is ' + request.values['From'] + '.')
	return str(resp)

@app.route('/incidents', methods = ['POST'])
def incidents():
	data = loads(request.data.decode('utf-8'))
	return jsonify({
		'dist_from_you': 2.1,
		'emerg_type': 'Breaking and Entering',
		'time': '12:56 PM',
		'maj_int': 'Yonge and Dundas',
	})

if __name__ == "__main__":
    app.run()
