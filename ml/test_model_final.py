from services.ml_service import load_model, predict_diseases, is_model_ready

print('Loading model...')
load_model()
print('Model ready:', is_model_ready())
print()

# Test 1: Classic flu symptoms
result = predict_diseases('fever headache body aches fatigue cough')
print('Test 1 — flu symptoms:')
for r in result[:3]:
    print(f'  {r["name"]:<35} {r["percentage"]}%')
print()

# Test 2: Migraine symptoms
result = predict_diseases('headache nausea vomiting light sensitivity')
print('Test 2 — migraine symptoms:')
for r in result[:3]:
    print(f'  {r["name"]:<35} {r["percentage"]}%')
print()

# Test 3: Common cold
result = predict_diseases('runny nose sneezing sore throat mild fever')
print('Test 3 — cold symptoms:')
for r in result[:3]:
    print(f'  {r["name"]:<35} {r["percentage"]}%')
print()

print('All tests complete!')