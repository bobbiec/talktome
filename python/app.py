from flask import Flask, request

app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def hello_world():
    if request.method == 'POST':
        # print(request.json or request.content)
        event = request.json
        if event['type'] == 'url_verification':
            return event['challenge']
        elif event['type'] == 'event_callback':
            # can only handle user change right now
            e = event['event']
            assert e['type'] == 'user_change'
            print(f"New status is: {e['user']['profile']['status_text']}")
    return 'Hello, world!'


if __name__ == '__main__':
    app.run(host='0.0.0.0', port='5000')
