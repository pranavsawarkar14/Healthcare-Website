from flask import Flask, request, jsonify, render_template, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from flask_cors import CORS
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

# Use environment variables for configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///appointments.sqlite3')
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-here')

app.app_context().push()
db = SQLAlchemy(app)

class Appointment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    date = db.Column(db.DateTime)
    address = db.Column(db.String(150))

db.create_all()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/contact')
def contact():
    return render_template('contactus.html')

@app.route('/learn')
def learn_more():
    return render_template('learn_more.html')

@app.route('/appointment')
def appointment():
    return render_template('appointment.html')

# API endpoint to get the API key (for frontend)
@app.route('/api/config')
def get_config():
    return jsonify({
        'googleApiKey': os.getenv('GOOGLE_API_KEY')
    })

# Ensure the appointments file is in the same directory as this script
CORS(app, resources={r"/book_appointment": {"origins": "*"}})
APPOINTMENTS_FILE = os.path.join(os.path.dirname(__file__), 'appointments.txt')

@app.route('/book_appointment', methods=['POST'])
def book_appointment():
    data = request.json
    required_fields = ['firstName', 'lastName', 'address', 'phone']
    
    missing_fields = [field for field in required_fields if field not in data]
    
    if missing_fields:
        return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400
    
    # Process the appointment booking here
    firstName = data['firstName']
    lastName = data['lastName']
    address = data['address']
    phone = data['phone']
    new_appointment = Appointment(name=firstName+lastName, phone=phone, address=address)
    db.session.add(new_appointment)
    db.session.commit()
    return jsonify({"message": "Appointment booked successfully"}), 200

if __name__ == '__main__':
    # For deployment: host='0.0.0.0' makes the server publicly available
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=os.getenv('FLASK_DEBUG', 'False').lower() == 'true')