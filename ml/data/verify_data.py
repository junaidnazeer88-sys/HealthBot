import pandas as pd
import json

# Check cleaned data
train = pd.read_csv('data/train_clean.csv')
test = pd.read_csv('data/test_clean.csv')

with open('data/metadata.json') as f:
    meta = json.load(f)

print('=== Data verification ===')
print(f'Train shape       : {train.shape}')
print(f'Test shape        : {test.shape}')
print(f'Symptom columns   : {meta["n_symptoms"]}')
print(f'Diseases          : {meta["n_diseases"]}')
print(f'Missing values    : {train.isnull().sum().sum()}')
print()
print('Sample diseases:')
for d in list(meta["diseases"])[:8]:
    print(f'  {d}')
print()
print('Data is ready for model training!')