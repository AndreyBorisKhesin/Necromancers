from apscheduler.schedulers.background import BackgroundScheduler
import datetime
from flask import Flask, request, redirect, jsonify
from flask_cors import CORS
from json import loads
import math
import random
import requests
import twilio.twiml
from twilio.twiml.messaging_response import MessagingResponse
from twilio.rest import Client

client = Client("AC4e7890114509da5929a4bc79ebf8bdc0",
		"47ee8d75ad0e2973601122c2a65d7b7c")

app = Flask(__name__)
CORS(app)

database = {}
comments = {}
new_event_id = -1
subscribers = {"+16475153544"}
# This has a sample user.
# They want to be alerted via text, for all crimes that occur.

def distance(loc, event):
	x_loc = loc[0]
	y_loc = loc[1]
	x_event = event[2]
	y_event = event[3]
	sq = lambda x: x*x
	return math.sqrt(sq((x_loc - x_event) * 1000000 / 9) + sq((y_loc - y_event) * 80392.3585722))

def alert(subscriber, event_tuple, dist):
	# Alert the given subscriber to an event that happened.
	# Parse the subscriber's notification preferences.
	# Then, send them an alert if the event satisfies it,
	# in the desired format for them.
	msg = '' + event_tuple[0] + ' has been reported ' + str(int(dist) + random.randint(3,10)) + ' metres from you.'
	client.messages.create(to = subscriber,
		from_ = '+16473609652',
		body = msg)
	return None

def add_event(event_tuple, no_alert=True):
	if event_tuple[4] in database:
		return event_tuple[4]

	print(event_tuple)
	database[event_tuple[4]] = event_tuple

	if event_tuple[4] not in comments:
		comments[event_tuple[4]] = []

	dist = distance([43.6576163,-79.3812037], [0, 0, event_tuple[2], event_tuple[3]])
	if not no_alert and dist < 0:
		for subscriber in subscribers:
			alert(subscriber, event_tuple, dist)
	return event_tuple[4]

@app.route('/incidents', methods = ['POST'])
def incidents():
	data = loads(request.data.decode('utf-8'))
	n = data.get('n', 20)
	vlist = sorted(map(lambda x: (
			distance((data['lat'],data['lng']),x) + (datetime.datetime.now() - x[6]).total_seconds() / 18,
			distance((data['lat'],data['lng']),x),
			x),
		database.values()))
	if len(vlist) >= n:
		return jsonify(list(map(lambda x: {
				'dist_from_you': int(x[1]) + random.randint(3,10),
				'emerg_type': x[2][0],
				'time': x[2][1].strftime("%I:%M %p"),
				'lat': x[2][2],
				'lng': x[2][3],
				'id': x[2][4],
				'date': x[2][5].strftime("%b %d %Y")
			},
			vlist[:n])))
	else:
		return jsonify([{
			'dist_from_you': 1,
			'emerg_type': 'Breaking and entering',
			'time': '12:56 PM',
			'date': 'Jun 10 2018'
		}, {
			'dist_from_you': 4,
			'emerg_type': 'Holding one with trouble',
			'time': '10:14 AM',
			'date': 'Jun 10 2018'
		}])

@app.route('/incident_data', methods = ['POST'])
def incident_data():
	data = loads(request.data.decode('utf-8'))
	event_id = data.get('id', 0)
	if event_id == 0 or event_id not in database:
		# TODO: What to return in case of an error?
		return jsonify([])
	event_data = (lambda x: (
		distance((data['lat'],data['lng']),x) + (datetime.datetime.now() - x[6]).total_seconds() / 18,
		distance((data['lat'],data['lng']),x),
		x))(database[event_id])
	return jsonify((lambda x: {
				'dist_from_you': int(x[1]) + random.randint(3,10),
				'emerg_type': x[2][0],
				'time': x[2][1].strftime("%I:%M %p"),
				'lat': x[2][2],
				'lng': x[2][3],
				'id': x[2][4],
				'date': x[2][5].strftime("%b %d %Y")
			})(event_data))

@app.route('/comments', methods = ['POST'])
def get_comments():
	data = loads(request.data.decode('utf-8'))
	event_id = data.get('id', 0)
	if event_id == 0 or event_id not in comments:
		comment_thread = []
	else:
		comment_thread = comments[event_id]
	return jsonify(comment_thread)

@app.route('/post_comment', methods = ['POST'])
def post_comment():
	data = loads(request.data.decode('utf-8'))
	name = data.get('name', 'Not Provided')
	# TODO: FIX TIME FORMAT
	dt = datetime.datetime.now()
	time = dt.strftime("%I:%M %p")
	date = dt.strftime("%b %d %Y")
	content = data.get('text', "")
	event_id = data.get('id', 0)
	if event_id == 0:
		return jsonify([])
	elif event_id not in comments:
		comments[event_id] = []
	comments[event_id].append({'name': name, 'time': time, 'date': date, 'text': content})
	return jsonify(comments[event_id])

@app.route('/report', methods = ['POST'])
def report_event():
	global new_event_id
	data = loads(request.data.decode('utf-8'))
	name = data.get('name', 'Not Provided')
	dt = datetime.datetime.now()
	type = data.get('type', 'Unknown').capitalize()
	text = data.get('text', None)
	lat = data['lat']
	lng = data['lng']
	add_event((type, dt, lat, lng, new_event_id, dt, datetime.datetime.now()), no_alert = False)
	if text is not None:
		dt = datetime.datetime.now()
		time = dt.strftime("%I:%M %p")
		date = dt.strftime("%b %d %Y")
		comments[new_event_id].append({'name': name, 'time': time, 'date': date, 'text': text})
	new_event_id -= 1
	return jsonify({'id': new_event_id+1})

@app.route('/', methods = ['POST'])
def sms_process():
	resp = MessagingResponse()
	from_num = request.values['From']
	if from_num is not None:
		subscribers.add(from_num)
	print('Subscribers: ' + str(subscribers))
	resp.message('Thank you! You will now receive notifications for nearby incidents.')
	return str(resp)

def parse_event(event):
	type = event['attributes']['TYP_ENG'].capitalize()
	lat = event['geometry']['y']
	long = event['geometry']['x']
	dt = datetime.datetime.strptime(event['attributes']['ATSCENE_TS'], "%Y.%m.%d %H:%M:%S")
	time = dt.time()
	id = event['attributes']['OBJECTID']
	date = dt.date()
	return (type, time, lat, long, id, date, dt)

def scrape(no_alert=False):
	global database
	with app.app_context():
		url = "http://c4s.torontopolice.on.ca/arcgis/rest/services/CADPublic/C4S/MapServer/0/query?f=json&where=1%3d1&outfields=*&outSR=4326"
		results = loads(requests.post(url).text)
		print("--------")
		print(datetime.datetime.now())
		for result in results['features']:
			add_event(parse_event(result), no_alert)

@app.before_first_request
def init_scraper():
	scrape(no_alert=True)
	apsched = BackgroundScheduler()
	apsched.start()

	apsched.add_job(scrape, trigger="interval", minutes=1)

if __name__ == "__main__":
	app.run()
