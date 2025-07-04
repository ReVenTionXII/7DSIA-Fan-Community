import json
import os

def populate_database(json_path=r'G:\Silen\Documents\IMPORTANT Documents\SDS Discord\Discord News Bot\Reddit\Website\database\characters.json'):
    # Print current working directory and script location for debugging
    print(f"Current working directory: {os.getcwd()}")
    print(f"Script location: {os.path.abspath(__file__)}")
    print(f"Attempting to access: {json_path}")
    
    # Check if the file exists
    if not os.path.exists(json_path):
        print(f"Error: {json_path} does not exist. Please verify the file is in the 'database' folder.")
        return
    
    # Load existing characters.json
    try:
        with open(json_path, 'r', encoding='utf-8') as file:
            characters = json.load(file)
        print(f"Successfully loaded {json_path}")
    except FileNotFoundError:
        print(f"Error: {json_path} not found. Please ensure the file exists.")
        return
    except json.JSONDecodeError:
        print(f"Error: Invalid JSON in {json_path}. Please check the file format.")
        return
    except PermissionError:
        print(f"Error: Permission denied accessing {json_path}. Please check file permissions.")
        return
    except Exception as e:
        print(f"Unexpected error loading {json_path}: {e}")
        return

    # Define type-specific placeholder recommendations
    type_placeholders = {
        "DPS": {
            "P2P": "Focus on premium gear to maximize damage output and prioritize this character in PvP battles.",
            "F2P": "Use this character for high-damage boss fights and pair with free-to-play supports for synergy."
        },
        "Tank": {
            "P2P": "Equip premium defensive gear to enhance survivability and use in prolonged PvP matches.",
            "F2P": "Position this character in the front line for story missions to absorb damage effectively."
        },
        "Support": {
            "P2P": "Invest in premium resources to boost this character’s healing or buff abilities for team synergy.",
            "F2P": "Use this character to support your main DPS in story and event missions for consistent clears."
        },
        "Debuffer": {
            "P2P": "Leverage premium items to amplify debuff effects and control PvP battlefields.",
            "F2P": "Apply debuffs strategically in boss fights to weaken enemies and support your team."
        }
    }

    # Update each character with P2P/F2P recommendations
    for character in characters:
        character_name = character.get('name', 'Unknown')
        character_type = character.get('Type', 'DPS')  # Default to DPS if Type is missing
        placeholders = type_placeholders.get(character_type, type_placeholders["DPS"])
        
        # Replace Mentor_Recommendations with an object
        character['Mentor_Recommendations'] = {
            "P2P": f"Edit P2P recommendations for {character_name} here: {placeholders['P2P']}",
            "F2P": f"Edit F2P recommendations for {character_name} here: {placeholders['F2P']}"
        }

    # Save updated characters.json
    try:
        with open(json_path, 'w', encoding='utf-8') as file:
            json.dump(characters, file, indent=2)
        print(f"Successfully updated {json_path} with P2P/F2P placeholders.")
    except PermissionError:
        print(f"Error: Permission denied writing to {json_path}. Please check file permissions.")
    except Exception as e:
        print(f"Error writing to {json_path}: {e}")

if __name__ == "__main__":
    # Use absolute path to characters.json
    json_path = r'G:\Silen\Documents\IMPORTANT Documents\SDS Discord\Discord News Bot\Reddit\Website\database\characters.json'
    populate_database(json_path)