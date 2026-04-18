# ml/notebooks/01_explore_data.ipynb  (paste into Jupyter notebook)
# Or save as ml/data/explore.py and run: python data/explore.py

import pandas as pd
import numpy as np
import os

# ── Load dataset ────────────────────────────────────────────────────
train_df = pd.read_csv('data/Training.csv')
test_df  = pd.read_csv('data/Testing.csv')

print('=== Dataset Overview ===')
print(f'Training rows : {len(train_df)}')
print(f'Testing rows  : {len(test_df)}')
print(f'Columns       : {len(train_df.columns)}')
print(f'Diseases      : {train_df["prognosis"].nunique()}')
print()

# ── Show first few rows ─────────────────────────────────────────────
print('=== Sample rows ===')
print(train_df.head(3).to_string())
print()

# ── Check column names ──────────────────────────────────────────────
print('=== Symptom columns (first 20) ===')
symptom_cols = [c for c in train_df.columns if c != 'prognosis']
print(symptom_cols[:20])
print(f'Total symptom columns: {len(symptom_cols)}')
print()

# ── Disease distribution ────────────────────────────────────────────
print('=== Disease distribution ===')
print(train_df['prognosis'].value_counts().head(20))
print()

# ── Check for missing values ────────────────────────────────────────
print('=== Missing values ===')
missing = train_df.isnull().sum()
print(missing[missing > 0] if missing.any() else 'No missing values — clean dataset!')