import os
import glob

files = [
    'bachata-dancers-lab.html',
    'bachata-teachers-lab.html',
    'registration-bachata-sensual.html',
    'script_bsl.js',
    'script_bsl_almost_there.js',
    'script_bsl_i_made_it.js',
    'script_bsl_perfect_start.js'
]

for file_path in files:
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace variations of Basel
        content = content.replace('Location:\n                            Basel,', 'Location:\n                            Baden,')
        content = content.replace('Location: Basel,', 'Location: Baden,')
        content = content.replace('venue: \'Basel, Switzerland\'', 'venue: \'Baden, Switzerland\'')
        content = content.replace('BACHATA SENSUAL EDUCATION LABS - BASEL 2026', 'BACHATA SENSUAL EDUCATION LABS - BADEN 2026')
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {file_path}")
    else:
        print(f"File {file_path} not found")
