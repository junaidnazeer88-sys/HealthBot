from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os
import sys

# ── Load environment variables ──────────────────────────────────
load_dotenv()

# ── FIX: Import Resolution ──────────────────────────────────────
# This tells Python to look inside the 'ml' folder for 'routes'
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

def create_app():
    app = Flask(__name__)

    # ── CORS ───────────────────────────────────────────────────────
    allowed_origins = os.getenv('CLIENT_URL', '*').split(',')
    CORS(app, origins=allowed_origins)

    # ── ML Model Path ─────────────────────────────────────────────
    model_path = os.path.join(current_dir, 'models', 'disease_model.pkl')

    # ── AUTO-TRAIN LOGIC ──────────────────────────────────────────
    if not os.path.exists(model_path):
        print('=' * 50)
        print('Model not found — starting auto-train...')
        print('=' * 50)
        try:
            sys.path.insert(0, current_dir)
            from services.train_model import main as train_main
            train_main()
            print('Model trained successfully!')
        except Exception as e:
            print(f'Training failed: {e}')
    else:
        print(f'Model found at: {model_path}')

    # ── Register ML Blueprints ────────────────────────────────────
    # Note: Authentication is handled by your Node.js server, not here.
    try:
        from routes.predict  import predict_bp
        from routes.severity import severity_bp
        
        # We add /api prefix to match your frontend calls
        app.register_blueprint(predict_bp,  url_prefix='/api')
        app.register_blueprint(severity_bp, url_prefix='/api')
    except ImportError as e:
        print(f"Import Error: {e}. Check if __init__.py exists in routes folder.")

    # ── Health check endpoint ──────────────────────────────────────
    @app.route('/health')
    def health():
        model_exists = os.path.exists(model_path)
        return {
            'status': 'HealthBot ML service running',
            'version': '1.2.0',
            'model_loaded': model_exists,
        }

    @app.route('/')
    def index():
        return {"message": "HealthBot ML API Gateway is active."}

    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('PORT', 5000))
    is_production = os.getenv('FLASK_ENV', 'production') == 'production'
    
    print(f'Starting HealthBot ML service on port {port}')
    app.run(host='0.0.0.0', port=port, debug=not is_production)