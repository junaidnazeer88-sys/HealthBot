#!/usr/bin/env python3
import os
import urllib.request
import ssl

# The Mac SSL fix
ssl._create_default_https_context = ssl._create_unverified_context

DATA_DIR = os.path.dirname(os.path.abspath(__file__))

# 🛑 THE FIX: Updated to a stable GitHub repository that hasn't been deleted
URLS = {
    'Training.csv': 'https://raw.githubusercontent.com/yaswanthpalaghat/Disease-prediction-using-Machine-Learning/master/Training.csv',
    'Testing.csv': 'https://raw.githubusercontent.com/yaswanthpalaghat/Disease-prediction-using-Machine-Learning/master/Testing.csv'
}

def download_data():
    print("Starting dataset download...")
    for filename, url in URLS.items():
        filepath = os.path.join(DATA_DIR, filename)
        if not os.path.exists(filepath):
            print(f"Downloading {filename}...")
            try:
                urllib.request.urlretrieve(url, filepath)
                print(f"✅ Successfully downloaded {filename}")
            except urllib.error.HTTPError as e:
                print(f"❌ HTTP Error downloading {filename}: {e.code} {e.reason}")
            except Exception as e:
                print(f"❌ Error downloading {filename}: {e}")
        else:
            print(f"⏭️ {filename} already exists.")
            
if __name__ == "__main__":
    download_data()