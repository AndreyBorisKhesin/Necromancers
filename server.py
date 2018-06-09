from apscheduler.schedulers.background import BackgroundScheduler
import datetime
from flask import Flask, request, redirect, jsonify
from flask_cors import CORS
from json import loads
import math
import requests
import twilio.twiml
from twilio.twiml.messaging_response import MessagingResponse
from twilio.rest import Client

app = Flask(__name__)
CORS(app)

database = set()

def distance(loc, event):
	x_loc = loc[0]
	y_loc = loc[1]
	t_loc = datetime.datetime.now()
	x_event = event[2]
	y_event = event[3]
	t_event = event[1]
	sq = lambda x: x*x
	# print(sq(x_loc - x_event))
	# print(sq(y_loc - y_event))
	# print(sq((t_loc - t_event).total_seconds()/60/60/100))
	# print(1/0)
	return math.sqrt(sq((x_loc - x_event) * 1000000 / 9) + sq((y_loc - y_event) * 80392.3585722))

@app.route('/', methods = ['POST'])
def root():
	resp = MessagingResponse()
	resp.message('Your phone number is ' + request.values['From'] + '.')
	return str(resp)

@app.route('/incidents', methods = ['POST'])
def incidents():
	data = loads(request.data.decode('utf-8'))
	vlist = sorted(map(lambda x: (distance((data['lat'],data['lng']),x) + (datetime.datetime.now() - x[1]).total_seconds() / 18,distance((data['lat'],data['lng']),x), x), list(database)))
	if len(vlist) != 0:
		print((data['lat'],data['lng']))
		print(vlist)
		return jsonify((lambda x: {
			'dist_from_you':x[1],
			'emerg_type': x[2][0],
			'time': str(x[2][1]),
			'maj_int': 'NULL'})(vlist[0]))
		# vlist[:5])))))
	else:
		return jsonify({
			'dist_from_you': 2.1,
			'emerg_type': 'Breaking and Entering',
			'time': '12:56 PM',
			'maj_int': 'Yonge and Dundas',
		})

def parse_event(event):
	type = event['attributes']['TYP_ENG']
	lat = event['geometry']['y']
	long = event['geometry']['x']
	time = datetime.datetime.strptime(event['attributes']['ATSCENE_TS'], "%Y.%m.%d %H:%M:%S")
	return (type, time, lat, long)

def scrape():
	global database
	with app.app_context():
		url = "http://c4s.torontopolice.on.ca/arcgis/rest/services/CADPublic/C4S/MapServer/0/query?f=json&where=1%3d1&outfields=*&outSR=4326"
		results = loads(requests.post(url).text)
		print("--------")
		print(datetime.datetime.now())
		for result in results['features']:
			event = parse_event(result)
			if event not in database:
				print(event)
				database.add(event)
		# vlist = sorted(map(lambda x: (distance((43.657771,-79.381107),x), x), list(database)))

@app.before_first_request
def init_scraper():
	apsched = BackgroundScheduler()
	apsched.start()

	apsched.add_job(scrape, trigger="interval", minutes=1)

if __name__ == "__main__":
	app.run()
