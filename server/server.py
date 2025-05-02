from flask import Flask,jsonify,request
from prisma import Prisma
import asyncio
from asgiref.wsgi import WsgiToAsgi

app=Flask(__name__)

async def init_db():
    db = Prisma()
    await db.connect()
    return db

# Initialize the Prisma client
prisma = Prisma()

@app.before_request
async def connect_to_database():
    if not prisma.is_connected():
        await prisma.connect()

@app.teardown_request
async def disconnect_from_database(exception=None):
    if prisma.is_connected():
        await prisma.disconnect()


@app.route('/',methods=['GET'])
def home():
    return jsonify({"message":"Welcome to Alertic API"}),200


@app.route('/api/test', methods=['POST'])
async def test():
    data = request.json

    # Extract fields from the request body
    description = data.get('description')
    category = data.get('category')
    latitude = data.get('latitude')
    longitude = data.get('longitude')
    image = data.get('image')

    # Validate required fields
    if not all([description, category, latitude, longitude, image]):
        return jsonify({"error": "All fields (description, category, latitude, longitude, image) are required."}), 400

    # Create a new report in the database
    try:
        report = await prisma.report.create(
            data={
                'description': description,
                'category': category,
                'latitude': latitude,
                'longitude': longitude,
                'image': image
            }
        )
        return jsonify({"message": "Report created successfully", "report": report.dict()}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Wrap the Flask app with WsgiToAsgi for ASGI compatibility
asgi_app = WsgiToAsgi(app)


if __name__=='__main__':
    app.run(debug=True,port=5000)