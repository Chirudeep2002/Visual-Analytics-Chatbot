from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from openai import OpenAI
import os

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

# ✅ Create OpenAI client pointing to OpenRouter
client = OpenAI(
    api_key="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",
    base_url="https://openrouter.ai/api/v1"
)

@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        print("✅ Received data:", data)

        role = data.get('role', 'user')
        message = data.get('message', '')

        if not message:
            return jsonify({'reply': "❗ No message received."})

        print(f"📨 Sending to OpenRouter as role: {role}")

        response = client.chat.completions.create(
            model="openai/gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": f"You are a helpful assistant specialized for {role}s."},
                {"role": "user", "content": message}
            ]
        )

        reply = response.choices[0].message.content.strip()
        print("🤖 Bot reply:", reply)

        return jsonify({'reply': reply})

    except Exception as e:
        print("❗ ERROR during chat:", e)
        return jsonify({'reply': "❗ Sorry, something went wrong while processing your request."}), 500

@app.route('/upload', methods=['POST'])
def upload():
    try:
        if 'file' not in request.files:
            return "❗ No file part in the request.", 400
        file = request.files['file']
        if file.filename == '':
            return "❗ No selected file.", 400

        uploads_folder = 'uploads'
        if not os.path.exists(uploads_folder):
            os.makedirs(uploads_folder)
        file.save(os.path.join(uploads_folder, file.filename))

        print(f"📂 File uploaded: {file.filename}")
        return "✅ File uploaded successfully", 200

    except Exception as e:
        print("❗ ERROR during file upload:", e)
        return "❗ Error uploading file.", 500

if __name__ == '__main__':
    if not os.path.exists('uploads'):
        os.makedirs('uploads')
    app.run(debug=True)
