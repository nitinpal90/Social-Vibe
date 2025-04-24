from flask import Flask, render_template, jsonify, request
import random

app = Flask(__name__, template_folder='templates', static_folder='static')

def generate_mock_data(topic, platform, days):
    mock_data = {
        '#Mahakumbh': {
            'twitter': [(f"User{i+1}", f"@user{i+1}", f"{i+1}d ago", f"Post about #Mahakumbh {i+1}", 
                        'positive' if i % 3 == 0 else 'neutral' if i % 3 == 1 else 'negative', 
                        random.randint(0, 5000), random.randint(0, 500)) for i in range(15)],
            'facebook': [(f"FBUser{i+1}", f"fbuser{i+1}", f"{i+1}d ago", f"Facebook post about #Mahakumbh {i+1}", 
                         'positive' if i % 3 == 0 else 'neutral' if i % 3 == 1 else 'negative', 
                         random.randint(0, 3000), random.randint(0, 300)) for i in range(10)],
            'instagram': [(f"InstaUser{i+1}", f"@insta{i+1}", f"{i+1}d ago", f"Instagram post #Mahakumbh {i+1}", 
                          'positive' if i % 3 == 0 else 'neutral' if i % 3 == 1 else 'negative', 
                          random.randint(0, 10000), random.randint(0, 800)) for i in range(8)],
            'linkedin': [(f"Prof{i+1}", f"pro{i+1}", f"{i+1}d ago", f"Professional post about #Mahakumbh {i+1}", 
                         'positive' if i % 3 == 0 else 'neutral' if i % 3 == 1 else 'negative', 
                         random.randint(0, 2000), random.randint(0, 200)) for i in range(5)]
        },
        '#DelhiElection': {
            'twitter': [(f"PolUser{i+1}", f"@pol{i+1}", f"{i+1}d ago", f"Political tweet #DelhiElection {i+1}", 
                        'positive' if i % 3 == 0 else 'neutral' if i % 3 == 1 else 'negative', 
                        random.randint(0, 8000), random.randint(0, 1000)) for i in range(20)],
            'facebook': [(f"FBPol{i+1}", f"fbpol{i+1}", f"{i+1}d ago", f"FB post about #DelhiElection {i+1}", 
                         'positive' if i % 3 == 0 else 'neutral' if i % 3 == 1 else 'negative', 
                         random.randint(0, 5000), random.randint(0, 600)) for i in range(12)]
        },
        '#Budget2024': {
            'twitter': [(f"EconUser{i+1}", f"@econ{i+1}", f"{i+1}d ago", f"Tweet about #Budget2024 economic policies {i+1}", 
                        'positive' if i % 3 == 0 else 'neutral' if i % 3 == 1 else 'negative', 
                        random.randint(0, 7000), random.randint(0, 900)) for i in range(18)],
            'facebook': [(f"FBEcon{i+1}", f"fbecon{i+1}", f"{i+1}d ago", f"Facebook post discussing #Budget2024 {i+1}", 
                         'positive' if i % 3 == 0 else 'neutral' if i % 3 == 1 else 'negative', 
                         random.randint(0, 4000), random.randint(0, 500)) for i in range(15)],
            'linkedin': [(f"CorpUser{i+1}", f"corp{i+1}", f"{i+1}d ago", f"Professional analysis of #Budget2024 {i+1}", 
                         'positive' if i % 3 == 0 else 'neutral' if i % 3 == 1 else 'negative', 
                         random.randint(0, 2500), random.randint(0, 300)) for i in range(8)]
        },
        '#ClimateChange': {
            'twitter': [(f"EcoUser{i+1}", f"@eco{i+1}", f"{i+1}d ago", f"Environmental tweet about #ClimateChange {i+1}", 
                        'positive' if i % 3 == 0 else 'neutral' if i % 3 == 1 else 'negative', 
                        random.randint(0, 10000), random.randint(0, 1200)) for i in range(25)],
            'facebook': [(f"FBGreen{i+1}", f"fbgreen{i+1}", f"{i+1}d ago", f"Facebook post about #ClimateChange initiatives {i+1}", 
                         'positive' if i % 3 == 0 else 'neutral' if i % 3 == 1 else 'negative', 
                         random.randint(0, 6000), random.randint(0, 700)) for i in range(20)],
            'instagram': [(f"GreenInsta{i+1}", f"@green{i+1}", f"{i+1}d ago", f"Instagram post #ClimateChange awareness {i+1}", 
                          'positive' if i % 3 == 0 else 'neutral' if i % 3 == 1 else 'negative', 
                          random.randint(0, 15000), random.randint(0, 1000)) for i in range(15)]
        }
    }

    max_days = min(int(days), 30)
    posts = []
    
    if platform == 'all':
        for plat in mock_data.get(topic, {}):
            posts.extend(mock_data[topic][plat][:max_days])
    else:
        posts = mock_data.get(topic, {}).get(platform, [])[:max_days]

    # Calculate stats
    sentiments = [post[4] for post in posts]
    total = len(sentiments) or 1
    positive = round(len([s for s in sentiments if s == 'positive']) / total * 100)
    negative = round(len([s for s in sentiments if s == 'negative']) / total * 100)
    neutral = round(len([s for s in sentiments if s == 'neutral']) / total * 100)

    platforms = [post[0] for post in posts]
    platform_counts = {
        'twitter': len([p for p in platforms if 'User' in p or 'PolUser' in p or 'EconUser' in p or 'EcoUser' in p]),
        'facebook': len([p for p in platforms if 'FB' in p]),
        'instagram': len([p for p in platforms if 'Insta' in p]),
        'linkedin': len([p for p in platforms if 'Prof' in p or 'Corp' in p])
    }

    return {
        'posts': [{
            'platform': 'twitter' if 'User' in post[0] or 'PolUser' in post[0] or 'EconUser' in post[0] or 'EcoUser' in post[0] else
                      'facebook' if 'FB' in post[0] else
                      'instagram' if 'Insta' in post[0] else 'linkedin',
            'user': post[0],
            'handle': post[1],
            'time': post[2],
            'content': post[3],
            'sentiment': post[4],
            'likes': post[5],
            'comments': post[6]
        } for post in posts],
        'trending': [
            {'tag': '#Mahakumbh', 'count': 125000},
            {'tag': '#DelhiElection', 'count': 98000},
            {'tag': '#Budget2024', 'count': 87000},
            {'tag': '#ClimateChange', 'count': 65000}
        ],
        'stats': {
            'sentiment': {'positive': positive, 'negative': negative, 'neutral': neutral},
            'platforms': platform_counts
        }
    }

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/posts')
def get_posts():
    topic = request.args.get('topic', '#Mahakumbh')
    platform = request.args.get('platform', 'all')
    days = request.args.get('days', '30')
    data = generate_mock_data(topic, platform, days)
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)