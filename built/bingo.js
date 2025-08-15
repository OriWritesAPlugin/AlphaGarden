import { drawPlantForSquare, gen_plant_data, encode_plant_data_v2, genWithModifiedSeedChances, calculateSeedChances, foliage_by_category, palettes_by_category } from "./gen_plant.js";
import { randomFromArray, getDissolvingRS, collectSeed, getSeedCollection, bubble_out, gen_toggle_button, gen_func_button, addRadioButton, makeSortCheckmark, getRadioValue, get_toggle_button_setting } from "./shared.js";
const all_challenges = {
    "e": {
        "a": { "description": "No drops", "points": 300, "category": "coli", "full": "Receive no drops from a battle" },
        "b": { "description": "Dragon misses", "points": 50, "category": "coli", "full": "Any of your dragons misses an attack" },
        "c": { "description": "Enemy misses", "points": 50, "category": "coli", "full": "Any enemy misses its attack" },
        "d": { "description": "Dragon crits", "points": 50, "category": "coli", "full": "Any dragon lands a critical hit" },
        "e": { "description": "All enemies 1 species", "points": 50, "category": "coli", "full": "Win a battle where all enemies are the same species. Bosses count!" },
        "f": { "description": "Any familiar", "points": 100, "category": "coli", "full": "Get any familiar" },
        "g": { "description": "Neutral elem familiar", "points": 200, "category": "coli", "full": "Get a familiar that, as a coli enemy, is neutral element" },
        "h": { "description": "Venue elem familiar", "points": 200, "category": "coli", "full": "Get a familiar that, as a coli enemy, has an element matching the venue's. If in doubt, pick the element you think matches the venue aesthetic!" },
        "i": { "description": "Goal item", "points": 50, "category": "coli", "full": "Pick any item you can get from your current venue that you actively want (ex: Swipp items, flower you collect). Get one!" },
        "j": { "description": "5+ DISTINCT items", "points": 200, "category": "coli", "full": "Get 5+ DIFFERENT items (counted as 5+ squares in the post-battle loot screen) from a single battle" },
        "k": { "description": "Get a green item", "points": 100, "category": "coli", "full": "Find an item that's mostly green, such as a green plant, a green scarf, a greenish-colored fish..." },
        "l": { "description": "Openable", "points": 100, "category": "coli", "full": "Get any item that you open up to receive more loot, like a fishscale basket" },
        "m": { "description": "Captcha", "points": 100, "category": "coli", "full": "Run into a coli captcha (you don't need to pass it)" },
        "n": { "description": "Any battle stone", "points": 100, "category": "coli", "full": "Get ANY battle stone whatsoever" },
        "o": { "description": "Health potion", "points": 150, "category": "coli", "full": "Get ANY of the potions (but not a tincture)" },
        "p": { "description": "3x 1 item", "points": 200, "category": "coli", "full": "Get 3 of the SAME item (so a 3 on at least one item box in the post-battle loot screen)" },
        "q": { "description": "Free space", "points": 0, "category": "neutral", "full": "Claim me!" },
        "r": { "description": "Get a flower", "points": 100, "category": "coli", "full": "Get any item that could be considered a flower, be it food, material, apparel, etc." },
        "s": { "description": "Get something brown", "points": 100, "category": "coli", "full": "Get any item that's mostly brown, such as a brown rock, a brownish granola bar, a brown otter..." },
        "t": { "description": "5+ items", "points": 100, "category": "coli", "full": "Get 5+ TOTAL items (so if you add up the item counts in the post-battle loot screen, you get at least 5)" },
        "u": { "description": "Battle enemy + palette swap", "points": 100, "category": "coli", "full": "Battle both (or at least 2) versions of an enemy in the same battle (like a dryad + autumn dryad)" },
        "v": { "description": "Get something red", "points": 100, "category": "coli", "full": "Get any item that's mostly red, such as a slash battlestone, a red flower..." },
        "w": { "description": "Item + its recolor", "points": 100, "category": "coli", "full": "Get an item and its color variant in the same battle (like a micro deer + dwarf fawn)" },
        "x": { "description": "MIMIC!", "points": 100, "category": "coli", "full": "Pick an enemy pack and mimic its poses and expressions. Like janky yoga. 3 different enemies? 3 poses!" },
        "y": { "description": "Composite item", "points": 100, "category": "coli", "full": "Get two or more battle rewards whose images appear to interact. What about two eels kissing, or a chicken holding up a battle stone? Anything you can justify is game!" },
    }, "m": {
        "a": { "description": "Any apparel", "points": 350, "category": "coli", "full": "Get any apparel, such as Veteran's Eye Scar" },
        "b": { "description": "Boss fight", "points": 250, "category": "coli", "full": "Fight any boss. You don't have to win!" },
        "c": { "description": "Acuity or might fragment", "points": 250, "category": "coli", "full": "Get one of the acuity or might fragment battle stones, any element" },
        "d": { "description": "Berserk or scholar stone", "points": 450, "category": "coli", "full": "Get the berserk battle stone or scholar battle stone" },
        "e": { "description": "Elemental attack stone", "points": 250, "category": "coli", "full": "Get ANY elemental attack stone, such as Sear or Mana Bolt" },
        "f": { "description": "Gene", "points": 500, "category": "coli", "full": "Get ANY gene scroll, modern or ancient" },
        "g": { "description": "3x goal item", "points": 300, "category": "coli", "full": "Pick any item you can get from your current venue that you actively want (ex: Swipp items, flower you collect). Get 3 of it in the same battle!" },
        "h": { "description": "Skin or skin crate", "points": 450, "category": "coli", "full": "Get a skin or anything you open to receive a skin, including crates and chests" },
        "i": { "description": "Scroll of renaming", "points": 400, "category": "coli", "full": "Get a scroll of renaming (remember: you can check the game database for drop locations)" },
        "j": { "description": "Vista", "points": 450, "category": "coli", "full": "Get any vista! Getting one out of a NotN chest counts (so long as you won the chest in the coli)" },
        "k": { "description": "Eye vial", "points": 550, "category": "coli", "full": "Get any of the eye vials, such as a vial of hypnotic sight" },
        "l": { "description": "Max breath on 1 dragon", "points": 350, "category": "coli", "full": "Get any of your dragons to full breath! You can mouse over the breath bar to check" },
        "m": { "description": "Do square above or below", "points": 200, "category": "neutral", "full": "Complete the square above and/or below this one" },
        "n": { "description": "Do square left or right", "points": 200, "category": "neutral", "full": "Complete the square to the left and/or right of this one" },
        "o": { "description": "Do 2 corner squares", "points": 200, "category": "neutral", "full": "Complete 2 of the four corner squares. If this is in a corner square, it counts!" },
        "p": { "description": "Spend 10 min in coli", "points": 600, "category": "coli", "full": "Spend 10 minutes coli-ing; doesn't \"stack\" with other time squares (5+10=15 minutes total)" },
        "q": { "description": "Exactly 6 DISTINCT items", "points": 550, "category": "coli", "full": "Get exactly 6 DIFFERENT items (counted as 6 squares in the post-battle loot screen) from a single battle" },
        "r": { "description": "4-enemy pack", "points": 250, "category": "coli", "full": "Fight four enemies at once. You don't have to win!" },
        "s": { "description": "7+ TOTAL items", "points": 500, "category": "coli", "full": "Get 7+ TOTAL items (so if you add up the item counts in the post-battle loot screen, you get at least 7)" },
        "t": { "description": "Max breath on all attackers", "points": 300, "category": "coli", "full": "Get any of your actively-fighting dragons to full breath! If you're training fodder, only your trainer(s) are required" },
        "u": { "description": "Get a rock", "points": 200, "category": "coli", "full": "Get any item that could be considered a rock, be it a crystal, a battle stone depicting a rock (fragments), etc." },
        "v": { "description": "5 fights w/o trainer dmg'd", "points": 200, "category": "coli", "full": "Win 5 fights in a row without your trainer(s) (or farmer(s)) taking damage. Fodder can be damaged!" },
        "w": { "description": "Win w/o using elim", "points": 200, "category": "coli", "full": "Win a fight without using eliminate; any other attack can be used!" },
        "x": { "description": "Miss an eliminate", "points": 200, "category": "coli", "full": "Have a dragon use eliminate but miss. Consolation prize!" },
        "y": { "description": "All drops are food", "points": 200, "category": "coli", "full": "EVERY item that drops from a battle is food, and at least one item drops" },
        "z": { "description": "Clear a + shape", "points": 200, "category": "coli", "full": "Clear a square plus the square above, below, left, and right of it. Can be anywhere on the board" },
        "aa": { "description": "Every enemy drops food", "points": 200, "category": "coli", "full": "Get a number of enemy-specific food items greater than or equal to the number of enemies you fought" },
        "ab": { "description": "Stretch them joints", "points": 200, "category": "coli", "full": "Wrists especially!" },
        "ac": { "description": "Move a bit", "points": 200, "category": "coli", "full": "Physically move yourself, ex: pacing around the room" },
        "ad": { "description": "Rest your eyes!", "points": 200, "category": "coli", "full": "Look at something at least 20 feet away for at least 20 seconds" },
        "ae": { "description": "Bio check", "points": 200, "category": "coli", "full": "Do you need water? Are you hungry? Any other needs to tend?" },
        "af": { "description": "Immersion!", "points": 200, "category": "coli", "full": "Change one thing in your environment to be more immersive to the venue. Go on mynoise.net and mix some sounds, get under a blanket if you're in a cave, splash your face with water if it's underwater..." },
    }, "h": {
        "a": { "description": "Boss familiar", "points": 3000, "category": "coli", "full": "Get a boss enemy as a familiar" },
        "b": { "description": "Wing or body apparel", "points": 2500, "category": "coli", "full": "Get any piece of apparel that goes on the wings or body, like a date plumed cover or green lace waist frill" },
        "c": { "description": "Runestone", "points": 2500, "category": "coli", "full": "Get any of the elemental runestones (doesn't have to be a Swipp/Baldwin one)" },
        "d": { "description": "Deity doll", "points": 2500, "category": "coli", "full": "Get any of the deity dolls, such as the playful windsinger puppet" },
        "e": { "description": "Ambush or rally stone", "points": 1000, "category": "coli", "full": "Get the ambush battle stone or rally battle stone" },
        "f": { "description": "2 familiars in 3 battles", "points": 2000, "category": "coli", "full": "Get two familiars within 3 battles. 2 in one battle counts!" },
        "g": { "description": "Unhatched egg", "points": 3000, "category": "coli", "full": "Get any unhatched egg. Nocturne eggs count (if you got the chest in the coli!)" },
        "h": { "description": "Venue apparel", "points": 1000, "category": "coli", "full": "Get any piece of venue-exclusive apparel, such as a piece of the \"Blooming Wood\" set in the Blooming Grove (blooming woodbrace, etc)" },
        "i": { "description": "2 boss fights in a row", "points": 1000, "category": "coli", "full": "Fight two bosses back to back. You don't have to beat both (or either, if you restart and immediately get another)" },
        "j": { "description": "2 misses in a row", "points": 800, "category": "coli", "full": "Miss two attacks back-to-back. They don't have to be elims, but they probably were..." },
        "k": { "description": "Eliminate", "points": 3000, "category": "coli", "full": "Get an eliminate to drop! Lucky! Remember you can check the item database to see where things drop" },
        "l": { "description": "Act the battle", "points": 1600, "category": "coli", "full": "Mime the attacks your dragons use. If they get hit, mime getting hit. Get silly with it." },
        "m": { "description": "Spend 20 min in coli", "points": 1200, "category": "coli", "full": "Spend 20 minutes coli-ing; doesn't \"stack\" with other time squares (5+30=35 minutes total)" },
        "n": { "description": "2 openables in 3 battles", "points": 800, "category": "coli", "full": "Get two openables within 3 battles, such as 2 fishscale baskets. Don't have to be the same item, and chests count! 2 in one battle also counts" },
        "o": { "description": "2 crits in a row", "points": 800, "category": "coli", "full": "Have your dragons land two critical hits in a row! Doesn't have to be the same dragon" },
        "p": { "description": "Head, limb, or tail apparel", "points": 1200, "category": "coli", "full": "Get any piece of apparel that goes on the head, limb, or tail, like a soft pink fillet" },
        "q": { "description": "Clan element familiar", "points": 1200, "category": "coli", "full": "Get a familiar that, as a coli enemy, has an element matching your clan's" },
        "r": { "description": "7+ DISTINCT items", "points": 800, "category": "coli", "full": "Get 7+ DIFFERENT items (counted as 7+ squares in the post-battle loot screen) from a single battle" },
        "s": { "description": "3+ different foods", "points": 800, "category": "coli", "full": "Get at least 3 different food items from a single battle" },
        "t": { "description": "5+ items of different colors", "points": 800, "category": "coli", "full": "Get 5+ items in 1 battle that are broadly all different colors (a pink flower, a blue flower, etc...)" },
        "u": { "description": "Clan elem battle stone", "points": 1000, "category": "coli", "full": "Get a battle stone with an element matching your clan's, such as Leaf Bolt or a Natural Might Fragment for a Nature clan" },
        "w": { "description": "Familiar of favorite color", "points": 500, "category": "coli", "full": "Get a familiar that is, broadly speaking, your favorite color" },
        "x": { "description": "Neutral elem battle stone", "points": 500, "category": "coli", "full": "Get a non-elemental battle stone, such as Aid, Slash, or Field Manual" },
        "y": { "description": "Same dragon hit 2x in row", "points": 500, "category": "coli", "full": "Have a dragon be the one to take an enemy hit twice in a row (across battles is fine)" },
        "z": { "description": "Get the captcha EXP buff", "points": 500, "category": "coli", "full": "Solve a captcha and receive the EXP increase buff" },
        "aa": { "description": "Dodge a boss attack", "points": 500, "category": "coli", "full": "AKA the boss misses your dragon!" },
        "ab": { "description": "Same pack 2x in a row", "points": 500, "category": "coli", "full": "Fight the same enemy pack back to back. The same boss twice in a row counts!" },
        "ac": { "description": "Do the furthest square", "points": 500, "category": "coli", "full": "Complete the furthest square from this one. Diagonal counts as 2 away (you go a square left, you go a square up...). If there are several equally far, you can choose!" },
        "ad": { "description": "Task switch", "points": 500, "category": "coli", "full": "Get something else done--run the laundry, pick up a few things, etc." },
        "ae": { "description": "Beat a boss without taking damage", "points": 500, "category": "coli", "full": "The difficulty of this one varies widely, to be fair" },
        "af": { "description": "Lower breath below 15", "points": 500, "category": "coli", "full": "Be it by misses or moves, get a dragon's breath from above 15 to below it." },
    }, "s": {
        "a": { "description": "Drink a glass of water", "points": 100, "category": "self-care", "full": "Any size is good!" },
        "b": { "description": "Head outside", "points": 100, "category": "self-care", "full": "If the weather or surroundings are bad for going outside, crack a window or put on some nature sounds" },
        "c": { "description": "Do something energetic", "points": 100, "category": "self-care", "full": "Anything that raises your heart rate or engages your muscles works" },
        "d": { "description": "Socialize (online OK!)", "points": 100, "category": "self-care", "full": "Talk, hang out, or sit in companionable silence with someone else." },
        "e": { "description": "Another glass of water!", "points": 100, "category": "self-care", "full": "Keep it up!" },
        "f": { "description": "Get 2+ proper meals", "points": 100, "category": "self-care", "full": "The definition of \"proper meal\" is up to you! For those of us who struggle a bit, try to feel satiated" },
        "g": { "description": "Say something nice about yourself", "points": 100, "category": "self-care", "full": "For bonus points, name something that isn't inherently tied to how helpful you are to others" },
        "h": { "description": "Look forward to something", "points": 100, "category": "self-care", "full": "Anything you like, no matter how small or simple" },
        "i": { "description": "Brush your teeth", "points": 100, "category": "self-care", "full": "No matter how long you do it for, it's way better than not doing it!" },
        "j": { "description": "Touch a live thing (plants OK!)", "points": 100, "category": "self-care", "full": "Getting a hug, petting your cat, handling your houseplant, they all count" },
        "k": { "description": "Finish a task", "points": 100, "category": "self-care", "full": "Any task you like, and you can absolutely double-count it on the to-do list" },
        "l": { "description": "Get dressed", "points": 100, "category": "self-care", "full": "Wear anything you'd be comfortable going outside in" },
        "m": { "description": "Free space!", "points": 100, "category": "neutral", "full": "Claim me! :D" },
        "n": { "description": "Meditate, 5+ min", "points": 100, "category": "self-care", "full": "Timers and guided meditations are a big help." },
        "o": { "description": "Put on some music", "points": 100, "category": "self-care", "full": "Any music works! What suits your mood?" },
        "p": { "description": "Do something with your hands", "points": 100, "category": "self-care", "full": "Anything tactile, like making food, digging in the dirt, etc." },
        "q": { "description": "ANOTHER glass of water!", "points": 100, "category": "self-care", "full": "Last water on the board, never the last in our hearts" },
        "r": { "description": "Release shoulder, back, jaw tension", "points": 100, "category": "self-care", "full": "If you feel something like a little shiver, you're doing it great!" },
        "s": { "description": "Stretch!", "points": 100, "category": "self-care", "full": "Standard wakeup stretches count" },
        "t": { "description": "Smell something nice", "points": 100, "category": "self-care", "full": "Anything noticeably pleasant, like a favored food, fresh air, or a nice candle" },
        "u": { "description": "Create something", "points": 100, "category": "self-care", "full": "It can be anything! Digital art, a poem, a cube made of clay..." },
        "v": { "description": "Do something pleasantly mindless", "points": 100, "category": "self-care", "full": "I still like looking through cat pictures" },
        "w": { "description": "Learn something new", "points": 100, "category": "self-care", "full": "Can be about anything: dinosaurs, gardening, car maintenance..." },
        "x": { "description": "10 deep breaths", "points": 100, "category": "self-care", "full": "Slowly fill your lungs, hold a beat, exhale, repeat" },
        "y": { "description": "Work on a good habit", "points": 100, "category": "self-care", "full": "Are you working to develop a skill, be more active, eat more regularly? Anything counts!" },
    }, "u": {
        "a": { "description": "Frolic!", "points": 100, "category": "self-care", "full": "Doesn't have to be outside, but don't be embarrassed to move joyfully!" },
        "b": { "description": "Lay on the floor", "points": 100, "category": "self-care", "full": "Flat, spread-eagle, try to get your back flush against the floor" },
        //"c": { "description": "Feel noticeable temp", "points": 100, "category": "self-care", "full": "Stick your head in the fridge, take a hot shower, etc" },
        //"d": { "description": "Eat some tactile food", "points": 100, "category": "self-care", "full": "Examples are a softboiled egg (you need to peel it), pistachios or sunflower seeds (you need to remove the shell), etc" },
        "e": { "description": "Get your heart rate up", "points": 100, "category": "self-care", "full": "Meet yourself where you are! A few jumping jacks, a jog, whatever gets your heart going" },
        "f": { "description": "Keep water nearby", "points": 100, "category": "self-care", "full": "Fill a bottle (preferably reusable) and keep it nearby for easy hydration" },
        //"g": { "description": "Make music", "points": 100, "category": "self-care", "full": "Can be as simple as singing along to your favorite tune or a one-person jam session" },
        //"h": { "description": "Dance", "points": 100, "category": "self-care", "full": "...like nobody's watching!" },
        "i": { "description": "Solve any logic puzzle", "points": 100, "category": "self-care", "full": "Sudoku, grid logic puzzles, etc. Try to do one that isn't easy for you!" },
        //"j": { "description": "Use your jaw muscles", "points": 100, "category": "self-care", "full": "Tip: frozen gummy bears work well for this. Grab one for the left molars, one for the right. Jerky and gum, too!" },
        //"k": { "description": "Reassuring self-talk", "points": 100, "category": "self-care", "full": "ex: \"it's normal to say something a little awkwardly, everyone does and no one remembers anyone else's, too busy thinking about their own\"" },
        //"l": { "description": "Pre-prepare for breakfast", "points": 100, "category": "self-care", "full": "Make sure you have what you need to start tomorrow with a filling (and easy, if it helps!) meal" },
        "m": { "description": "Notice 10 things around you", "points": 100, "category": "self-care", "full": "Let your eyes flick to something, mentally \"name\" that thing (ex: \"potted plant\"), and repeat" },
        "n": { "description": "Check for under-stimulation", "points": 100, "category": "self-care", "full": "Understimulation can show itself as \"brain static\", restlessness, distractability, etc. Give yourself some enrichment! PSA: if you're seemingly immune to caffeine otherwise, try some when understimulated" },
        "o": { "description": "Look deeply at something pleasant", "points": 100, "category": "self-care", "full": "For example, an mp4 of a cute dog. Try to focus on only that for at least a few seconds" },
        "p": { "description": "Tire out a non-cardiac muscle", "points": 100, "category": "self-care", "full": "Squats are great for engaging a lot of muscles at once" },
        "q": { "description": "Do something you've put off", "points": 100, "category": "self-care", "full": "Put in even minutes of work on something you've been putting off" },
        //"r": { "description": "Jot down how you're feeling", "points": 100, "category": "self-care", "full": "Write a few sentences on how you're doing right now. You can delete/destroy them when you're done, if you like" },
        //"s": { "description": "Name 3 wins today", "points": 100, "category": "self-care", "full": "Meet yourself where you are--if it's a step for you (like eating a full meal), it's an accomplishment, period!" },
        //"t": { "description": "Try a new flavor", "points": 100, "category": "self-care", "full": "New ingredient, eating 2 things together, new dish, drink, trying a new restaurant, anything!" },
        "u": { "description": "Hear a new song", "points": 100, "category": "self-care", "full": "Sea shanties? Folk music? Metal? Try a little of anything!" },
        "v": { "description": "Get comfy", "points": 100, "category": "self-care", "full": "Nestle down in something soft. Exhale slowly and release tension." },
        "w": { "description": "Find some silence", "points": 100, "category": "self-care", "full": "Focus on any white noise present. Try to minimize it for a moment by ex: moving someplace quieter or popping on headphones" },
        //"x": { "description": "Positive physical contact", "points": 100, "category": "self-care", "full": "Pet your cat, hug your friend, feed a bird, whatever!" },
        "y": { "description": "Wear something that feels good", "points": 100, "category": "self-care", "full": "Any clothes, accessories, etc. that make you feel good to see yourself in" },
        //"z": { "description": "Check your emotional state", "points": 100, "category": "self-care", "full": "Ask yourself how you're feeling. Name any emotions present and where you think they're coming from" },
        //"aa": { "description": "Secure your area", "points": 100, "category": "self-care", "full": "Take stock of where you are. Reassure yourself that it's safe and secure or think on ways to alter it accordingly (ex: supplies for a power outage)" },
        //"ab": { "description": "Plan a little treat", "points": 100, "category": "self-care", "full": "What would be a nice little treat for yourself? Is there a favorite meal you'd like, a place you want to drive to, a piece of media you want to check out? How long's it been since you gave yourself a little treat? Would you expect other folks to go that long? If not, seriously, block out some time to treat yourself, at least a little!" },
        //"ac": { "description": "Catch up with someone", "points": 100, "category": "self-care", "full": "Check in with a friend, [found] family, send a cat pic to someone you know, anything like that" },
        //"ad": { "description": "Experience good texture", "points": 100, "category": "self-care", "full": "What counts as a \"good\" texture is totally up to you! Touching and tasting both work for this one." },
        "ae": { "description": "Wash your face", "points": 100, "category": "self-care", "full": "Soap/cleaner at your discretion, I'm a big fan of plain cold or warm water myself!" },
        "af": { "description": "5 minute clean", "points": 100, "category": "self-care", "full": "Set a timer and speed-clean for 5 minutes. Put on some high-energy music if you like and see how much you can get done!" },
        "ag": { "description": "Clean out the fridge", "points": 100, "category": "self-care", "full": "Got any old leftovers you've been neglecting to throw away? Now's the time!" },
        //"ah": { "description": "Wash some dishes", "points": 100, "category": "self-care", "full": "You don't have to clean out the whole sink (or your room if you've got dishes in there), just get started and see where it takes you. If you've got a dishwasher, load or unload. No dirty dishes? Congrats, this is a free space!" },
        "ai": { "description": "Sketch something", "points": 100, "category": "self-care", "full": "Give yourself a full, empty piece of paper for it. Try to do it physically (pencil/pen). Doesn't have to be anything fancy or polished! What about an animal or plant?" },
        "aj": { "description": "Clean off your desk", "points": 100, "category": "self-care", "full": "Remove dishes, throw out trash, sort your physical inbox, stuff like that. No desk? Try your purse, locker, or backpack!" },
        //"ak": { "description": "Look after your tools", "points": 100, "category": "self-care", "full": "Do some preventative care for the tools you rely on. Maybe fueling up (or cleaning out) your car, cleaning out the lint trap, anything that helps you feel a bit more secure about your equipment" },
        //"al": { "description": "Start a shopping list", "points": 100, "category": "self-care", "full": "Write down some things you need/want to pick up" },
        //"am": { "description": "Avoid tech for an hour", "points": 100, "category": "self-care", "full": "Tech here meaning things like phones, ipads, and laptops (basically access to the global info firehose), not like, HVAC systems. Turn them off or put them someplace you can't hear notifications" },
        "an": { "description": "Read a short story", "points": 100, "category": "self-care", "full": "...or a long story! Preferably a bit disconnected from your immediate reality. Li'l bit of literary escapism, y'know?" },
        "ao": { "description": "Tea time", "points": 100, "category": "self-care", "full": "Have a cup of tea (or good coffee, or hot cocoa) and stare out the window. Fix yourself a little snack if you like. Basically, give yourself a soothing hot beverage break." },
        //"ap": { "description": "Put a sticker on something", "points": 100, "category": "self-care", "full": "Including on yourself!" },
        "aq": { "description": "Wrist health check", "points": 100, "category": "self-care", "full": "Roll your wrists, wriggle your fingers, stare at something at least 20 feet away, the usual working-while-seated maintenance" },
        //"ar": { "description": "Watch a comfort movie", "points": 100, "category": "self-care", "full": "Watch your favorite movie, or one that just feels kinda cozy, y'know?" },
        //"as": { "description": "Jigsaw or fidget puzzle", "points": 100, "category": "self-care", "full": "Put a bit of work into a jigsaw puzzle or something else that requires physical manipulation of pieces" },
        "at": { "description": "Coloring break", "points": 100, "category": "self-care", "full": "Break out the coloring sheet and pencils (or any other pigment thing). Paint by numbers count, so do coloring books both adult and non!" },
        "au": { "description": "Tidy your sleeping space", "points": 100, "category": "self-care", "full": "Clear away cups, get the sheets and blankets how you like, put stuff away. Get it how you like it" },
        //"av": { "description": "Affect the world", "points": 100, "category": "self-care", "full": "Identify something external to yourself you want changed and contribute to changing it. $10 to a charity you believe in, double-checking your voter registration..." },
        //"aw": { "description": "Embrace the cringe", "points": 100, "category": "self-care", "full": "Listen to that loved song or band that's \"uncool\" (MCR fan, myself). Read that fanfic. Design that fursona. Immerse yourself in that fan wiki. Don't let anyone take your harmless joys." },
        "ax": { "description": "Get outside and look at the sky", "points": 100, "category": "self-care", "full": "Watch the clouds or stars if there are any out, or just enjoy the colors" },
        "ay": { "description": "Try to touch your toes", "points": 100, "category": "self-care", "full": "...and any other more \"involved\" stretches you feel like doing (like hamstrings!)" },
        //"az": { "description": "Skin care moment", "points": 100, "category": "self-care", "full": "Shower, exfoliate, put on lotion, sunscreen, body butter, etc, whichever one(s) (if any) apply to how your skin's doing in the moment" },
        "ba": { "description": "Open a window", "points": 100, "category": "self-care", "full": "Doesn't have to be for long (if it's cold or smoggy outside, especially), just for a few moments" },
        "bb": { "description": "Go for a walk", "points": 100, "category": "self-care", "full": "10 minutes is good to aim for!" },
        //"bc": { "description": "Change your bedsheets", "points": 100, "category": "self-care", "full": "Nothing like some cool, crisp, clean sheets" },
        "bd": { "description": "Accessorize", "points": 100, "category": "self-care", "full": "Do or wear something little that makes you feel good. What about painting your nails or breaking out the fun socks?" },
        "be": { "description": "Massage a muscle", "points": 100, "category": "self-care", "full": "Like your forearm! You might want to look up a quick guide. It can be a nice stress reliever even if your muscles don't feel all that tense." },
        "bf": { "description": "Interact with plants", "points": 100, "category": "self-care", "full": "Watering your houseplants, inspecting their leaves, feeling the texture of a landscaping plant, etc." },
        "bg": { "description": "Clean out your tabs", "points": 100, "category": "self-care", "full": "Go through your browser and close all the tabs you can. Try to close all but 3 (add bookmarks for things you don't want to lose)" },
        //"bh": { "description": "Fresh bakery, deli, etc.", "points": 100, "category": "self-care", "full": "Get something nice and fresh from a local business. Family-owned donut shop, bakery, deli, taqueria, whatever you have near you" },
        "bi": { "description": "Do a restful yoga pose", "points": 100, "category": "self-care", "full": "Look up a pose and give it a try! Child's pose is a great starting point." },
        "bj": { "description": "Eat a fruit or veggie", "points": 100, "category": "self-care", "full": "Preferably in a non- or minimally-processed form (like a raspberry, freshly-peeled carrot, or roasted ear of corn)" },
        //"bk": { "description": "Cuddle your pet", "points": 100, "category": "self-care", "full": "...or someone else's pet if you have access!" },
        "bl": { "description": "Do some creative writing", "points": 100, "category": "self-care", "full": "Even if it's a single sentence or one couplet for an incomplete poem" },
        "bm": { "description": "Find and observe wildlife", "points": 100, "category": "self-care", "full": "Bugs and friends ABSOLUTELY count. Meet a new isopod friend TODAY!" },
        //"bn": { "description": "Watch the sunset", "points": 100, "category": "self-care", "full": "Set some quiet time aside to watch the sun setting" },
        //"bo": { "description": "Look at an old picture", "points": 100, "category": "self-care", "full": "...or a tchotcke from a friend, or a pamphlet you kept from a road trip..." },
        "bp": { "description": "Add a good smell", "points": 100, "category": "self-care", "full": "...to your living space. Light a candle, cook some food, favorite room spray, airing the space out with an open window, etc" },
        //"bq": { "description": "Goofy faces in the mirror", "points": 100, "category": "self-care", "full": "Really dork out with it. Finger guns are a great addition" },
        //"br": { "description": "Plan something for the future", "points": 100, "category": "self-care", "full": "Like a trip you might want to go on, or a step you might take towards something you want to accomplish." },
        "bs": { "description": "Floss your teeth", "points": 100, "category": "self-care", "full": "Or otherwise freshen up your mouth to clear out any tastes" },
        "bt": { "description": "Body scan meditation", "points": 100, "category": "self-care", "full": "It's a meditative exercise that's great for grounding! Look up guided body scan meditations if you'd like audio" },
        //"bu": { "description": "What went well", "points": 100, "category": "self-care", "full": "Think in detail about something that went well today!" },
        "bv": { "description": "Try some nostalgia", "points": 100, "category": "self-care", "full": "Listening to a song from when you were younger, playing a game you have good memories with..." },
        "bw": { "description": "Make a schedule", "points": 100, "category": "self-care", "full": "Schedule out today (or tomorrow). Use a method that works for you (exact times work for some folks, this-then-that flowcharts for others, time blocking, etc)" },
        "bx": { "description": "2+ minutes of exercise", "points": 100, "category": "self-care", "full": "Sometimes the hardest part of exercise is getting started! Set a timer for 2 minutes and keep moving til it's over. If you're feeling good at the end of it, tack a bit more time on (maybe even put the extended chunk of time on your to-do list so you get a plant when you're done? :))" },
        "by": { "description": "Break up a task", "points": 100, "category": "self-care", "full": "Choose a large task/goal you'd like to eventually accomplish and break it up into smaller tasks. Write those down somewhere." },
        "bz": { "description": "Clean a square meter", "points": 100, "category": "self-care", "full": "Close your eyes, spin around, point to a random spot in your space. Clean the square meter surrounding it" },
        "ca": { "description": "Healthy snack on hand", "points": 100, "category": "self-care", "full": "Prep something to munch on. Big fan of roasted lentils myself (they're cronchy, dirt cheap, and turn DELICIOUS with just a little seasoning)" },
        "cb": { "description": "Do a small kindness", "points": 100, "category": "self-care", "full": "Hold the door, pay a friend a compliment, return your cart + another at the store, etc." },
        "cc": { "description": "Have ambient noise", "points": 100, "category": "self-care", "full": "mynoise.net is a good place to start, or searching Youtube for a music genre + ambiance (ex: coffee shop jazz and rain). Or open a window if the outside noise is good!" },
        "cd": { "description": "Dive into a subject", "points": 100, "category": "self-care", "full": "Hop on wikipedia, hit random a few times, follow some links, and find something new to read up on" },
        //"ce": { "description": "Forgive a feeling", "points": 100, "category": "self-care", "full": "We don't so much choose our feelings as how we handle them, and a lot of the problem-causing feelings (like anxiety) come in part from our bodies trying to keep us safe. Make sure you're not beating yourself up for being a critter in a strange, bright, huge, noisy world." },
        //"cf": { "description": "Say no to something", "points": 100, "category": "self-care", "full": "...but not to something that'd be a positive for your life! If nothing else, give a full-minded \"no\" to clicking a link you know'll do nothing but make you angry." },
        "cg": { "description": "Get up for 5+ minutes", "points": 100, "category": "self-care", "full": "Working at a desk? Get up! Lying in bed working towards awakeness? Get up! Studying at your desk? Buddy you guessed it! Feel free to work in a standing position or turn it into a walk break" },
        //"ch": { "description": "Listen deeply", "points": 100, "category": "self-care", "full": "Close your eyes and listen to the sounds around you. Identify what they are. Might want to turn down any music/ambiance for this one. Try to identify at least 3 sounds; even if there genuinely aren't 3, it's a good way to focus." },
        //"ci": { "description": "Scale up a recipe", "points": 100, "category": "self-care", "full": "Next time you're making a recipe (especially a recipe where this is easy to do, like stew), make enough to cover a few extra meals, either to freeze or eat as leftovers" },
        //"cj": { "description": "Unfollow 10 things", "points": 100, "category": "self-care", "full": "If you use sites/apps with a concept of following or subscription (pages, tags, people, channels, feeds, etc), try to find 10 things you can unfollow and do so. If you can't find 10 (don't use things like that or only follow close friends/family/adorable pictures of cats/etc), free space!" },
        //"ck": { "description": "Cook by color", "points": 100, "category": "self-care", "full": "Think of a color, any color, then plan and/or cook a meal inspired by it! What about a warm autumnal soup for orange, or a blueberry tart for blue?" },
        //"cl": { "description": "Tally your water intake", "points": 100, "category": "self-care", "full": "Note down tally marks for each glass of water you drink today (if you're starting later in the day, just estimate what you've had so far). If you hit 6 glasses, feel free to stop by the  to-do list, note that down, and check it off for an extra plant" },
        //"cm": { "description": "Vibe with a word", "points": 100, "category": "self-care", "full": "Think up a word you're really feeling right now. Meaning isn't important. Doesn't even have to exist. Feeling pretty imbernerber myself right now." },
        //"cn": { "description": "Try/revisit a hobby", "points": 100, "category": "self-care", "full": "Something you once did or never did. Origami, yoga, playing an instrument, making moodboards" },
        //"co": { "description": "Send a friend", "points": 100, "category": "self-care", "full": "Find something that makes you think of someone in your life--a song, a meme, one of those cool NASA photos--and send it to them" },
        "cp": { "description": "Fill a page with doodles", "points": 100, "category": "self-care", "full": "For bonus points, use a pen (or something else that can't be erased) and full send it" },
        "cq": { "description": "Write, no need to send", "points": 100, "category": "self-care", "full": "Write out something you want to say (to others, to the world, to yourself) but feel you can't/shouldn't for any reason. You don't have to keep it when you're done" },
        "cr": { "description": "Adopt a thingy", "points": 100, "category": "self-care", "full": "Pick some random object as your new temporary pet. Name it. Gently pat it. Come up with its backstory. Give it a wee little good morning/day/evening or a compliment" },
        //"cs": { "description": "Improve", "points": 100, "category": "self-care", "full": "Think of something you'd like to work on about yourself. Think about how you could improve that trait...and/or your outlook on it! Take a step, no matter how small, accordingly" },
        "ct": { "description": "Poem break", "points": 100, "category": "self-care", "full": "Write or look up a random poem. Read it, then again with a slightly different intonation. Think on how you feel about it and what imagery/ideas come to mind." },
        //"cu": { "description": "Window shop", "points": 100, "category": "self-care", "full": "For those in walkable areas, wander around town a bit, looking in the windows of shops. For those not, close your eyes and visualize the most charming little main street you can. Where is it? What're the shops like? What sorts of smells are in the air?." },
        //"cv": { "description": "Scalp massage", "points": 100, "category": "self-care", "full": "Ask for one or give yourself one! Close your eyes and vary the pressure (whisper-light, fairly firm...)" },
        "cw": { "description": "Leave something to find later", "points": 100, "category": "self-care", "full": "Leave something nice for your future self or beloved co-habitator to find. Kind post-it note, tab zoomed in on a delightfully silly image, goofy statue sitting on the bed" },
        "cx": { "description": "Hug it out", "points": 100, "category": "self-care", "full": "Plushies are fine for this. Go for that good extended hug (within the tolerance of the recipient, especially if it's a critter), feel free to really squeeze if it's a plushie" },
        //"cy": { "description": "In-person meetup", "points": 100, "category": "self-care", "full": "Arrange to (or spontaneously show up to) hang out in person with people you care about" },
        "cz": { "description": "Switch spots", "points": 100, "category": "self-care", "full": "Physically move yourself to a different space (room to kitchen, chair to floor, inside to outside, anything works)" },
        "da": { "description": "Bio break", "points": 100, "category": "self-care", "full": "Hit the bathroom if needed, and also check in for hunger, thirst, muscle tightness, how you're feeling with the ambient temperature, and posture" },
        "db": { "description": "10 minute cronch", "points": 100, "category": "self-care", "full": "Write down at least 2 little things you want to get done. Set a timer for 10 minutes and GO HAM. Feel free to set aside a treat to have at the end (you can use plants for this if you don't want to use food, ex: the to-do list)" },
        //"dc": { "description": "Make YOURSELF smell good", "points": 100, "category": "self-care", "full": "Perfume you like, quick shower, dry shampoo (mine's corn starch, cocoa, cinnamon, and nutmeg!), chopping some onions so your hands smell amazing, whatever works" },
        //"dd": { "description": "Guided meditation", "points": 100, "category": "self-care", "full": "Do any guided meditation. Self-guided also counts, if you're up for it (\"I'm standing on the shore of a moonlit ocean. The waves are calm and gentle...\")" },
        "de": { "description": "Scribble shaping", "points": 100, "category": "self-care", "full": "Grab a piece of paper and draw a random shape or squiggle. Keep drawing to turn it into a character or creature" },
        "df": { "description": "Physical catharsis", "points": 100, "category": "self-care", "full": "If you've got some built-up energy of any sort (not just anger!), try punching a pillow, shadowboxing, shredding a piece of paper into tiny bits and tossing it, or even just bracing your palms against each other and pushing them together with both arms" },
        //"dg": { "description": "Do a shadow puppet", "points": 100, "category": "self-care", "full": "Bonus points if you look one up and try it out. Feel free to get goofy with it. Use props if you want (like an impromptu sock puppet)" },
        "dh": { "description": "Zone out", "points": 100, "category": "self-care", "full": "Zone entirely out. Doesn't mean dissociate or full-on meditate, just let yourself go slack and noodly and 100% unfocused" },
        //"di": { "description": "Say nice things about your work", "points": 100, "category": "self-care", "full": "Look at something you made (art, writing, code, food, whatever). Pick out 3 genuinely nice things to say about it" },
        "dj": { "description": "Try out an aesthetic", "points": 100, "category": "self-care", "full": "Be it an outfit, a style of art, the way your thought-voice sounds, imagining room decor or anything else, try genuinely exploring an aesthetic (like goth, cottagecore, ethereal...)" },
        "dk": { "description": "Avoid a bad habit", "points": 100, "category": "self-care", "full": "Pick a habit you'd like to break (ex: chewing down nails) and avoid it. Don't feel like you have to aim for the sky here (ex: trying to do absolutely 0 procrastination all day), just take some measure against it (like putting a dot of nontoxic ink you'll notice on the nail you tend to chew)" },
        //"dl": { "description": "Learn or invent a joke", "points": 100, "category": "self-care", "full": "The world can literally always use more puns. Make sure you inflict those on people." },
        "dm": { "description": "Engage all 5 senses", "points": 100, "category": "self-care", "full": "Engage your touch, sight, hearing, smell, and taste (and for bonus points, proprioception!) using your local environment. Ex: find something interesting to stare at, touch something with a noticeable texture and really focus on what that texture is..." },
        "dn": { "description": "Eat some FIBER", "points": 100, "category": "self-care", "full": "Remember: your gut is filled with wee little friends that help you stay healthy! Say thanks and give them a nice treat with something rich in fiber." },
        "do": { "description": "Work on a themed playlist", "points": 100, "category": "self-care", "full": "Any theme (genre, mood, a character you like...), try to pick a song to add to it, and maybe give the playlist a listen when you're done tweaking!" },
        //"dp": { "description": "2-hour news break", "points": 100, "category": "self-care", "full": "Check the time. For the next two hours at minimum, avoid checking whatever your usual news site(s) is/are. Or heck, take the rest of the day off from them! If it's really big and urgent, it'll probably show up as a phone alert anyways. If not, it'll still be there later" },
        "dq": { "description": "Pace", "points": 100, "category": "self-care", "full": "Put down what you're working on to just kind of wander around the area. Jog if you're feeling spicy. It's good thinking times!" },
        "dr": { "description": "Check the weather", "points": 100, "category": "self-care", "full": "Is it good for a walk out there? How's tomorrow looking? Any plans to take advantage of the weather if it's nice, or bunker down with something of the appropriate temperature if it's not?" },
        //"ds": { "description": "Seek quiet", "points": 100, "category": "self-care", "full": "Take a break from whatever noise/stimulation is around you by seeking some quiet" },
        //"dt": { "description": "Check finances", "points": 100, "category": "self-care", "full": "Check in with your account, credit card, etc. Especially check for any unexpected recurring purchases. This one's a free space if you check in with them often enough to know offhand" },
        "du": { "decription": "Confront an anxious task", "points": 100, "category": "self-care", "full": "Is there something in the immediate future that's making you a bit anxious? An email you're really not looking forward to sending, an appointment you're nervous to make, something you know you need to look into but are hesitant to? If you know you'll need to do it and it's on your mind, causing anxiety, you might be able to remove some weight from your shoulders by getting it done!" },
    }, "f": {
        "a": { "description": "Exactly 1 fest currency", "points": 100, "category": "fest", "full": "Get one single piece of fest currency from a battle" },
        "b": { "description": "Fest currency from all", "points": 100, "category": "fest", "full": "Get a piece of fest currency from every enemy in the battle" },
        "c": { "description": "Get a fest chest", "points": 100, "category": "fest", "full": "Get a fest chest!" },
        "d": { "description": "Currency back to back", "points": 100, "category": "fest", "full": "Get two battles in a row that drop currency" },
        "e": { "description": "3 elem/neut battles in a row", "points": 100, "category": "fest", "full": "Get 3 battles in a row that have at least 1 neutral or fest-element enemy" },
        "f": { "description": "Currency from boss", "points": 100, "category": "fest", "full": "Earn a piece of currency from a boss" },
        "g": { "description": "Get a festive drop", "points": 100, "category": "fest", "full": "Get something from a battle that ISN'T currency, but feels themed to the fest. A chunk of ore, a potted plant..." },
        "h": { "description": "All enemies element", "points": 100, "category": "fest", "full": "Fight a battle where all enemies are the fest's element" },
        "i": { "description": "All enemies neutral", "points": 100, "category": "fest", "full": "Fight a battle where all enemies are neutral element" },
        "j": { "description": "5 currency in 5 fights", "points": 100, "category": "fest", "full": "in the space of 5 battles, earn 5 pieces of fest currency" },
        "k": { "description": "Get the wrong chest", "points": 100, "category": "fest", "full": "Get a non-fest skin crate. Better luck next time!" },
        "l": { "description": "Fest elem familiar", "points": 100, "category": "fest", "full": "Get a familiar matching the fest's element" },
        "m": { "description": "3x elem/neut, no currency", "points": 100, "category": "fest", "full": "Win a fight with 3 fest-element and/or neutral enemies, but get no currency :(" },
        "n": { "description": "Prize, but no fest", "points": 100, "category": "fest", "full": "Win apparel, a scene, expensive battlestone, or other rare item and no currency" },
        "o": { "description": "Fest battlestone", "points": 100, "category": "fest", "full": "Get a battlestone matching the element of the festival" },
        "p": { "description": "Get 20 currency", "points": 100, "category": "fest", "full": "Earn at least 20 fest currency in total" },
        "q": { "description": "Fest currency", "points": 100, "category": "fest", "full": "Get at least one piece of fest currency. Nearly a free space (I hope!)" },
        "r": { "description": "5 battles, no fest", "points": 100, "category": "fest", "full": "Go 5 battles with no fest currency or chests" },
    }, "n": {
        "a": { "description": "Get a strange chest", "points": 100, "category": "notn", "full": "Congrats!" },
        "b": { "description": "2 chests in 3 battles", "points": 100, "category": "notn", "full": "2 chests in a battle also counts!" },
        "c": { "description": "4 different NotN items", "points": 100, "category": "notn", "full": "Food, mats, and chesets count. Must all be from 1 battle!" },
        "d": { "description": "Get 2x of a NotN item", "points": 100, "category": "notn", "full": "Including chests!" },
        "e": { "description": "Get chest from non-NotN", "points": 100, "category": "notn", "full": "Get a NotN chest from an enemy pack with no NotN enemies" },
        "f": { "description": "3 different NotN packs", "points": 100, "category": "notn", "full": "Fight 3 different arrangements of enemies that contain NotN enemies in one venue" },
        "g": { "description": "NotN gourmet", "points": 100, "category": "notn", "full": "Get 5 different NotN foods (can be across several battles)" },
        "h": { "description": "3+ NotN and plot", "points": 100, "category": "notn", "full": "Get 3+ NotN items (can have dupes) and imagine a jape, plot, or invention that'd use all of them" },
        "i": { "description": "MIMIC!", "points": 100, "category": "notn", "full": "Get a NotN enemy and mimic its pose and expression. Like janky yoga." },
        "j": { "description": "3+ items from a boss", "points": 100, "category": "notn", "full": "This one would be awful if it wasn't NotN, eh?" },
        "k": { "description": "genre swap!", "points": 100, "category": "notn", "full": "In the spirit of NotN chaos, change your own surroundings. Music genre, where you're sitting to grind..." }
    }, "l": {
        "a": { "description": "Exactly 1 currency", "points": 100, "category": "lesser_fest", "full": "Get just 1 piece of currency" },
        "b": { "description": "2 'currencies' at once", "points": 100, "category": "lesser_fest", "full": "Get two different currencies (ex: broken arrow and shield) or themed food" },
        "c": { "description": "Currency >= enemies", "points": 100, "category": "lesser_fest", "full": "Get as much currency (or more) than there are enemies" },
    }
};
// z is reserved for challenges specified in a loadable board
let challenge_code;
let board_size;
const difficulties = {
    "normal": ["e", "m"],
    "harder": ["e", "m", "m", "h"],
    "hardest": ["m", "h"],
    "Self-Care": ["s"],
    "Self-Care Extra": ["u"]
};
const bingo_challenge_extras = { "none": [], "NotN": ["n"], "elemental fest": ["f"], "minor fest": ["l"], "self-care extra": ["u"] };
// When there are (num) squares revealed, there should be idx_of(num)+1 plants revealed. If not, add another plant.
// Making it a dict certainly looks a bit silly, but it does make the later code very clean.
// TODO: Javascript has a list comprehension equivalent (I think?), so clean this up.
const plants_revealed_at_per_size = {
    3: { 8: 1 },
    5: { 7: 1, 14: 2, 20: 3, 25: 4 },
    7: { 8: 1, 15: 2, 22: 3, 28: 4, 34: 5, 39: 6, 44: 7, 49: 8 }
};
const plants_revealed_at_self_care = { 4: 1, 8: 2, 12: 3, 16: 4, 20: 5, 25: 6 };
let plants_revealed_at;
//let moved_the_touch = false;
const icons = [
    "https://i.imgur.com/GSNkSxm.png",
    "https://i.imgur.com/TuZ3QXY.png",
    "https://i.imgur.com/2Fbxx1b.png",
    "https://i.imgur.com/EHvEUAI.png",
    "https://i.imgur.com/M1AHxdW.png",
    "https://i.imgur.com/sey4Maz.png",
    "https://i.imgur.com/45exDh2.png",
    "https://i.imgur.com/GaJzue4.png"
];
let bingo_border_color = "#71b280";
let num_squares_revealed = 0;
let num_plants_revealed = 0;
let current_board = [];
let revealed_seeds = [];
let current_difficulty;
let bingo_plant_generated = false; // Used to track whether the bonus bingo seed has been revealed. We don't re-hide seeds.
let forced_random_seed = null; // "Child" pages can overwrite with a fixed seed, ex: self_care uses the date as a seed.
function setForcedSeed(seed) { forced_random_seed = seed; }
let rewards = {}; // the seeds to be rewarded, excepting the special bingo seed
let bingo_reward; // the special bingo seed reward
let had_bingo_last_turn = false; // used to skip re-running bingo display code if our status hasn't changed
let bingo_plant_data_url = null; // used both to store the bingo plant and check if we've had bingo in the past
const max_unique_challenge_attempts = 15; // Max number of retries allowed when trying to avoid duplicates
let current_challenge_code = null;
let challenge_list = [];
const dateString = new Date().getDate().toString();
let bingo_foliage_palettes = null;
let bingo_feature_palettes = null;
let bingo_accent_palettes = null;
let bingo_bases = null;
function setAvailableChallengeListFromCode(categories_code) {
    challenge_list = [];
    for (let entry of categories_code) {
        // for ex: every entry in all_challenges[e], give back e-a, e-b, e-c...
        if (entry) {
            challenge_list = challenge_list.concat(Object.keys(all_challenges[entry]).map(function (subcode) { return entry + "-" + subcode; }));
        }
    }
}
function setModifiedBingoSeedChances() {
    [bingo_bases, bingo_foliage_palettes, bingo_feature_palettes, bingo_accent_palettes] = calculateSeedChances();
}
function drawChallengesForBoard(size) {
    let chosen_already = new Set();
    let challenges = [];
    let choice, attempts;
    for (let i = 0; i < size * size; i++) {
        attempts = 0;
        choice = randomFromArray(challenge_list);
        while (attempts < max_unique_challenge_attempts && chosen_already.has(choice)) {
            choice = randomFromArray(challenge_list);
            attempts++;
        }
        challenges.push(choice);
        chosen_already.add(choice);
    }
    return challenges;
}
function assembleRewardList(size) {
    let reward_seeds = [];
    let num_rewards, plant_data;
    for (let i = 0; i < size * size; i++) {
        if (i in plants_revealed_at) {
            num_rewards = plants_revealed_at[i];
        }
    }
    num_rewards++; // bingo plant
    for (let i = 0; i < num_rewards + 1; i++) {
        if (forced_random_seed == null) {
            plant_data = genWithModifiedSeedChances(bingo_bases, null, null, bingo_foliage_palettes, bingo_feature_palettes, bingo_accent_palettes);
        }
        else {
            plant_data = gen_plant_data(0, forced_random_seed);
        }
        reward_seeds.push(encode_plant_data_v2(plant_data));
    }
    let rewards = [];
    for (let i = size * size; i > 0; i--) {
        if (i in plants_revealed_at) {
            rewards[i - 1] = reward_seeds.pop();
        }
    }
    return [rewards, reward_seeds.pop()];
}
function clear_board() {
    let board = document.getElementById("board_div");
    while (board.lastChild) {
        board.removeChild(board.lastChild);
    }
    current_board = [];
    num_squares_revealed = 0;
    num_plants_revealed = 0;
    had_bingo_last_turn = false;
    bingo_plant_data_url = null;
    setBingoPlantVisibility(false);
}
function has_bingo() {
    let bingo = false;
    // Naive method is fine here don't @ me
    // First we check for horizontal bingo
    for (let i = 0; i < current_board.length; i++) {
        if (current_board[i][0]["earned"]) {
            bingo = true; // temporary
            for (let j = 0; j < current_board[i].length; j++) {
                if (!current_board[i][j]["earned"]) {
                    bingo = false;
                    break;
                }
            }
            if (bingo) {
                break;
            }
        }
    }
    if (bingo) {
        return bingo;
    }
    // Vertical bingo is practically identical
    for (let i = 0; i < current_board[0].length; i++) {
        if (current_board[0][i]["earned"]) {
            bingo = true; // temporary
            for (let j = 0; j < current_board[0].length; j++) {
                if (!current_board[j][i]["earned"]) {
                    bingo = false;
                    break;
                }
            }
            if (bingo) {
                break;
            }
        }
    }
    if (bingo) {
        return bingo;
    }
    // Diagonal bingo
    bingo = true; // temporary
    for (let i = 0; i < current_board.length; i++) {
        if (!current_board[i][i]["earned"]) {
            bingo = false;
            break;
        }
    }
    if (bingo) {
        return bingo;
    }
    bingo = true; // temporary
    for (let i = 0; i < current_board.length; i++) {
        if (!current_board[current_board.length - 1 - i][i]["earned"]) {
            bingo = false;
            break;
        }
    }
    return bingo;
}
function generate_board_info(size, seed_override = null) {
    let challenges = drawChallengesForBoard(size);
    if (seed_override == null) {
        [rewards, bingo_reward] = assembleRewardList(size);
    }
    else {
        rewards = [];
        for (let i = size * size; i > 0; i--) {
            if (i in plants_revealed_at) {
                // Gotta be 0-indexed for legible save/load data...
                rewards[i - 1] = seed_override.pop();
            }
        }
        bingo_reward = seed_override.pop();
    }
    for (let i = 0; i < size; i++) {
        current_board.push([]);
        for (let j = 0; j < size; j++) {
            let challenge_name = challenges[i * size + j];
            current_board[i].push({
                "earned": false,
                "challenge": challenge_name,
                "reward": { "type": "none" }
            });
        }
    }
}
function draw_board() {
    let board = document.getElementById("board_div");
    for (let i = 0; i < current_board.length; i++) {
        let new_row = document.createElement('div');
        new_row.className = "bingo_row";
        board.appendChild(new_row);
        for (let j = 0; j < current_board[i].length; j++) {
            let current_square = current_board[i][j];
            const id = add_bingo_square(new_row, i, j, current_square["challenge"]);
            if (current_square["earned"]) {
                current_square["earned"] = false; // we're about to fake a click
                toggle_status({ "target": { "id": id } }, false);
                if (current_square["reward"]["type"] == "seed") {
                    revealed_seeds.push(current_square['reward']["value"]);
                }
            }
        }
    }
    if (revealed_seeds.length > 0) {
        document.getElementById("bingo_seed_list").innerHTML = revealed_seeds.join(", ");
    }
}
function generate_board(size, board_challenge_code, seed_override = null) {
    if (forced_random_seed == null) {
        plants_revealed_at = plants_revealed_at_per_size[size];
    }
    else {
        plants_revealed_at = plants_revealed_at_self_care;
    }
    if (board_challenge_code != current_challenge_code) {
        setAvailableChallengeListFromCode(board_challenge_code);
        current_challenge_code = board_challenge_code;
    }
    clear_board();
    generate_board_info(size, seed_override);
    draw_board();
}
// Reveal a plant in a square (either within the board or the "bonus bingo plant"
// Handles the work of generating the plant itself and adding the seed to the pile.
// Returns a dataURL to set as an image someplace.
async function genSeedForSquare(forced_random_offset = 0) {
    let plant_data;
    if (forced_random_offset == null) {
        plant_data = gen_plant_data(0);
    }
    else {
        // ONLY for forced_random seed generation, the bingo seed needs to increment num_plants_revealed
        plant_data = gen_plant_data(0, forced_random_offset + String(num_plants_revealed + bingo_plant_generated));
    }
    return encode_plant_data_v2(plant_data);
}
function toggle_status(e, generate_rewards = true) {
    let id = e.target.id;
    const coords = id.split("_");
    let row = parseInt(coords[0]);
    let col = parseInt(coords[1]);
    let square_info = current_board[row][col];
    let bingo_square = document.getElementById(id);
    square_info["earned"] = !square_info["earned"];
    bingo_square.lastChild.style.opacity = 0.2; // Make label translucent
    if (square_info["earned"]) {
        num_squares_revealed++;
        // We have a potential side-reward of RS
        if (generate_rewards) {
            getDissolvingRS(bingo_square, 1, 0.025)();
        }
        // Null is treated as 0...Javascript!
        if (num_plants_revealed < plants_revealed_at[num_squares_revealed]) {
            // Time to reveal a plant!
            num_plants_revealed++;
            // If we're loading a pre-generated bingo board, rewards are already in place
            if (generate_rewards) {
                // Rewards are zero-indexed, so we have to adjust.
                if (Object.prototype.hasOwnProperty.call(rewards, num_squares_revealed - 1)) {
                    square_info['reward'] = { "type": "seed", "value": rewards[num_squares_revealed - 1] };
                }
                else {
                    square_info['reward'] = { "type": "seed", "value": genSeedForSquare() };
                }
                revealed_seeds.push(square_info['reward']["value"]);
                //document.getElementById("bingo_seed_list").innerHTML = revealed_seeds.join(", ");
                // TODO: I can't figure out what causes this one, ugggh. Possibly a mismatch between save data and board settings?
                if (square_info['reward']['value'] === null) {
                    console.log("encountered ungenerated seed--making an emergency one!");
                    square_info['reward']['value'] = encode_plant_data_v2(gen_plant_data(0));
                }
                collectSeed(square_info['reward']["value"]);
                bubble_out(e.target, square_info['reward']["value"]);
            }
        }
        if (get_toggle_button_setting("icons") && generate_rewards && square_info["reward"]["type"] == "none") {
            square_info["reward"] = { "type": "icon", "value": icons[Math.floor(Math.random() * icons.length)] };
        }
        if (get_toggle_button_setting("icons") && square_info["reward"]["type"] == "icon") {
            bingo_square.style.background = 'url(' + square_info["reward"]["value"] + ')  no-repeat center center';
        }
        else if (square_info["reward"]["type"] == "seed") {
            let data_url = drawPlantForSquare(square_info["reward"]["value"]);
            bingo_square.style.background = 'url(' + data_url + ')  no-repeat center center';
        }
        else {
            bingo_square.style.background = "none";
        }
    }
    else {
        num_squares_revealed--;
        bingo_square.style.background = "none";
        bingo_square.lastChild.style.opacity = 1;
    }
    update_squares_til_if_present();
    const now_has_bingo = has_bingo();
    let shimmer_color = window.getComputedStyle(document.body, null).getPropertyValue("--accent-bright");
    if (now_has_bingo != had_bingo_last_turn) { // our bingo state has changed
        had_bingo_last_turn = now_has_bingo;
        setBingoPlantVisibility(now_has_bingo);
        if (now_has_bingo) {
            transition_all_bingo_borders("#ffffff", row, col);
        }
        else {
            shimmer_bingo_borders(bingo_border_color, shimmer_color, row, col);
        }
    }
    else if (!now_has_bingo) {
        shimmer_bingo_borders(bingo_border_color, shimmer_color, row, col);
    }
    // TODO: patch solution for the self-care board trying to save to the coli slot: disable it entirely. hopefully.
    if (forced_random_seed == null) {
        stashBingoState();
    }
    else {
        stashSelfCareState();
    }
}
function update_squares_til_if_present() {
    if (!document.getElementById("squares_til_seed")) {
        return;
    }
    let seed_at = "-";
    let size = current_board.length;
    for (let i = num_squares_revealed + 1; i <= size * size; i++) {
        if (i in plants_revealed_at) {
            seed_at = i - num_squares_revealed;
            break;
        }
    }
    document.getElementById("squares_til_seed").textContent = "Squares til the next plant: " + seed_at;
}
function transition_all_bingo_borders(color, origin_row, origin_column) {
    let root_delay = 70; // in milliseconds
    for (let i = 0; i < current_board.length; i++) {
        for (let j = 0; j < current_board[i].length; j++) {
            // Yes these lets are necessary
            let mapped_row = origin_row;
            let mapped_column = origin_column;
            // Delay proportional to distance from origin
            let delay = root_delay * (((mapped_column - j) ** 2 + (mapped_row - i) ** 2) ** (1 / 2));
            setTimeout(function () { document.getElementById(i + "_" + j).style.borderColor = color; }, delay);
        }
    }
}
function setBingoPlantVisibility(show_plant) {
    let parent_div = document.getElementById("bingo_plant_container_div");
    if (!show_plant) {
        parent_div.style.display = "none";
    }
    else {
        let target_div = document.getElementById("bingo_plant_div");
        if (bingo_plant_data_url == null) {
            bingo_plant_data_url = drawPlantForSquare(bingo_reward);
            revealed_seeds.push(bingo_reward);
            document.getElementById("bingo_seed_list").innerHTML = revealed_seeds.join(", ");
            // TODO: WHOA that's some jank--patch to avoid re-awarding bingo on page reload.
            if (!getSeedCollection().includes(bingo_reward)) {
                collectSeed(bingo_reward);
            }
            ;
        }
        target_div.style.background = 'url(' + bingo_plant_data_url + ')  no-repeat center center';
        parent_div.style.display = "block";
        bubble_out(target_div, bingo_reward);
    }
}
// Go through and either hide or show all non-generated-plant icons
function toggle_extra_icons() {
    for (let i = 0; i < current_board.length; i++) {
        for (let j = 0; j < current_board[i].length; j++) {
            const bingo_square = document.getElementById(i + "_" + j);
            let bingo_square_info = current_board[i][j];
            // Update any square that doesn't have icons, but could
            if (get_toggle_button_setting("icons") && bingo_square_info["earned"] && bingo_square_info['reward']["type"] == "none") {
                bingo_square_info["reward"] = { "type": "icon", "value": icons[Math.floor(Math.random() * icons.length)] };
            }
            // Toggle the icon
            if (bingo_square_info["earned"] && bingo_square_info['reward']["type"] == "icon") {
                if (get_toggle_button_setting("icons")) {
                    bingo_square.style.background = 'url(' + bingo_square_info["reward"]["value"] + ')  no-repeat center center';
                }
                else {
                    bingo_square.style.background = "none";
                }
            }
        }
    }
}
function shimmer_bingo_borders(original_color, new_color, origin_row, origin_column) {
    let root_delay = 100; // in milliseconds
    for (let i = 0; i < current_board.length; i++) {
        for (let j = 0; j < current_board[i].length; j++) {
            // Yes these lets are necessary
            let mapped_row = origin_row;
            let mapped_column = origin_column;
            // Delay proportional to distance from origin
            let delay = root_delay * (((mapped_column - j) ** 2 + (mapped_row - i) ** 2) ** (1 / 2));
            let flip_delay = delay + 200;
            setTimeout(function () { document.getElementById(i + "_" + j).style.borderColor = new_color; }, delay);
            setTimeout(function () { document.getElementById(i + "_" + j).style.borderColor = original_color; }, flip_delay);
        }
    }
}
function add_bingo_square(parent, column, row, challenge_name) {
    let id = column + "_" + row;
    let bingo_square = document.createElement('div');
    bingo_square.id = id;
    bingo_square.className = 'bingo_box';
    bingo_square.onmouseover = function () { document.getElementById("bingo_hint").textContent = challenge["full"]; };
    let label = document.createElement('label');
    let challenge;
    if (challenge_name[0] in all_challenges && challenge_name.slice(2) in all_challenges[challenge_name[0]]) {
        challenge = all_challenges[challenge_name[0]][challenge_name.slice(2)];
    }
    else {
        challenge = { "description": challenge_name }; // For custom challenges
    }
    label.htmlFor = id;
    label.className = 'bingo_label';
    label.appendChild(document.createTextNode(challenge["description"]));
    function pointerShowHint(e) {
        document.getElementById("bingo_hint").textContent = challenge["full"];
        if (e.target.hasPointerCapture(e.pointerId)) {
            e.target.releasePointerCapture(e.pointerId);
        }
    }
    bingo_square.addEventListener("pointerdown", pointerShowHint);
    bingo_square.addEventListener("pointerup", toggle_status);
    bingo_square.appendChild(label);
    parent.appendChild(bingo_square);
    return id;
}
function export_bingo() {
    let bingo_board = { "reward_mode": "numbered" };
    bingo_board["squares"] = minify_squares(current_board);
    bingo_board["rewards"] = rewards;
    bingo_board["bingo_reward"] = bingo_reward;
    if (Object.prototype.hasOwnProperty.call(all_challenges, "z")) {
        // Make sure we're on a board that uses the on-load custom challenges, so
        // they don't stick around forever
        let uses_custom_onload = false;
        for (let i = 0; i < bingo_board["squares"].length; i++) {
            for (let j = 0; j < bingo_board["squares"][i].length; j++) {
                if (bingo_board["squares"][i][j][1].slice(0, 1) == "z") {
                    uses_custom_onload = true;
                }
            }
        }
        if (uses_custom_onload) {
            bingo_board["custom_challenges"] = all_challenges["z"];
        }
    }
    return JSON.stringify(bingo_board);
}
function export_bingo_onclick() {
    let textArea = document.createElement("textarea");
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.background = 'transparent';
    textArea.value = export_bingo();
    document.body.appendChild(textArea);
    //textArea.focus();
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    document.execCommand("copy");
    let clicked = document.getElementById("Export");
    clicked.textContent = "[Copied!]";
    setTimeout(function () { clicked.textContent = "[Export]"; }, 1000);
}
function import_bingo(bingo_board) {
    clear_board();
    if (Object.prototype.hasOwnProperty.call(bingo_board, "custom_challenges")) {
        all_challenges["z"] = bingo_board["custom_challenges"];
    }
    current_board = deminify_squares(bingo_board["squares"]);
    rewards = bingo_board["rewards"];
    bingo_reward = bingo_board["bingo_reward"];
    const size = bingo_board["squares"].length;
    plants_revealed_at = {};
    let num_revealed = 1;
    for (let i = 0; i < size ** 2; i++) {
        if (rewards[i] != null) {
            plants_revealed_at[i + 1] = num_revealed;
            num_revealed++;
        }
    }
    draw_board();
}
function import_bingo_onclick() {
    let bingo_board = JSON.parse(prompt("Paste in your board:"));
    import_bingo(bingo_board);
}
function stashBingoState() {
    localStorage.bingo_state = export_bingo();
}
function stashSelfCareState() {
    localStorage.selfcare_bingo_state = (export_bingo() + "|SEP|" + dateString);
}
function restoreBingoStateIfPresent() {
    if (forced_random_seed == null) {
        if (localStorage.bingo_state == undefined) {
            return false;
        }
        import_bingo(JSON.parse(localStorage.bingo_state));
    }
    else {
        if (localStorage.selfcare_bingo_state == undefined) {
            return false;
        }
        let storageInfo = localStorage.selfcare_bingo_state.split("|SEP|");
        if (storageInfo[1] != dateString) {
            return false;
        }
        import_bingo(JSON.parse(storageInfo[0]));
    }
    let p = document.createElement("p");
    p.innerHTML = "";
    p.style.color = "#8CDF8F";
    document.getElementById("board_div").appendChild(p);
    const anim = p.animate([
        {
            opacity: 1
        },
        {
            opacity: 0
        }
    ], {
        duration: 5000,
        easing: 'linear',
    });
    anim.onfinish = () => { p.remove(); };
    return true;
}
function toggle_hints() {
    if (get_toggle_button_setting("hints")) {
        document.getElementById("bingo_hint").style.visibility = "visible";
    }
    else {
        document.getElementById("bingo_hint").style.visibility = "hidden";
    }
}
// Attempts to make the save data more copy-pasteable
function minify_squares(to_minify) {
    let minified_board = [];
    for (let i = 0; i < to_minify.length; i++) {
        let minified_row = [];
        for (let j = 0; j < to_minify[i].length; j++) {
            let minned = [to_minify[i][j]["earned"], to_minify[i][j]["challenge"]];
            if (to_minify[i][j]["reward"]["type"] != "none") {
                minned.push(to_minify[i][j]["reward"]["type"]);
                minned.push(to_minify[i][j]["reward"]["value"]);
            }
            minified_row.push(minned);
        }
        minified_board.push(minified_row);
    }
    return minified_board;
}
function deminify_squares(to_deminify) {
    let deminified_board = [];
    for (let i = 0; i < to_deminify.length; i++) {
        let deminified_row = [];
        for (let j = 0; j < to_deminify[i].length; j++) {
            let deminned = {
                "earned": to_deminify[i][j][0],
                "challenge": to_deminify[i][j][1]
            };
            if (to_deminify[i][j].length > 2) {
                deminned["reward"] = {
                    "type": to_deminify[i][j][2],
                    "value": to_deminify[i][j][3]
                };
            }
            else {
                deminned["reward"] = { "type": "none" };
            }
            deminified_row.push(deminned);
        }
        deminified_board.push(deminified_row);
    }
    return deminified_board;
}
function update_uncheckable(e) {
    let total = 0;
    if (document.getElementById("difficulty_select_normal").checked) {
        total += 1;
    }
    else if (document.getElementById("difficulty_select_harder").checked) {
        total += 3;
    }
    else if (document.getElementById("difficulty_select_hardest").checked) {
        total += 5;
    }
    if (document.getElementById("size_select_5x5").checked) {
        total += 1;
    }
    else if (document.getElementById("size_select_7x7").checked) {
        total += 2;
    }
    let foliage_checked = 0;
    let foliage_options = document.getElementById("foliage_category_checkbox_div").children;
    for (let i = 0; i < foliage_options.length; i++) {
        if (foliage_options[i].checked) {
            foliage_checked++;
        }
    }
    // Stop someone from unchecking the last category (more relevant for palettes)
    if (foliage_checked == 0 && e.target.id.startsWith("foliage_deselect_")) {
        e.target.checked = true;
        foliage_checked = 1;
    }
    total -= (Object.keys(foliage_by_category).length - foliage_checked);
    let palette_checked = 0;
    let palette_options = document.getElementById("palette_category_checkbox_div").children;
    for (let i = 0; i < palette_options.length; i++) {
        if (palette_options[i].checked) {
            palette_checked++;
        }
    }
    if (palette_checked == 0 && e.target.id.startsWith("palette_deselect_")) {
        e.target.checked = true;
        palette_checked = 1;
    }
    total -= (Object.keys(palettes_by_category).length - palette_checked);
    document.getElementById("uncheck_counter").textContent = "Can uncheck: " + total;
    let accept_button = document.getElementById("settings_accept_button");
    if (total < 0) {
        accept_button.classList.add("disabled");
        accept_button.setAttribute("tabindex", -1);
    }
    else {
        accept_button.classList.remove("disabled");
        accept_button.setAttribute("tabindex", 0);
    }
}
function gen_bingo_option_div(title, radio_name, options, checked_idx, onclick = false, break_between_options = false) {
    let new_div = document.createElement("div");
    new_div.classList.add('radio-button');
    let new_header = document.createElement("h3");
    new_header.textContent = title;
    new_header.classList.add("bingo-settings-title");
    new_div.appendChild(new_header);
    for (let i = 0; i < options.length; i++) {
        if (onclick) {
            addRadioButton(new_div, radio_name, options[i], i == checked_idx, update_uncheckable);
        }
        else {
            addRadioButton(new_div, radio_name, options[i], i == 0);
        }
        if (break_between_options) {
            new_div.appendChild(document.createElement("br"));
        }
        ;
    }
    return new_div;
}
// A question: why do we make this entirely in JS instead of making some in the HTML and hiding it?
// An answer: because I got lost in the JS sauce and forgot that was an option until later
function launch_config_dialogue() {
    let modal = document.createElement("div");
    modal.classList.add("block_window");
    let modal_display = document.createElement("div");
    modal_display.classList.add("bingo-popup");
    document.body.appendChild(modal);
    let header = document.createElement("h2");
    header.textContent = "Bingo Configuration";
    header.style.textAlign = "center";
    modal_display.appendChild(header);
    let side_by_side_div = document.createElement("div");
    side_by_side_div.classList.add("side-by-side");
    modal_display.appendChild(side_by_side_div);
    let options_display = document.createElement("div");
    options_display.classList.add("garden_util_box");
    options_display.appendChild(gen_bingo_option_div("Difficulty", "difficulty_select", ["normal", "harder", "hardest"], 0, true, false));
    options_display.appendChild(gen_bingo_option_div("Size", "size_select", ["3x3", "5x5", "7x7"], 1, true, false));
    options_display.appendChild(gen_bingo_option_div("Added Challenges", "challenge_select", ["none", "elemental fest", "NotN", "minor fest", "self-care extra"], 0, false, true));
    side_by_side_div.appendChild(options_display);
    let spacer_div = document.createElement("div");
    spacer_div.style.width = "5%";
    side_by_side_div.appendChild(spacer_div);
    let uncheck_div = document.createElement("div");
    uncheck_div.classList.add("garden_util_box");
    uncheck_div.style.textAlign = "left";
    let uncheck_counter = document.createElement("h3");
    uncheck_counter.textContent = "Can uncheck: 2";
    uncheck_counter.classList.add("bingo-settings-title");
    uncheck_counter.id = "uncheck_counter";
    uncheck_div.appendChild(uncheck_counter);
    let side_by_side_uncheck_div = document.createElement("div");
    side_by_side_uncheck_div.style.display = "flex";
    uncheck_div.appendChild(side_by_side_uncheck_div);
    let foliage_category_div = document.createElement("div");
    foliage_category_div.id = "foliage_category_checkbox_div";
    for (let category of Object.keys(foliage_by_category)) {
        makeSortCheckmark("foliage_deselect_", category, foliage_category_div, true);
    }
    for (let child of foliage_category_div.children) {
        child.onclick = update_uncheckable;
    }
    side_by_side_uncheck_div.appendChild(foliage_category_div);
    let palette_category_div = document.createElement("div");
    palette_category_div.id = "palette_category_checkbox_div";
    for (let palette of Object.keys(palettes_by_category)) {
        makeSortCheckmark("palette_deselect_", palette, palette_category_div, true);
    }
    for (let child of palette_category_div.children) {
        child.onclick = update_uncheckable;
    }
    side_by_side_uncheck_div.appendChild(palette_category_div);
    side_by_side_div.appendChild(uncheck_div);
    let button_container = document.createElement("div");
    button_container.style.padding = "20px";
    button_container.style.display = "flex";
    button_container.style.justifyContent = "center";
    let accept_button = document.createElement("input");
    accept_button.type = "button";
    accept_button.onclick = function () { completeSetup(); document.body.removeChild(modal); };
    accept_button.value = "Accept";
    accept_button.style.width = "50%";
    accept_button.id = "settings_accept_button";
    accept_button.classList.add("chunky_fullwidth");
    button_container.appendChild(accept_button);
    modal_display.appendChild(button_container);
    modal.appendChild(modal_display);
}
function setBoardInfo() {
    let diff = getRadioValue("difficulty_select");
    let extra = bingo_challenge_extras[getRadioValue("challenge_select")];
    let code = difficulties[diff];
    code = code.concat(extra);
    code = code.concat(extra); // Bonus weighting for the special challenges
    if (diff == "Harder") { // extra-long set of challenges, crowds out the special ones
        code = code.concat(extra);
    }
    challenge_code = code;
    board_size = Number(getRadioValue("size_select").split("x").slice(0, 1));
}
function do_bingo_setup(with_config) {
    if (with_config) {
        launch_config_dialogue();
    }
    let settings_div = document.getElementById("settings_div");
    settings_div.appendChild(gen_func_button("Configure", launch_config_dialogue));
    settings_div.appendChild(gen_toggle_button("icons", toggle_extra_icons, false));
    settings_div.appendChild(gen_toggle_button("hints", toggle_hints));
    settings_div.appendChild(gen_func_button("New Board", relaunchBoard));
    settings_div.appendChild(gen_func_button("Export", export_bingo_onclick));
    settings_div.appendChild(gen_func_button("Import", import_bingo_onclick));
    toggle_extra_icons();
    toggle_hints();
}
function relaunchBoard() {
    generate_board(board_size, challenge_code);
    stashBingoState();
}
function completeSetup() {
    setBoardInfo();
    calculateSeedChances();
    generate_board(board_size, challenge_code);
    update_squares_til_if_present();
    document.getElementById("squares_til_seed").removeAttribute("hidden");
    try {
        restoreBingoStateIfPresent();
    }
    catch (e) {
        alert("Malformed old bingo state, generating a new board!");
        console.log(e);
    }
}
do_bingo_setup(document.getElementById("stupid_hack") != undefined); // check for a magic id that tells us we want a config screen. oop.
export { difficulties, bingo_challenge_extras, current_difficulty, setForcedSeed, generate_board, export_bingo_onclick, import_bingo_onclick, restoreBingoStateIfPresent, toggle_extra_icons, toggle_hints, update_squares_til_if_present, stashBingoState, setModifiedBingoSeedChances, do_bingo_setup };
