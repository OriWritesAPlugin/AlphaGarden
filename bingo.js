        var alt_background = "linear-gradient(to right, #134e5e, #71b280)";

        all_challenges = {"e": { 
            "a": {"description": "No drops", "points": 300, "category": "coli", "full": "Receive no drops from a battle"},
            "b": {"description": "Dragon misses", "points": 50, "category": "coli", "full": "Any of your dragons misses an attack"},
            "c": {"description": "Enemy misses", "points": 50, "category": "coli", "full": "Any enemy misses its attack"},
            "d": {"description": "Dragon crits", "points": 50, "category": "coli", "full": "Any dragon lands a critical hit"},
            "e": {"description": "All enemies 1 species", "points": 50, "category": "coli", "full": "Win a battle where all enemies are the same species. Bosses count!"},
            "f": {"description": "Any familiar", "points": 100, "category": "coli", "full": "Get any familiar"},
            "g": {"description": "Neutral elem familiar", "points": 200, "category": "coli", "full": "Get a familiar that, as a coli enemy, is neutral element"},
            "h": {"description": "Venue elem familiar", "points": 200, "category": "coli", "full": "Get a familiar that, as a coli enemy, has an element matching the venue's. If in doubt, pick the element you think matches the venue aesthetic!"},
            "i": {"description": "Swipp or Bald item", "points": 50, "category": "coli", "full": "Get any item that's used in a Swipp or Baldwin trade"},
            "j": {"description": "5+ DISTINCT items", "points": 200, "category": "coli", "full": "Get 5+ DIFFERENT items (counted as 5+ squares in the post-battle loot screen) from a single battle"},
            "k": {"description": "Get something green", "points": 100, "category": "coli", "full": "Get any item that's mostly green, such as a green plant, a green scarf, a greenish-colored fish..."},
            "l": {"description": "Openable", "points": 100, "category": "coli", "full": "Get any item that you open up to receive more loot, like a fishscale basket"},
            "m": {"description": "Captcha", "points": 100, "category": "coli", "full": "Run into a coli captcha (you don't need to pass it)"},
            "n": {"description": "Any battle stone", "points": 100, "category": "coli", "full": "Get ANY battle stone whatsoever"},
            "o": {"description": "Health potion", "points": 150, "category": "coli", "full": "Get ANY of the potions (but not a tincture)"},
            "p": {"description": "3x 1 item", "points": 200, "category": "coli", "full": "Get 3 of the SAME item (so a 3 on at least one item box in the post-battle loot screen)"},
            "q": {"description": "Free space", "points": 0, "category": "neutral", "full": "Claim me! :]"},
            "r": {"description": "Spend 5 min in coli", "points": 200, "category": "coli", "full": "Spend 5 minutes coli-ing; doesn't \"stack\" with other time squares (5+15=20 minutes total)"},
            "s": {"description": "Get something brown", "points": 100, "category": "coli", "full": "Get any item that's mostly brown, such as a brown rock, a brownish granola bar, a brown otter..."},
            "t": {"description": "5+ items", "points": 100, "category": "coli", "full": "Get 5+ TOTAL items (so if you add up the item counts in the post-battle loot screen, you get at least 5)"},
            "u": {"description": "Battle enemy + palette swap", "points": 100, "category": "coli", "full": "Battle both (or at least 2) versions of an enemy in the same battle (like a dryad + autumn dryad)"},
            "v": {"description": "Get something red", "points": 100, "category": "coli", "full": "Get any item that's mostly red, such as a slash battlestone, a red flower..."},
            "w": {"description": "Item + its recolor", "points": 100, "category": "coli", "full": "Get an item and its color variant in the same battle (like a micro deer + dwarf fawn)"},
            "x": {"description": "Get a flower", "points": 100, "category": "coli", "full": "Get any item that could be considered a flower, be it food, material, apparel, etc."},
                      }, "m": {
            "a": {"description": "Any apparel", "points": 350, "category": "coli", "full": "Get any apparel, such as Veteran's Eye Scar"},
            "b": {"description": "Boss fight", "points": 250, "category": "coli", "full": "Fight any boss. You don't have to win!"},
            "c": {"description": "Acuity or might fragment", "points": 250, "category": "coli", "full": "Get one of the acuity or might fragment battle stones, any element"},
            "d": {"description": "Berserk or scholar stone", "points": 450, "category": "coli", "full": "Get the berserk battle stone or scholar battle stone"},
            "e": {"description": "Elemental attack stone", "points": 250, "category": "coli", "full": "Get ANY elemental attack stone, such as Sear or Mana Bolt"},
            "f": {"description": "Gene", "points": 500, "category": "coli", "full": "Get ANY gene scroll, modern or ancient"},
            "g": {"description": "3x Swipp or Bald item", "points": 300, "category": "coli", "full": "Get 3 Swipp and/or Baldwin items in a single battle. They can (but don't have to) all be the same item"},
            "h": {"description": "Skin or skin crate", "points": 450, "category": "coli", "full": "Get a skin or anything you open to receive a skin, including crates and chests"},
            "i": {"description": "Scroll of renaming", "points": 400, "category": "coli", "full": "Get a scroll of renaming (remember: you can check the game database for drop locations)"},
            "j": {"description": "Vista", "points": 450, "category": "coli", "full": "Get any vista! Getting one out of a NotN chest counts (so long as you won the chest in the coli)"},
            "k": {"description": "Eye vial", "points": 550, "category": "coli", "full": "Get any of the eye vials, such as a vial of hypnotic sight"},
            "l": {"description": "Max breath on 1 dragon", "points": 350, "category": "coli", "full": "Get any of your dragons to full breath! You can mouse over the breath bar to check"},
            "m": {"description": "Do square above or below", "points": 200, "category": "neutral", "full": "Complete the square above and/or below this one"},
            "n": {"description": "Do square left or right", "points": 200, "category": "neutral", "full": "Complete the square to the left and/or right of this one"},
            "o": {"description": "Do 2 corner squares", "points": 200, "category": "neutral", "full": "Complete 2 of the four corner squares. If this is in a corner square, it counts!"},
            "p": {"description": "Spend 15 min in coli", "points": 600, "category": "coli", "full": "Spend 15 minutes coli-ing; doesn't \"stack\" with other time squares (5+15=20 minutes total)"},
            "q": {"description": "Exactly 6 DISTINCT items", "points": 550, "category": "coli", "full": "Get exactly 6 DIFFERENT items (counted as 6 squares in the post-battle loot screen) from a single battle"},
            "r": {"description": "4-enemy pack", "points": 250, "category": "coli", "full": "Fight four enemies at once. You don't have to win!"},
            "s": {"description": "7+ TOTAL items", "points": 500, "category": "coli", "full": "Get 7+ TOTAl items (so if you add up the item counts in the post-battle loot screen, you get at least 7)"},
            "t": {"description": "Max breath on all attackers", "points": 300, "category": "coli", "full": "Get any of your actively-fighting dragons to full breath! If you're training fodder, only your trainer(s) are required"},
            "u": {"description": "Get a rock", "points": 200, "category": "coli",  "full": "Get any item that could be considered a rock, be it a crystal, a battle stone depicting a rock (fragments), etc."},
            "v": {"description": "5 fights w/o trainer dmg'd", "points": 200, "category": "coli", "full": "Win 5 fights in a row without your trainer(s) (or farmer(s)) taking damage. Fodder can be damaged!"},
            "w": {"description": "Win w/o using elim", "points": 200, "category": "coli", "full": "Win a fight without using eliminate; any other attack can be used!"},
            "x": {"description": "Miss an eliminate", "points": 200, "category": "coli", "full": "Have a dragon use eliminate but miss. Consolation prize!"},
            "y": {"description": "All drops are food", "points": 200, "category": "coli", "full": "EVERY item that drops from a battle is food, and at least one item drops"},
            "z": {"description": "Clear a + shape", "points": 200, "category": "coli", "full": "Clear a square plus the square above, below, left, and right of it. Can be anywhere on the board"},
            "aa": {"description": "Every enemy drops food", "points": 200, "category": "coli", "full": "Get a number of enemy-specific food items greater than or equal to the number of enemies you fought"},
            //"v": {"description": "15 of any item", "points": 500, "category": "coli"},
                    }, "h": {
            "a": {"description": "Boss familiar", "points": 3000, "category": "coli", "full": "Get a boss enemy as a familiar"},
            "b": {"description": "Wing or body apparel", "points": 2500, "category": "coli", "full": "Get any piece of apparel that goes on the wings or body, like a date plumed cover or green lace waist frill"},
            "c": {"description": "Runestone", "points": 2500, "category": "coli", "full": "Get any of the elemental runestones (doesn't have to be a Swipp/Baldwin one)"},
            "d": {"description": "Deity doll", "points": 2500, "category": "coli", "full": "Get any of the deity dolls, such as the playful windsinger puppet"},
            "e": {"description": "Ambush or rally stone", "points": 1000, "category": "coli", "full": "Get the ambush battle stone or rally battle stone"},
            "f": {"description": "2 familiars at once", "points": 2000, "category": "coli", "full": "Get two familiars from the same battle"},
            "g": {"description": "Unhatched egg", "points": 3000, "category": "coli", "full": "Get any unhatched egg. Nocturne eggs count (if you got the chest in the coli!)"},
            "h": {"description": "Venue apparel", "points": 1000, "category": "coli", "full": "Get any piece of venue-exclusive apparel, such as a piece of the \"Blooming Wood\" set in the Blooming Grove (blooming woodbrace, etc)"},
            "i": {"description": "2 boss fights in a row", "points": 1000, "category": "coli", "full": "Fight two bosses back to back. You don't have to beat both (or either, if you restart and immediately get another)"},
            "j": {"description": "2 misses in a row", "points": 800, "category": "coli", "full": "Miss two attacks back-to-back. They don't have to be elims, but they probably were..."},
            "k": {"description": "Eliminate", "points": 3000, "category": "coli", "full": "Get an eliminate to drop! Lucky! Remember you can check the item database to see where things drop"},
            "l": {"description": "Swipp, Bald, or hibden fam", "points": 1600, "category": "coli", "full": "Get a familiar needed for one of those three site features. You may want to consult a masterlist guide to see what counts in your current venue"},
            "m": {"description": "Spend 30 min in coli", "points": 1200, "category": "coli", "full": "Spend 30 minutes coli-ing; doesn't \"stack\" with other time squares (5+30=35 minutes total)"},
            "n": {"description": "2x openable at once", "points": 800, "category": "coli", "full": "Get two openables from the same battle, such as 2 fishscale baskets. Don't have to be the same item, and chests count!"},
            "o": {"description": "2 crits in a row", "points": 800, "category": "coli", "full": "Have your dragons land two critical hits in a row! Doesn't have to be the same dragon"},
            "p": {"description": "Head, limb, or tail apparel", "points": 1200, "category": "coli", "full": "Get any piece of apparel that goes on the head, limb, or tail, like a soft pink fillet"},
            "q": {"description": "Clan element familiar", "points": 1200, "category": "coli", "full": "Get a familiar that, as a coli enemy, has an element matching your clan's"},
            "r": {"description": "7+ DISTINCT items", "points": 800, "category": "coli", "full": "Get 7+ DIFFERENT items (counted as 7+ squares in the post-battle loot screen) from a single battle"},
            "s": {"description": "3+ different food types", "points": 800, "category": "coli", "full": "Get food from at least 3 of the 4 FR food categories (plant, seafood, etc) from a single battle"},
            "t": {"description": "5+ items of different colors", "points": 800, "category": "coli", "full": "Get 5+ items in 1 battle that are broadly all different colors (a pink flower, a blue flower, etc...)"},
            "u": {"description": "Clan elem battle stone", "points": 1000, "category": "coli", "full": "Get a battle stone with an element matching your clan's, such as Leaf Bolt or a Natural Might Fragment for a Nature clan"},
            "w": {"description": "Familiar of favorite color", "points": 500, "category": "coli", "full": "Get a familiar that is, broadly speaking, your favorite color"},
            "x": {"description": "Neutral elem battle stone", "points": 500, "category": "coli", "full": "Get a non-elemental battle stone, such as Aid, Slash, or Field Manual"},
            "y": {"description": "Same dragon hit 2x in row", "points": 500, "category": "coli", "full": "Have a dragon be the one to take an enemy hit twice in a row (across battles is fine)"},
            "z": {"description": "Get the captcha EXP buff", "points": 500, "category": "coli", "full": "Solve a captcha and receive the EXP increase buff"},
            "aa": {"description": "Dodge a boss attack", "points": 500, "category": "coli", "full": "AKA the boss misses your dragon!"},
            "ab": {"description": "Same pack 2x in a row", "points": 500, "category": "coli", "full": "Fight the same enemy pack back to back. The same boss twice in a row counts!"},
                  }, "s": {
            "a": {"description": "Drink a glass of water", "points": 100, "category": "self-care", "full": "Any size is good!"},
            "b": {"description": "Head outside", "points": 100, "category": "self-care", "full": "If the weather or surroundings are bad for going outside, try cracking a window, or at least listening to some nature sounds!"},
            "c": {"description": "Do something energetic", "points": 100, "category": "self-care", "full": "Anything that raises your heart rate or engages your muscles works"},
            "d": {"description": "Socialize (online OK!)", "points": 100, "category": "self-care", "full": "Interact (preferably positively!) with anyone you like"},
            "e": {"description": "Another glass of water!", "points": 100, "category": "self-care", "full": "Keep it up!"},
            "f": {"description": "Get 2+ proper meals", "points": 100, "category": "self-care", "full": "The definition of \"proper meal\" is up to you! For those of us who struggle a bit, try to feel satiated"},
            "g": {"description": "Say something nice about yourself", "points": 100, "category": "self-care", "full": "For bonus points, name something that isn't inherently tied to how helpful you are to others"},
            "h": {"description": "Look forward to something", "points": 100, "category": "self-care", "full": "Anything you like, no matter how small or simple"},
            "i": {"description": "Brush your teeth", "points": 100, "category": "self-care", "full": "No matter how long you do it for, it's way better than not doing it!"},
            "j": {"description": "Touch a live thing (plants OK!)", "points": 100, "category": "self-care", "full": "Getting a hug, petting your cat, handling your houseplant, they all count"},
            "k": {"description": "Finish a task", "points": 100, "category": "self-care", "full": "Any task you like, and you can absolutely double-count it on the to-do list"},
            "l": {"description": "Get dressed", "points": 100, "category": "self-care", "full": "Wear anything you'd be comfortable going outside in"},
            "m": {"description": "Free space!", "points": 100, "category": "neutral", "full": "Claim me! :D"},
            "n": {"description": "Meditate, 5+ min", "points": 100, "category": "self-care", "full": "Timers and guided meditations are a big help."},
            "o": {"description": "Put on some music", "points": 100, "category": "self-care", "full": "Any music works! What suits your mood?"},
            "p": {"description": "Do something with your hands", "points": 100, "category": "self-care", "full": "Anything tactile, like making food, digging in the dirt, etc."},
            "q": {"description": "ANOTHER glass of water!", "points": 100, "category": "self-care", "full": "Last water on the board, never the last in our hearts"},
            "r": {"description": "Release shoulder, back, jaw tension", "points": 100, "category": "self-care", "full": "If you feel something like a little shiver, you're doing it great!"},
            "s": {"description": "Stretch!", "points": 100, "category": "self-care", "full": "Standard wakeup stretches count"},
            "t": {"description": "Smell something nice", "points": 100, "category": "self-care", "full": "Anything noticeably pleasant, like a favored food, fresh air, or a nice candle"},
            "u": {"description": "Create something", "points": 100, "category": "self-care", "full": "It can be anything! Digital art, a poem, a cube made of clay..."},
            "v": {"description": "Do something pleasantly mindless", "points": 100, "category": "self-care", "full": "I still like looking through cat pictures"},
            "w": {"description": "Learn something new", "points": 100, "category": "self-care", "full": "Can be about anything: dinosaurs, gardening, car maintenance..."},
            "x": {"description": "10 deep breaths", "points": 100, "category": "self-care", "full": "Slowly fill your lungs, hold a beat, exhale, repeat"},
            "y": {"description": "Work on a good habit", "points": 100, "category": "self-care", "full": "Are you working to develop a skill, be more active, eat more regularly? Anything counts!"},
                    }, "u": {
            "a": {"description": "Frolic!", "points": 100, "category": "self-care", "full": "Doesn't have to be outside, but don't be embarrassed to move joyfully!"},
            "b": {"description": "Lay on the floor", "points": 100, "category": "self-care", "full": "Flat, spread-eagle, try to get your back flush against the floor"},
            "c": {"description": "Experience noticeable temperature", "points": 100, "category": "self-care", "full": "Stick your head in the fridge, take a shower, etc"},
            "d": {"description": "Eat some tactile food", "points": 100, "category": "self-care", "full": "Examples are a softboiled egg (you need to peel it), pistachios or sunflower seeds (you need to remove the shell), etc"},
            "e": {"description": "Get your heart rate up", "points": 100, "category": "self-care", "full": "Meet yourself where you are! A few jumping jacks, a jog, whatever gets your heart going"},
            "f": {"description": "Keep water nearby", "points": 100, "category": "self-care", "full": "Fill a bottle (preferably reusable) and keep it nearby for easy hydration"},
            "g": {"description": "Make music", "points": 100, "category": "self-care", "full": "Can be as simple as humming along to your favorite tune or a one-person jam session"},
            "h": {"description": "Dance", "points": 100, "category": "self-care", "full": "...like nobody's watching!"},
            "i": {"description": "Solve any logic puzzle", "points": 100, "category": "self-care", "full": "Sudoku, grid logic puzzles, etc. Try to do one that isn't easy for you!"},
            "j": {"description": "Use your jaw muscles", "points": 100, "category": "self-care", "full": "Tip: frozen gummy bears work well for this. Grab one for the left molars, one for the right. Jerky and gum, too!"},
            "k": {"description": "Reassuring self-talk", "points": 100, "category": "self-care", "full": "ex: \"it's normal to say something a little awkwardly, everyone does and no one remembers anyone else's, too busy thinking about their own\""},
            "l": {"description": "Prep for breakfast", "points": 100, "category": "self-care", "full": "Make sure you have what you need to start tomorrow with a filling (and easy, if it helps!) meal"},
            "m": {"description": "Notice 10 things around you", "points": 100, "category": "self-care", "full": "Let your eyes flick to something, mentally \"name\" that thing (ex: \"potted plant\"), and repeat"},
            "n": {"description": "Check for understimulation", "points": 100, "category": "self-care", "full": "Understimulation can show itself as \"brain static\", restlessness, distractability, etc. Give yourself some enrichment! PSA: if you're seemingly immune to caffeine otherwise, try some when understimulated"},
            "o": {"description": "Look deeply at something pleasant", "points": 100, "category": "self-care", "full": "For example, an mp4 of a cute dog. Try to focus on only that for at least a few seconds"},
            "p": {"description": "Tire out a non-cardiac muscle", "points": 100, "category": "self-care", "full": "Squats are great for engaging a lot of muscles at once"},
            "q": {"description": "Do something you've put off", "points": 100, "category": "self-care", "full": "Put in even minutes of work on something you've been putting off"},
            "r": {"description": "Jot down how you're feeling", "points": 100, "category": "self-care", "full": "Write a few sentences on how you're doing right now. You can delete/destroy them when you're done, if you like"},
            "s": {"description": "Name 3 things you've accomplished today", "points": 100, "category": "self-care", "full": "Meet yourself where you are--if it's a step for you (like eating a full meal), it's an accomplishment, period!"},
            "t": {"description": "", "points": 100, "category": "self-care", "full": ""},
            "u": {"description": "", "points": 100, "category": "self-care", "full": ""},
            "v": {"description": "", "points": 100, "category": "self-care", "full": ""},
            "w": {"description": "", "points": 100, "category": "self-care", "full": ""},
            "x": {"description": "", "points": 100, "category": "self-care", "full": ""},
            "y": {"description": "", "points": 100, "category": "self-care", "full": ""},
            "z": {"description": "", "points": 100, "category": "self-care", "full": ""},
            "aa": {"description": "", "points": 100, "category": "self-care", "full": ""},
            "ab": {"description": "", "points": 100, "category": "self-care", "full": ""},
            "ac": {"description": "", "points": 100, "category": "self-care", "full": ""},
            "ad": {"description": "", "points": 100, "category": "self-care", "full": ""},
        }};

        // `fixed_rarity`: The rarity of plants doesn't grow as you uncover more squares
        const difficulties = {"Easy": {"challenge_set": ["e","e","m"], "starting_rarity": 0, "fixed_rarity": false},
                              "Medium": {"challenge_set": ["e","m","m"], "starting_rarity": 3, "fixed_rarity": false},
                              "Hard": {"challenge_set":  ["e","m","h"], "starting_rarity": 6, "fixed_rarity": false},
                              "Pain": {"challenge_set":  ["m","h"], "starting_rarity": 8, "fixed_rarity": false},
                              "Self-Care": {"challenge_set":  ["s"], "starting_rarity": 7, "fixed_rarity": true}};
        all_difficulty_sets = assemble_difficulty_sets();
        const slot_max_retries = 15;  // how many times to retry having a non-duplicate challenge before allowing duplicates

        // When there are (num) squares revealed, there should be idx_of(num)+1 plants revealed. If not, add another plant.
        // Making it a dict certainly looks a bit silly, but it does make the later code very clean.
        // TODO: Javascript has a list comprehension equivalent (I think?), so clean this up.
        const plants_revealed_at = {3: 1, 7: 2, 11: 3, 15: 4, 20: 5, 25: 6, 30: 7, 35: 8, 41: 9, 47: 10, 49: 11};
        // "At difficulty <Easy>, the first plant is rarity <Easy>[starting_rarity]. It feeds this pattern:
        // 0 0
        // 1 1 1
        // 2 2 2 2
        // 3 3 3 3 3
        // 4 4 4 4 4 4...
        // This holds something like "Easy": {1: 0, ...} to 7 "rows". I have no idea why I'd ever have 2+3...+8=35 plants on one board, but hey.
        const plant_rarity_lookup = calc_rarity_progression();

        const icons = [
           "https://i.imgur.com/GSNkSxm.png",
           "https://i.imgur.com/TuZ3QXY.png",
           "https://i.imgur.com/2Fbxx1b.png",
           "https://i.imgur.com/EHvEUAI.png",
           "https://i.imgur.com/M1AHxdW.png",
           "https://i.imgur.com/sey4Maz.png",
           "https://i.imgur.com/45exDh2.png",
           "https://i.imgur.com/GaJzue4.png"
        ]


        var bingo_border_color = "#71b280";
        var num_squares_revealed = 0;
        var num_plants_revealed = 0;
        var current_board = [];
        var revealed_seeds = [];
        var current_difficulty;
        var bingo_plant_generated = false;  // Used to track whether the bonus bingo seed has been revealed. We don't re-hide seeds.
        var forced_random_seed = null;  // "Child" pages can overwrite with a fixed seed, ex: self_care uses the date as a seed.
        var use_extra_icons = true;  // "Child" pages can use ex: a checkbox to prevent the non-seeded-plant icons from showing up (they might be distracting)

        function randomFromArray(arr){return arr[Math.floor(Math.random()*arr.length)]}

        function calc_rarity_progression(){
            var lookup = {};
            const num_rows = 8;
            // TODO: There's obviously a way to calculate this,..fun later, let's get it working for now.
            current_plant_num = 1;
            for(difficulty in difficulties){
                lookup[difficulty] = {};
                // Fixed_rarity difficulties don't follow the rarity "growth".
                if(difficulties[difficulty]["fixed_rarity"]){
                    // TODO: There's also probably a list comprehension-like construct.
                    for(var i=1; i<36; i++){
                        lookup[difficulty][i] = difficulties[difficulty]["starting_rarity"];
                    }
                    continue;
                }
                // Non-fixed rarity follows the pattern documented at `plant_rarity_lookup`   
                var current_rarity = difficulties[difficulty]["starting_rarity"]
                for(var i=1; i<num_rows; i++){
                    // The +1 here is because the pattern is 0, 0, 1, 1, 1...., not 0, 1, 1...
                    for(var j=0; j<i+1; j++){
                        lookup[difficulty][current_plant_num] = current_rarity;
                        current_plant_num ++;
                    }
                    current_rarity ++;
                }
                current_plant_num = 1;
            }
            return lookup;
        }

        function assemble_difficulty_sets(){
            var all_names = {};
            for(const challenge_difficulty in all_challenges){
                all_names[challenge_difficulty] = [];
                for(const challenge_name in all_challenges[challenge_difficulty]){
                    all_names[challenge_difficulty].push(challenge_difficulty+challenge_name);
                }
            }
            var all_difficulty_sets = {};
            for(const board_difficulty in difficulties){
                all_difficulty_sets[board_difficulty] = [];
                for(var i=0; i< difficulties[board_difficulty]["challenge_set"].length; i++){
                    difficulty_instance = difficulties[board_difficulty]["challenge_set"][i];
                    all_difficulty_sets[board_difficulty] = all_difficulty_sets[board_difficulty].concat(all_names[difficulty_instance]);
                }
            }
            return all_difficulty_sets;
        }

        function getRadioValue(name) {
            var ele = document.getElementsByName(name);
            for(i = 0; i < ele.length; i++) {
                if(ele[i].checked)
                return ele[i].value;
            }
        }

        /* Gawkily randomize in place */
        function shuffleArray(arr) {
          for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
          }
        }

        function assemble_challenge_list(size, difficulty){
            initial_challenge_list = all_difficulty_sets[difficulty];
            var challenges = [];
            while(challenges.length < size*size){
              shuffleArray(initial_challenge_list);
              challenges = challenges.concat(initial_challenge_list);
            }
            return challenges;
        }

        function clear_board() {
          var board = document.getElementById("board_div")
          while (board.lastChild) {
              board.removeChild(board.lastChild);
          }
          current_board = [];
          num_squares_revealed = 0;
          num_plants_revealed = 0;
          bingo_plant_generated = false;
          setBingoPlantVisibility(false);
        }

        function has_bingo() {
          bingo = false;
          // Naive method is fine here don't @ me
          // First we check for horizontal bingo
          for(var i=0; i<current_board.length; i++){
            if(current_board[i][0]["earned"]){
              bingo = true;  // temporary
              for(var j=0; j<current_board[i].length; j++){
                if(!current_board[i][j]["earned"]){
                  bingo = false;
                  break;}}
            if(bingo){break;}
          }}
          if(bingo){return bingo;}
          // Vertical bingo is practically identical
          for(var i=0; i<current_board[0].length; i++){
            if(current_board[0][i]["earned"]){
              bingo = true;  // temporary
              for(var j=0; j<current_board[0].length; j++){
                if(!current_board[j][i]["earned"]){
                  bingo = false;
                  break;}}
            if(bingo){break;}
          }}
          if(bingo){return bingo;}
          // Diagonal bingo
          bingo = true;  // temporary
          for(var i=0; i<current_board.length; i++){
            if(!current_board[i][i]["earned"]){
              bingo = false;
              break;
          }}
          if(bingo){return bingo;}
          bingo = true;  // temporary
          for(var i=0; i<current_board.length; i++){
            if(!current_board[current_board.length-1-i][i]["earned"]){
              bingo = false;
              break;
          }}
          return bingo;
        }

        function generate_board(size, difficulty, rarity_override=null) {
            clear_board();
            current_difficulty = difficulty;  // Make it globally available (not huge on this)
            var board = document.getElementById("board_div");
            var challenges = assemble_challenge_list(size, difficulty);
            for(var i=0; i < size; i++){
              var new_row = document.createElement('div');
              new_row.className = "bingo_row";
              board.appendChild(new_row);
              current_board.push([]);
              for(var j=0; j < size; j++){
                var challenge_name = challenges[i*size+j];
                add_bingo_square(new_row, i, j, challenge_name, rarity_override=rarity_override);
                current_board[i].push({"earned": false,
                                       "challenge": challenge_name,
                                       "icon": icons[Math.floor(Math.random() * icons.length)]});
              }
           }
        }

        // Reveal a plant in a square (either within the board or the "bonus bingo plant"
        // Handles the work of generating the plant itself and adding the seed to the pile.
        // Returns a dataURL to set as an image someplace.
        async function genPlantInSquare(forced_random_offset=0){
            rarity = plant_rarity_lookup[current_difficulty][num_plants_revealed];
            if(forced_random_seed == null){
                plant_data = gen_plant_data(rarity);
            } else {
                // ONLY for forced_random seed generation, the bingo seed needs to increment num_plants_revealed
                plant_data = gen_plant_data(rarity, forced_random_seed+String(num_plants_revealed + bingo_plant_generated));
            }
            plant_canvas = await gen_plant(plant_data);
            // TODO: This next scaling bit seems incredibly silly
            var scale_canvas = document.createElement("canvas");
            scale_canvas.width = 96;
            scale_canvas.height = 96;
            var scale_ctx = scale_canvas.getContext("2d");
            scale_ctx.imageSmoothingEnabled = false;
            scale_ctx.drawImage(plant_canvas, 0, 0, 96, 96);
            revealed_seeds.push(encode_plant_data_v2(plant_data));
            document.getElementById("seed_list").innerHTML = revealed_seeds.join(", ");
            return scale_canvas.toDataURL();
        }

        async function toggle_status(e){
        var id = e.target.id;
        coords = id.split("_");
        var row = parseInt(coords[0]);
        var col = parseInt(coords[1]);
        var square_info = current_board[row][col];
        var bingo_square = document.getElementById(id);
        square_info["earned"] = !square_info["earned"];
        bingo_square.lastChild.style.opacity = 0.2;  // Make label translucent
        if(square_info["earned"]){
          num_squares_revealed ++;
          // Null is treated as 0...Javascript!
          if(num_plants_revealed < plants_revealed_at[num_squares_revealed]){
            // Time to reveal a plant!
            num_plants_revealed ++;
            square_info['icon'] = await genPlantInSquare();
          }
          if(use_extra_icons || !square_info['icon'].startsWith("https://")){
            bingo_square.style.background = 'url(' + square_info["icon"] + ')  no-repeat center center';
          } else {bingo_square.style.background = "none";}
        } else {
          num_squares_revealed --;
          bingo_square.style.background = "none";
          bingo_square.lastChild.style.opacity = 1;
        }
        var body = document.getElementsByTagName("BODY")[0];
        now_has_bingo = has_bingo();
        setBingoPlantVisibility(now_has_bingo);
        if(now_has_bingo){
          transition_all_bingo_borders("#ffffff", row, col);
        } else {
          shimmer_bingo_borders(bingo_border_color, "#b1f2c0", row, col);
        }
        }

        function transition_all_bingo_borders(color, origin_row, origin_column){
        var root_delay = 70;  // in milliseconds
        for(let i=0; i<current_board.length; i++){
            for(let j=0; j<current_board[i].length; j++){
              // Yes these lets are necessary
              let mapped_row = origin_row;
              let mapped_column = origin_column;
              // Delay proportional to distance from origin
              let delay = root_delay*(((mapped_column-j)**2+(mapped_row-i)**2)**(1/2))
              setTimeout( function() {document.getElementById(i+"_"+j).style.borderColor = color;}, delay);
            }
          }
        }

        async function setBingoPlantVisibility(show_plant){
            parent_div = document.getElementById("bingo_plant_container_div");
            if(!show_plant){
                parent_div.style.display = "none";
            } else {
                if(!bingo_plant_generated){
                    // We need this true BEFORE generating the plant (weird I know) in case of a forced random seed. It's how we know to increment.
                    bingo_plant_generated = true;  // Once gained, is only lost when board is reset (to avoid regenerating the bingo plant)
                    data_url = await genPlantInSquare();
                    target_div = document.getElementById("bingo_plant_div");
                    target_div.style.background = 'url(' + data_url + ')  no-repeat center center';
                }
                target_div = document.getElementById("bingo_plant_div");
                parent_div.style.display = "block";
            }
        }

        // Go through and either hide or show all non-generated-plant icons
        function toggleExtraIcons(show_icons){
        for(let i=0; i<current_board.length; i++){
            for(let j=0; j<current_board[i].length; j++){
              bingo_square = document.getElementById(i+"_"+j);
              bingo_square_info = current_board[i][j];
              if(bingo_square_info["earned"] && bingo_square_info['icon'].startsWith("https://")){  // This feels unsafe, somehow
                if(show_icons){bingo_square.style.background = 'url(' + bingo_square_info["icon"] + ')  no-repeat center center';}
                else{bingo_square.style.background = "none";}
              }
            }
          }
        }

        function shimmer_bingo_borders(original_color, new_color, origin_row, origin_column) {
            var root_delay = 100;  // in milliseconds
            for(let i=0; i<current_board.length; i++){
                for(let j=0; j<current_board[i].length; j++){
                  // Yes these lets are necessary
                  let mapped_row = origin_row;
                  let mapped_column = origin_column;
                  // Delay proportional to distance from origin
                  let delay = root_delay*(((mapped_column-j)**2+(mapped_row-i)**2)**(1/2));
                  let flip_delay = delay + 200;
                  setTimeout( function() {document.getElementById(i+"_"+j).style.borderColor = new_color;}, delay);
                  setTimeout( function() {document.getElementById(i+"_"+j).style.borderColor = original_color;}, flip_delay);
                }
            }
        }

        function add_bingo_square(parent, column, row, challenge_name){
            var id = column + "_" + row;
            var bingo_square = document.createElement('div');
            bingo_square.id = id;
            bingo_square.className = 'bingo_box';
            bingo_square.onmouseover = function() {document.getElementById("bingo_hint").textContent = challenge["full"];};
            bingo_square.addEventListener("click", toggle_status);
            bingo_square.addEventListener('touchend', function(e){
                    toggle_status(e);
                    e.preventDefault()
                })

            var label = document.createElement('label')
            var challenge = all_challenges[challenge_name[0]][challenge_name.slice(1)];
            label.htmlFor = id;
            label.className = 'bingo_label';
            label.appendChild(document.createTextNode(challenge["description"]));

            bingo_square.appendChild(label);
            parent.appendChild(bingo_square);
        }

        function toggle_extra_icons() {
            toggleExtraIcons(current_icons);
        }

        function toggle_hints() {
            if(current_hints){
                document.getElementById("bingo_hint").style.visibility = "visible";
            } else {
                document.getElementById("bingo_hint").style.visibility = "hidden";
            }
        }
