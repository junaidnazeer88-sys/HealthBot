# ml/services/train_model.py
# Full training pipeline — Random Forest + evaluation + save
# Run from ml/ folder with venv active:
#   python services/train_model.py

import pandas as pd
import numpy as np
import json
import joblib
import os
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score, classification_report,
    confusion_matrix, f1_score
)
from sklearn.model_selection import cross_val_score

# ── Paths ──────────────────────────────────────────────────────────
TRAIN_CSV  = 'data/train_clean.csv'
TEST_CSV   = 'data/test_clean.csv'
META_JSON  = 'data/metadata.json'
MODEL_OUT  = 'models/disease_model.pkl'
META_OUT   = 'models/model_metadata.json'
TARGET_COL = 'prognosis'

def load_data():
    print('Loading cleaned dataset...')
    train = pd.read_csv(TRAIN_CSV)
    test  = pd.read_csv(TEST_CSV)

    with open(META_JSON) as f:
        meta = json.load(f)

    symptom_cols = meta['symptom_columns']

    X_train = train[symptom_cols].values
    y_train = train[TARGET_COL].values
    X_test  = test[symptom_cols].values
    y_test  = test[TARGET_COL].values

    print(f'Train: {X_train.shape} | Test: {X_test.shape}')
    return X_train, y_train, X_test, y_test, meta

def train_model(X_train, y_train):
    print()
    print('Training Random Forest Classifier...')
    print('Parameters: 100 trees, max_depth=15, class_weight=balanced')

    model = RandomForestClassifier(
        n_estimators=100,       # 100 decision trees in the forest
        max_depth=15,           # max depth per tree — prevents overfitting
        min_samples_split=5,    # min samples needed to split a node
        min_samples_leaf=2,     # min samples in a leaf node
        class_weight='balanced',# handles any class imbalance automatically
        random_state=42,        # reproducible results
        n_jobs=-1,              # use all CPU cores for faster training
    )

    model.fit(X_train, y_train)
    print('Training complete!')
    return model

def evaluate_model(model, X_train, y_train, X_test, y_test, meta):
    print()
    print('=== Model Evaluation ===')

    # Training accuracy
    train_preds = model.predict(X_train)
    train_acc   = accuracy_score(y_train, train_preds)
    print(f'Training accuracy : {train_acc:.4f} ({train_acc*100:.1f}%)')

    # Test accuracy
    test_preds = model.predict(X_test)
    test_acc   = accuracy_score(y_test, test_preds)
    print(f'Test accuracy     : {test_acc:.4f} ({test_acc*100:.1f}%)')

    # F1 Score
    f1 = f1_score(y_test, test_preds, average='weighted')
    print(f'F1 Score          : {f1:.4f}')

    # 5-fold cross validation
    print()
    print('Running 5-fold cross-validation (this takes ~30 seconds)...')
    cv_scores = cross_val_score(model, X_train, y_train, cv=5, scoring='accuracy')
    print(f'CV Mean Accuracy  : {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})')

    # Per-disease accuracy (top 10)
    diseases     = meta['idx_to_disease']
    print()
    print('Classification report (first 10 diseases):')
    disease_names = [diseases[str(i)] for i in range(len(diseases))]
    print(classification_report(
        y_test, test_preds,
        labels=list(range(min(10, len(disease_names)))),
        target_names=disease_names[:10]
    ))

    return {
        'train_accuracy': round(float(train_acc), 4),
        'test_accuracy' : round(float(test_acc), 4),
        'f1_score'      : round(float(f1), 4),
        'cv_mean'       : round(float(cv_scores.mean()), 4),
        'cv_std'        : round(float(cv_scores.std()), 4),
    }

def get_feature_importance(model, meta):
    """Top 20 most important symptoms for prediction."""
    symptom_cols = meta['symptom_columns']
    importances  = model.feature_importances_
    pairs        = sorted(
        zip(symptom_cols, importances),
        key=lambda x: x[1],
        reverse=True
    )
    print()
    print('Top 10 most important symptoms:')
    for symptom, importance in pairs[:10]:
        bar = '█' * int(importance * 200)
        print(f'  {symptom:<35} {importance:.4f} {bar}')

    return [{'symptom': s, 'importance': round(float(i), 4)}
            for s, i in pairs[:20]]

def save_model(model, metrics, top_features, meta):
    os.makedirs('models', exist_ok=True)

    # Save the trained model
    joblib.dump(model, MODEL_OUT)
    print(f'Model saved → {MODEL_OUT}')

    # Save model metadata (metrics + feature importance)
    model_meta = {
        'model_type'      : 'RandomForestClassifier',
        'n_estimators'    : 100,
        'max_depth'       : 15,
        'n_symptoms'      : meta['n_symptoms'],
        'n_diseases'      : meta['n_diseases'],
        'diseases'        : meta['diseases'],
        'idx_to_disease'  : meta['idx_to_disease'],
        'disease_to_idx'  : meta['disease_to_idx'],
        'symptom_columns' : meta['symptom_columns'],
        'metrics'         : metrics,
        'top_features'    : top_features,
    }
    with open(META_OUT, 'w') as f:
        json.dump(model_meta, f, indent=2)
    print(f'Metadata saved  → {META_OUT}')

def main():
    print('HealthBot — Random Forest Model Training')
    print('=' * 45)

    # Load data
    X_train, y_train, X_test, y_test, meta = load_data()

    # Train
    model = train_model(X_train, y_train)

    # Evaluate
    metrics = evaluate_model(model, X_train, y_train, X_test, y_test, meta)

    # Feature importance
    top_features = get_feature_importance(model, meta)

    # Save
    print()
    save_model(model, metrics, top_features, meta)

    print()
    print('=' * 45)
    print('Training complete!')
    print(f"Test accuracy  : {metrics['test_accuracy']*100:.1f}%")
    print(f"CV accuracy    : {metrics['cv_mean']*100:.1f}% (+/- {metrics['cv_std']*100:.1f}%)")
    print()
    print('Files created:')
    print('  models/disease_model.pkl      ← trained model')
    print('  models/model_metadata.json    ← metrics + disease list')
    print()
    print('Next step: connect to Flask /predict route')

if __name__ == '__main__':
    main()