from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os
import subprocess

# Load environment variables from .env
load_dotenv()

def create_app():
    app = Flask(__name__)
    
    # Configure CORS: Trust your Node.js backend URL specifically
    # In production, ALLOWED_ORIGINS should be your Render backend link
    CORS(app, origins=os.getenv('ALLOWED_ORIGINS', '*').split(','))

    # --- AUTO-TRAIN LOGIC (Crucial for Render) ---
    # This checks if the model exists. If not, it trains it on the first deploy.
    model_path = os.path.join('models', 'disease_model.pkl')
    if not os.path.exists(model_path):
        print('🚀 Model not found - Starting Auto-Train (this takes ~2 mins)...')
        try:
            # Runs your training script as a separate process
            subprocess.run(
                ['python', 'services/train_model.py'],
                check=True, 
                timeout=300
            )
            print('✅ Model trained and saved successfully!')
        except Exception as e:
            print(f'❌ Training failed: {e}')

    # Import blueprints inside the function to avoid circular imports
    from routes.predict import predict_bp
    from routes.severity import severity_bp

    # Register blueprints
    app.register_blueprint(predict_bp)
    app.register_blueprint(severity_bp)

    @app.route('/health')
    def health():
        return {'status': 'HealthBot ML service running', 'version': '1.2.0'}

    return app

if __name__ == '__main__':
    app = create_app()
    # Use the PORT provided by Render
    port = int(os.environ.get('PORT', 5000))
    print(f'🔥 HealthBot ML service starting on port {port}')
    app.run(host='0.0.0.0', port=port, debug=True)