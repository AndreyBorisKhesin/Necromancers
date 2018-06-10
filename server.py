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

database = {}
comments = {}
new_event_id = -1
subscribers = {"+16475153544": {
	"contact": {"type": "phone",
		"number": "+16475153544"},
	"options": {"types": "all"}}}
# This has a sample user.
# They want to be alerted via text, for all crimes that occur.

def distance(loc, event):
	x_loc = loc[0]
	y_loc = loc[1]
	x_event = event[2]
	y_event = event[3]
	sq = lambda x: x*x
	return math.sqrt(sq((x_loc - x_event) * 1000000 / 9) + sq((y_loc - y_event) * 80392.3585722))

def alert(subscriber, event_id):
	# Alert the given subscriber to an event that happened.
	# Parse the subscriber's notification preferences.
	# Then, send them an alert if the event satisfies it,
	# in the desired format for them.
	text = "Alert: A new crime ({type}) has been reported at {time} and {place}."
	pass

def add_event(event_tuple, no_alert=True):
	if event_tuple[4] in database:
		return event_tuple[4]

	print(event_tuple)
	database[event_tuple[4]] = event_tuple

	if event_tuple[4] not in comments:
		comments[event_tuple[4]] = []

	if not no_alert:
		for subscriber in subscribers:
			alert(subscriber, event_tuple[4])
	return event_tuple[4]

@app.route('/', methods = ['POST'])
def root():
	resp = MessagingResponse()
	resp.message('Your phone number is ' + request.values['From'] + '.')
	return str(resp)

@app.route('/incidents', methods = ['POST'])
def incidents():
	data = loads(request.data.decode('utf-8'))
	n = data.get('n', 10)
	vlist = sorted(map(lambda x: (
			distance((data['lat'],data['lng']),x) + (datetime.datetime.now() - x[1]).total_seconds() / 18,
			distance((data['lat'],data['lng']),x),
			x),
		database.values()))
	if len(vlist) >= n:
		return jsonify(list(map(lambda x: {
				'dist_from_you':int(x[1]),
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
		distance((data['lat'],data['lng']),x) + (datetime.datetime.now() - x[1]).total_seconds() / 18,
		distance((data['lat'],data['lng']),x),
		x))(database[event_id])
	return jsonify((lambda x: {
				'dist_from_you':int(x[1]),
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
	time = data.get('time', datetime.datetime.now().strftime("%Y.%m.%d %H:%M:%S"))
	content = data.get('text', "")
	event_id = data.get('id', 0)
	if event_id == 0:
		return jsonify([])
	elif event_id not in comments:
		comments[event_id] = []
	comments[event_id].append({'name': name, 'time': time, 'text': content})
	return jsonify(comments[event_id])

@app.route('/report', methods = ['POST'])
def report_event():
	global new_event_id
	data = loads(request.data.decode('utf-8'))
	name = data.get('name', 'Not Provided')
	time = data.get('time', datetime.datetime.now())
	type = data.get('type', 'Unknown').capitalize()
	text = data.get('text', None)
	lat = data['lat']
	lng = data['lng']
	add_event((type, time, lat, lng, new_event_id))
	if text is not None:
		time = data.get('time', datetime.datetime.now().strftime("%Y.%m.%d %H:%M:%S"))
		comments[new_event_id].append({'name': name, 'time': time, 'text': text})
	new_event_id -= 1
	return jsonify([])

@app.route('/sms', methods = ['POST'])
def sms_process():
	data = loads(request.data.decode('utf-8'))
	from_num = data.get('From', None)
	if from_num is not None:
		subscribers[from_num] = {}
	return jsonify([])

def parse_event(event):
	type = event['attributes']['TYP_ENG'].capitalize()
	lat = event['geometry']['y']
	long = event['geometry']['x']
	time = datetime.datetime.strptime(event['attributes']['ATSCENE_TS'], "%Y.%m.%d %H:%M:%S")
	id = event['attributes']['OBJECTID']
	return (type, time, lat, long, id)

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
