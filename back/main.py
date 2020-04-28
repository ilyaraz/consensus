from flask import Flask, request
import json

app = Flask(__name__)

version = 0
snapshot_value = ''

@app.route('/back/handshake/')
def handshake():
    return json.dumps({'version': version, 'snapshotValue': snapshot_value})

@app.route('/back/propose/', methods=['POST'])
def propose():
    global version
    global snapshot_value
    r = json.loads(request.data)
    client_version = r['version']
    proposed_value = r['proposedValue']
    if client_version != version:
        return json.dumps({'accepted': False, 'version': version, 'snapshotValue': snapshot_value})
    else:
        version += 1
        snapshot_value = proposed_value
        return json.dumps({'accepted': True})

@app.route('/back/update/', methods=['POST'])
def update():
    global version
    global snapshot_value
    r = json.loads(request.data)
    client_version = r['version']
    if client_version != version:
        return json.dumps({'updated': True, 'version': version, 'snapshotValue': snapshot_value})
    else:
        return json.dumps({'updated': False})
