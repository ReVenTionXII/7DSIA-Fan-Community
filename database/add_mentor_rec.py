import json

filename = 'characters.json'

with open(filename, 'r', encoding='utf-8') as f:
    characters = json.load(f)

for char in characters:
    char['Mentor_Recommendations'] = "Mentor tips coming soon! Stay tuned."

with open(filename, 'w', encoding='utf-8') as f:
    json.dump(characters, f, indent=2, ensure_ascii=False)

print(f"Added Mentor_Recommendations to {len(characters)} characters.")
