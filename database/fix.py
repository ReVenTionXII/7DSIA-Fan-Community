import json

input_file = r"G:\Silen\Documents\IMPORTANT Documents\SDS Discord\Discord News Bot\Reddit\Website\database\characters2.json"
output_file = r"G:\Silen\Documents\IMPORTANT Documents\SDS Discord\Discord News Bot\Reddit\Website\database\characters_fixed.json"

with open(input_file, "r", encoding="utf-8") as f:
    characters = json.load(f)

for char in characters:
    if "Mentor_Recommendations" not in char:
        char["Mentor_Recommendations"] = "Mentor tips coming soon! Stay tuned."

with open(output_file, "w", encoding="utf-8") as f:
    json.dump(characters, f, indent=2, ensure_ascii=False)

print("Mentor_Recommendations added and file saved.")
