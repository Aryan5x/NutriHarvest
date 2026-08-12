import sys
import json
import os
import joblib
import pandas as pd
import numpy as np

def run_prediction():
    try:
        raw_input = sys.stdin.read()
        if not raw_input.strip():
            print(json.dumps({'error': 'No input provided'}))
            sys.exit(1)
        
        data = json.loads(raw_input)
        
        # Paths to artifacts
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        model_path = os.path.join(base_dir, 'ml', 'models', 'yield_model_v2.pkl')
        prep_path = os.path.join(base_dir, 'ml', 'models', 'yield_preprocessor_v2.pkl')

        if not os.path.exists(model_path) or not os.path.exists(prep_path):
            # Fallback check in C:\Autodesk\NutriHarvest
            model_path = r'C:\Autodesk\NutriHarvest\ml\models\yield_model_v2.pkl'
            prep_path = r'C:\Autodesk\NutriHarvest\ml\models\yield_preprocessor_v2.pkl'

        model = joblib.load(model_path)
        preprocessor = joblib.load(prep_path)

        df_in = pd.DataFrame([data])
        enc_in = preprocessor.transform(df_in)
        pred_log = model.predict(enc_in)[0]
        pred_yield = float(np.expm1(pred_log))

        print(json.dumps({
            'success': True,
            'predictedYieldTPerHa': round(pred_yield, 4)
        }))
    except Exception as e:
        print(json.dumps({
            'success': False,
            'error': str(e)
        }))
        sys.exit(1)

if __name__ == '__main__':
    run_prediction()
