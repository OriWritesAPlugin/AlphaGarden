// This contains the "universal" wordbanks and code used by the various prompt-generator bots.
verb = ["destroyed","discovered","loved","hunted","learned","gave","accepted","longed for",
"knew","missed","fought","forgot","created","conquered","burned","tested","designed","generated",
"wanted","remembered","corrected","understood","found","killed","ate","forgave","hated","pushed",
"hungered","transformed","broke","repaired","brought","enjoyed","mended","fled","helped",
"regretted","circumvented","disobeyed","obeyed","endured","adapted","watched","solved","attempted",
"dreamed","hoped","lamented","worshipped","saved","cared for","treasured","embraced","spoiled",
"coddled","married","consumed","studied","made","stole","banished","recalled","commanded",
"rescued","immortalized","danced","struggled","deserted","drowned","celebrated","bought","hurt",
"read","surprised","reformed","chased","feared","informed","believed","reorganized","orphaned",
"converted","betrayed","corrupted","chose","grew","invented","plagued","haunted","concerned",
"reformed","doomed","witnessed"];
//Adj: ^
adjective = ["extinct","inverse","frigid","colorful","unfathomable","erratic","infectious",
"airborne","eventual","forgotten","forbidden","unknown","happy","excited","uncertain","brave",
"clever","dark","bright","documented","cultivated","cultured","brutish","wise","agile",
"fighting","joyful","sneaky","backwards","curious","exquisite","verdant","lush","lively",
"unlucky","beautiful","wrong","silly", "deadly", "first", "last","solid","powerful",
"late","early","untroubled","serene","hectic","chaotic","lawful","cowardly","religious",
"new","old","loved","hated","pleasant","honest","fair","unfair","creative","lonely","funny",
"hideous","distasteful","convoluted","regal","irritating","dead","living","loud","murderous",
"cruel","nightmarish","gleeful","orderly","disorganized","forgetful","fearsome","undead",
"better","worse","natural","earthly","windborne","flammable","fluid","icy","productive",
"suspicious","educated","magical","tacky","physical","unfamiliar", "sudden", "helpful",
"secret","forsaken","overgrown","concerning","good","evil","neutral","feral","helpless","calm",
"scientific","unrestrained","obsessive","gorgeous","disrespectful","organized","competent",
"heretical","mechanical","rough","scarred","glowing","soft","excellent","best","fashionable",
"romantic","uncontrollable","cursed","blessed","sad","questionable","graceful","temporary",
"unremarkable","lucky"];
//Adverb: #
adverb = ["succinctly","generously","unfortunately","fortunately","previously",
"without warning","earlier","after the fact","utterly","mercilessly","joyfully","curiously",
"quickly","pleasantly","excitedly","exquisitely","long","always","dearly","mercifully","slowly",
"painfully","remarkably","posthumously","humorously","remorselessly","unavoidably","clumsily",
"uncertainly","with gusto","gracefully","mysteriously","thoroughly","gleefully","beautifully",
"overwhelmingly","underwhelmingly","chaotically"];
//Noun: *
noun = ["joy","egg","sunrise","forest","crystal","clanmate","island","dragon","night","tomorrow",
"idea","scroll","candle","archive","jungle","garden","food","god","friend","love","pet","familiar",
"vault","cavern","trade route","ship","ocean","swamp","regret","fire","magic","plant","animal",
"beastclan","mistake","day","troop","commander","sweetheart","dog","reminder","concept","void","shade",
"tundra","guardian","mirror","skydancer","imperial","snapper","bogsneak","coatl","pearlcatcher",
"ridgeback","fae","gaoler","banescale","veilspun","jail cell","shark","coin","gem","sunset","woodland",
"treasure","cat","sun","star","clan","blood","kingdom","lizard","bone","flower","vine","chain",
"warband","raider","gift","color","gene","relic","map","golem","construct","secret",
"element","dream","nightmare","favorite","time","name","note","year","eon","hope","armor","weapon",
"sword","shield","helmet","future","past","thing","war","battle","trading post","auction house",
"venue","coliseum","letter","law","government","ruler","king","queen","daydream","investment",
"shirt","remainder","stranger","warrior","cloud","longneck","centaur","insect","delight","machine",
"blacksmith","scout","loremaster","archivist","diplomat","mayor","corpse","skeleton","sorceror",
"mage","illusion","hell","druid","necromancer","feeling","wound","book","lie","road","universe",
"dreamer","sage","fortune-teller","fortune","good","evil","adventure","canyon","wasteland","glacier",
"spell","flight","hoard","merchant","fear","data point","legend","belief","order","son","daughter",
"spouse","temple","emperor","cesspool","mountain","cave","concern","flame","guilt","lord","curmudgeon",
"dryad","bird","creature","mutant","disease","corruption","joke","tale","myth","lesson","savior",
"bearer","destroyer","tea","plague","wind","earth","water","ice","storm","tool","shadow","light",
"movement","migration","representative","lair","rainbow","sweater","shame","hardship","thunderbolt",
"faith","decision","scream","charm","comfort","pleasure","song","heretic","mother","father",
"sibling","failure","tradition","pain","salvation","monster","abomination","tree","cavern system",
"home","instinct","clown","mannerism","death","world","mate","river","romance","curse","blessing",
"fate","poem","disaster","friendship"];
//Preposition: &
preposition = ["before","after","above","below","during","around","inside","over"];

replace_keys = {"%": verb, "\\^": adjective, "#": adverb, "\\*": noun, "\&": preposition};

function madlib_gen(replace_string) {
    for (var i in replace_keys){
        replace_string = replace_string.replace(RegExp(i, "g"),
            function replace_key(x){
                return replace_keys[i][Math.floor((Math.random() * replace_keys[i].length))];
            });
    }
    return replace_string;
}
