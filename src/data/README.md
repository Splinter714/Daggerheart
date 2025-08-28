# Daggerheart Game Data Database

This database contains comprehensive environment and adversary stat blocks extracted from the Daggerheart rulebook, following the official structure and formatting.

## Contents

- **Environments**: Location-based challenges and narrative elements
- **Adversaries**: Enemy stat blocks with HP/Stress tracking

## Database Structure

### Environment Object
Each environment contains the following fields:

```javascript
{
  id: string,                    // Unique identifier (e.g., 'cult-ritual')
  name: string,                  // Environment name (e.g., 'CULT RITUAL')
  tier: number,                  // Tier level (1-4)
  type: string,                  // Environment type (Exploration, Social, Traversal, Event)
  description: string,           // Flavor text description
  impulses: string[],            // Array of narrative impulses/themes
  difficulty: number|string,     // Difficulty rating or special condition
  potentialAdversaries: string[], // Array of adversary types
  features: Feature[]            // Array of environment features
}
```

### Feature Object
Each feature contains:

```javascript
{
  name: string,                  // Feature name (e.g., 'Desecrated Ground')
  type: string,                  // Feature type (Passive, Action, Reaction, Environment Change)
  description: string,           // Detailed mechanical description
  prompts: string[]              // Array of GM prompts/questions
}
```

## Environment Types

- **Exploration**: Wondrous locations with mysteries and marvels to discover
- **Social**: Locations that primarily present interpersonal challenges  
- **Traversal**: Dangerous locations where moving around the space itself is a challenge
- **Event**: Defined more by the activity taking place than the space they take place in

## Adversary Database Structure

### Adversary Object
Each adversary contains the following fields:

```javascript
{
  id: string,                    // Unique identifier (e.g., 'acid-burrower')
  name: string,                  // Adversary name (e.g., 'Acid Burrower')
  tier: number,                  // Tier level (1-4)
  type: string,                  // Adversary type (Solo, Bruiser, Horde, Minion, Social)
  description: string,           // Flavor text description
  motives: string[],             // Array of narrative motives/behaviors
  difficulty: number,            // Difficulty rating for combat
  thresholds: {                  // Damage thresholds
    major: number,               // Major damage threshold
    severe: number               // Severe damage threshold
  },
  hp: number,                    // Current HP
  hpMax: number,                 // Maximum HP
  stress: number,                // Current stress
  stressMax: number,             // Maximum stress
  damageThreshold: number,       // Damage threshold for reactions
  atk: number,                   // Attack bonus
  weapon: string,                // Weapon name
  range: string,                 // Attack range
  damage: string,                // Damage dice and type
  experience: string[],          // Array of experience bonuses
  features: Feature[]            // Array of adversary features
}
```

### Adversary Types

- **Solo**: Powerful single enemies that can challenge the entire party
- **Bruiser**: Tough enemies that can take and deal heavy damage
- **Horde**: Multiple weak enemies that work together
- **Minion**: Weak enemies that serve stronger ones
- **Social**: Non-combat enemies that present social challenges

### Adversary Features
Each feature contains:

```javascript
{
  name: string,                  // Feature name (e.g., 'Relentless (3)')
  type: string,                  // Feature type (Passive, Action, Reaction)
  description: string            // Detailed mechanical description
}
```

## Environment Tiers

| Tier | Level Range | Difficulty Range | Damage Range |
|------|-------------|------------------|--------------|
| 1    | 1           | 10-12           | 1d6+1 to 1d8+3 |
| 2    | 2-4         | 13-15           | 2d8+3 to 2d10+8 |
| 3    | 5-7         | 16-18           | 3d8+3 to 3d10+10 |
| 4    | 8-10        | 19-20           | 4d8+3 to 4d10+10 |

## Available Adversaries

### Tier 1 (Level 1)
- **Acid Burrower** (Solo) - Horse-sized insect with acidic blood and burrowing abilities
- **Bear** (Bruiser) - Large bear with thick fur and powerful claws
- **Cave Ogre** (Solo) - Massive humanoid who sees all sapient life as food
- **Construct** (Solo) - Stone and steel being animated by magic
- **Courtier** (Social) - Ambitious socialite who schemes and manipulates

## Available Environments

### Tier 1 (Level 1)
- **ABANDONED GROVE** (Exploration) - A former druidic grove reclaimed by nature
- **AMBUSHERS** (Event) - PCs set an ambush for adversaries
- **BUSTLING MARKETPLACE** (Social) - Economic heart of a settlement
- **AMBUSHED** (Event) - PCs are caught in an ambush
- **CLIFFSIDE ASCENT** (Traversal) - Dangerous cliffside climbing
- **LOCAL TAVERN** (Social) - Social hub of a town
- **OUTPOST TOWN** (Social) - Small town near adventuring destinations
- **RAGING RIVER** (Traversal) - Swift-moving river without bridges

### Tier 2 (Levels 2-4)
- **CULT RITUAL** (Event) - Fallen cult performing dark rituals
- **HALLOWED TEMPLE** (Social) - Sacred temple providing healing and services
- **HAUNTED CITY** (Exploration) - Abandoned city with restless spirits
- **MOUNTAIN PASS** (Traversal) - Treacherous mountain passage with magical weather

### Tier 3 (Levels 5-7)
- **BURNING HEART OF THE WOODS** (Exploration) - Corrupted forest with eternal blue flames
- **CASTLE SIEGE** (Event) - Active siege of a fortified castle
- **PITCHED BATTLE** (Event) - Massive combat between large groups

### Tier 4 (Levels 8-10)
- **CHAOS REALM** (Traversal) - Otherworldly space with unstable reality
- **DIVINE USURPATION** (Event) - Massive ritual to unseat the New Gods
- **IMPERIAL COURT** (Social) - Majestic domain of a powerful empire
- **NECROMANCER'S OSSUARY** (Exploration) - Crypt with library and undead

## Data Format

Both environments and adversaries are stored in JSON format for consistency and easy editing:

- **`environments.json`** - Contains all environment data
- **`adversaries.json`** - Contains all adversary data

The JSON format provides:
- Easy human readability and editing
- Consistent structure across all data types
- Simple parsing and validation
- Version control friendly

## Usage Examples

### Get environments by tier
```javascript
import { getEnvironmentsByTier } from './environments.js';

const tier1Environments = getEnvironmentsByTier(1);
```

### Get environments by type
```javascript
import { getEnvironmentsByType, ENVIRONMENT_TYPES } from './environments.js';

const socialEnvironments = getEnvironmentsByType(ENVIRONMENT_TYPES.SOCIAL);
```

### Search environments
```javascript
import { searchEnvironments } from './environments.js';

const results = searchEnvironments('cult');
```

### Get specific environment
```javascript
import { getEnvironmentById } from './environments.js';

const cultRitual = getEnvironmentById('cult-ritual');
```

## Feature Types

- **Passive**: Always active effects or conditions
- **Action**: Features that can be activated by spending Fear
- **Reaction**: Features that trigger in response to specific conditions
- **Environment Change**: Features that fundamentally alter the environment

## GM Prompts

Each feature includes italicized questions designed to:
- Inspire plot hooks
- Provide ideas to fuel the scene
- Help connect the scene to other story elements
- Guide narrative interpretation

## Notes

- Environments are designed to interact with adversaries both mechanically and narratively
- Fear Features are powerful, scene-defining effects that require spending Fear to activate
- The framework is designed to be inspiring and practical, not prescriptive
- GMs can customize environments or create new ones as needed
- Daggerheart is enjoyable with or without this environment system
