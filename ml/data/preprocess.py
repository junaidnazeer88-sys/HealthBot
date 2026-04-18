# ml/data/preprocess.py
# Cleans and prepares the raw dataset for model training
# Run: python data/preprocess.py

import pandas as pd
import numpy as np
import json
import os

RAW_TRAIN = 'data/Training.csv'
RAW_TEST  = 'data/Testing.csv'
OUT_TRAIN = 'data/train_clean.csv'
OUT_TEST  = 'data/test_clean.csv'
OUT_META  = 'data/metadata.json'

def preprocess():
    print('Loading raw dataset...')
    train = pd.read_csv(RAW_TRAIN)
    test  = pd.read_csv(RAW_TEST)

    # ── Step 1: Clean column names ──────────────────────────────────
    # Remove leading/trailing spaces and underscores
    train.columns = [c.strip().replace('_', ' ').lower() for c in train.columns]
    test.columns  = [c.strip().replace('_', ' ').lower() for c in test.columns]

    print(f'Raw train shape : {train.shape}')
    print(f'Raw test shape  : {test.shape}')

    # ── Step 2: Separate features and target ───────────────────────
    TARGET = 'prognosis'
    symptom_cols = [c for c in train.columns if c != TARGET]

    X_train = train[symptom_cols]
    y_train = train[TARGET]
    X_test  = test[symptom_cols]
    y_test  = test[TARGET]

    # ── Step 3: Fill missing values with 0 ────────────────────────
    X_train = X_train.fillna(0).astype(int)
    X_test  = X_test.fillna(0).astype(int)

    # ── Step 4: Encode target labels ──────────────────────────────
    diseases = sorted(y_train.unique().tolist())
    disease_to_idx = {d: i for i, d in enumerate(diseases)}
    idx_to_disease = {i: d for d, i in disease_to_idx.items()}

    y_train_enc = y_train.map(disease_to_idx)
    y_test_enc  = y_test.map(disease_to_idx)

    # ── Step 5: Save cleaned datasets ─────────────────────────────
    train_clean = X_train.copy()
    train_clean[TARGET] = y_train_enc
    test_clean  = X_test.copy()
    test_clean[TARGET]  = y_test_enc

    train_clean.to_csv(OUT_TRAIN, index=False)
    test_clean.to_csv(OUT_TEST,   index=False)

    # ── Step 6: Save metadata ──────────────────────────────────────
    metadata = {
        'symptom_columns' : symptom_cols,
        'diseases'        : diseases,
        'disease_to_idx'  : disease_to_idx,
        'idx_to_disease'  : idx_to_disease,
        'n_symptoms'      : len(symptom_cols),
        'n_diseases'      : len(diseases),
        'train_size'      : len(train_clean),
        'test_size'       : len(test_clean),
    }
    with open(OUT_META, 'w') as f:
        json.dump(metadata, f, indent=2)

    # ── Step 7: Print summary ──────────────────────────────────────
    print()
    print('=== Preprocessing complete ===')
    print(f'Symptom columns : {len(symptom_cols)}')
    print(f'Diseases        : {len(diseases)}')
    print(f'Training rows   : {len(train_clean)}')
    print(f'Test rows       : {len(test_clean)}')
    print(f'Saved: {OUT_TRAIN}, {OUT_TEST}, {OUT_META}')
    print()
    print('Disease list (first 10):')
    for d in diseases[:10]:
        print(f'  - {d}')

if __name__ == '__main__':
    preprocess()
    