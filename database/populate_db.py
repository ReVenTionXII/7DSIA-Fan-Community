import sqlite3
import json
import os

# Paths
JSON_PATH = r'G:\Silen\Documents\IMPORTANT Documents\SDS Discord\Discord News Bot\Reddit\Website\database\characters.json'
DB_PATH = r'G:\Silen\Documents\IMPORTANT Documents\SDS Discord\Discord News Bot\Reddit\discord character db bot\database\reddit_characters2.db'

def migrate_data():
    # Load characters.json
    try:
        with open(JSON_PATH, 'r', encoding='utf-8') as file:
            characters = json.load(file)
    except FileNotFoundError:
        print(f"Error: {JSON_PATH} not found.")
        return
    except json.JSONDecodeError:
        print(f"Error: Invalid JSON in {JSON_PATH}.")
        return

    # Connect to SQLite database
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Add P2P and F2P columns if they don't exist
    cursor.execute("PRAGMA table_info(characters)")
    columns = [col[1] for col in cursor.fetchall()]
    if 'P2P' not in columns or 'F2P' not in columns:
        cursor.execute("ALTER TABLE characters ADD COLUMN P2P TEXT")
        cursor.execute("ALTER TABLE characters ADD COLUMN F2P TEXT")

    # Migrate data
    for char in characters:
        # Extract skills (assuming JSON objects in characters.json)
        normal_skill = char.get('Normal_Skill', {}).get('Description', 'N/A')
        special_skill = char.get('Special_Skill', {}).get('Description', 'N/A')
        ultimate_skill = char.get('Ultimate_Move', {}).get('Description', 'N/A')
        
        # Extract mentor recommendations
        mentor = char.get('Mentor_Recommendations', {})
        p2p = mentor.get('P2P', 'No P2P recommendations available.') if isinstance(mentor, dict) else 'No P2P recommendations available.'
        f2p = mentor.get('F2P', 'No F2P recommendations available.') if isinstance(mentor, dict) else 'No F2P recommendations available.'
        
        # Update or insert character
        cursor.execute("""
            INSERT OR REPLACE INTO characters (
                name, Affiliation, Rank, Attribute, Type, 
                Normal_Skill, Special_Skill, Ultimate_Skill, image_path, P2P, F2P
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            char.get('name', 'Unknown'),
            char.get('Affiliation', 'N/A'),
            char.get('Rank', 'N/A'),
            char.get('Attribute', 'N/A'),
            char.get('Type', 'N/A'),
            normal_skill,
            special_skill,
            ultimate_skill,
            char.get('image_path', 'assets/characters/placeholder.png'),
            p2p,
            f2p
        ))

    conn.commit()
    print(f"Successfully migrated {len(characters)} characters to {DB_PATH}")
    conn.close()

if __name__ == "__main__":
    migrate_data()