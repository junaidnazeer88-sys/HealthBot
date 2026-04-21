from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os
import sys

# Load environment variables from .env
load_dotenv()

def create_app():
    app = Flask(__name__)

    # ── CORS ───────────────────────────────────────────────────────
    # In production, set ALLOWED_ORIGINS to your Render backend URL
    # e.g. https://healthbot-backend.onrender.com
    allowed_origins = os.getenv('ALLOWED_ORIGINS', '*').split(',')
    CORS(app, origins=allowed_origins)

    # ── AUTO-TRAIN LOGIC ───────────────────────────────────────────
    # Checks if the trained model exists.
    # If not, trains it directly (no subprocess — safer on Render free tier).
    model_path = os.path.join(
        os.path.dirname(os.path.abspath(__file__)),
        'models', 'disease_model.pkl'
    )

    if not os.path.exists(model_path):
        print('=' * 50)
        print('Model not found — starting auto-train...')
        print('This runs once and takes about 2 minutes.')
        print('=' * 50)
        try:
            # Import and call train directly — no subprocess needed
            sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
            from services.train_model import main as train_main
            train_main()
            print('Model trained and saved successfully!')
        except Exception as e:
            print(f'Training failed: {e}')
            print('HealthBot will use fallback responses until model is ready.')
    else:
        print(f'Model found at: {model_path}')

    # ── Register route blueprints ──────────────────────────────────
    # Imported inside function to avoid circular imports
    from routes.predict  import predict_bp
    from routes.severity import severity_bp

    app.register_blueprint(predict_bp)
    app.register_blueprint(severity_bp)

    # ── Health check endpoint ──────────────────────────────────────
    @app.route('/health')
    def health():
        model_exists = os.path.exists(model_path)
        return {
            'status'      : 'HealthBot ML service running',
            'version'     : '1.2.0',
            'model_loaded': model_exists,
            'environment' : os.getenv('FLASK_ENV', 'production'),
        }

    return app


if __name__ == '__main__':
    app = create_app()

    port = int(os.environ.get('PORT', 5000))

    # debug=True locally, debug=False on Render (where FLASK_ENV=production)
    debug = os.getenv('FLASK_ENV', 'production') != 'production'

    print(f'HealthBot ML service starting on port {port}')
    print(f'Debug mode: {debug}')

    app.run(host='0.0.0.0', port=port, debug=debug)