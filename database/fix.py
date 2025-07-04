import json

input_file = "characters.json"
output_file = "characters_fixed.json"

with open(input_file, "r", encoding="utf-8") as f:
    data = json.load(f)

if not isinstance(data, list):
    raise ValueError("Expected JSON data to be a list of characters.")

for char in data:
    if "Mentor_Recommendations" not in char:
        char["Mentor_Recommendations"] = "Mentor tips coming soon! Stay tuned."

with open(output_file, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"Updated characters saved to {output_file}")
