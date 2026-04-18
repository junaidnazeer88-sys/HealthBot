from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

def create_app():
    app = Flask(__name__)
    CORS(app, origins=os.getenv('ALLOWED_ORIGINS', 'http://localhost:3001'))

    # Import blueprints
    from routes.predict import predict_bp
    from routes.severity import severity_bp

    # Register blueprints - This fixes the 404 error
    app.register_blueprint(predict_bp)
    app.register_blueprint(severity_bp)

    @app.route('/health')
    def health():
        return {'status': 'HealthBot ML service running', 'version': '1.2.0'}

    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.getenv('PORT', 5000))
    print(f'🚀 HealthBot ML service starting on port {port}')
    app.run(host='0.0.0.0', port=port, debug=True)