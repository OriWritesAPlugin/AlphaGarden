// This contains the code for generating a random plant badge.
// I wrote it with limited internet access, meaning that it looks like Python and uses no clever Javascript tricks.
// You've been warned!

// The colors we'll be replacing. Touch at your peril!
var base_foliage_palette = ["#aed740", "#76c935", "#50aa37", "#2f902b"];
var base_accent_palette = ["fef4cc", "fde47b", "ffd430", "ecb600"];
var base_feature_palette = ["f3addd", "d87fbc", "c059a0", "aa3384"];
var overall_palette = base_foliage_palette.concat(base_accent_palette).concat(base_feature_palette);

var work_canvas_size = 32;  // in pixels
// Roll more than this out of 1 to have two pieces of base foliage.
var two_foliage_roll = 0.95;

// A pixel of these colors indicates we should place the corresponding feature type
var place_complex_feature = "ff943a";
var place_simple_feature = "e900ff";

// Holder for all the images we'll need
var refs = {};

// Javascript can't access images by path.
// This workaround is hideous, but what can ya do :) (while hosting to github and not using ajax, I mean)
//0-indexed count: 60
all_foliage = ["https://i.imgur.com/PabdLnL.png", "https://i.imgur.com/WN2m2Aa.png", "https://i.imgur.com/wsC3ifp.png",
               "https://i.imgur.com/NFM09J5.png", "https://i.imgur.com/urBlTiV.png", "https://i.imgur.com/kyfs2Yl.png",
               "https://i.imgur.com/nMW2bBb.png", "https://i.imgur.com/tBQb6yy.png", "https://i.imgur.com/5j6u58a.png",
               "https://i.imgur.com/Mb1wqi1.png", "https://i.imgur.com/Rk7vvo3.png", "https://i.imgur.com/DdEYVYA.png",
               "https://i.imgur.com/IF5MQWY.png", "https://i.imgur.com/Z6njdmV.png", "https://i.imgur.com/cDAqt4U.png",
               "https://i.imgur.com/117aiCY.png", "https://i.imgur.com/7ZrX05Y.png", "https://i.imgur.com/ZMe5J0j.png",
               "https://i.imgur.com/wLsuJSX.png", "https://i.imgur.com/dxJbfgi.png", "https://i.imgur.com/l1MK3yJ.png",
               "https://i.imgur.com/kTbrzeL.png", "https://i.imgur.com/s4Uav2q.png", "https://i.imgur.com/6GPgZzr.png",
               "https://i.imgur.com/E6ikrq8.png", "https://i.imgur.com/MyF1tCA.png", "https://i.imgur.com/5y1UeDM.png",
               "https://i.imgur.com/uYswz0s.png", "https://i.imgur.com/qGczjJf.png", "https://i.imgur.com/PaWgGAq.png",
               // Row below is zero-indexed 30, 31, 32
               "https://i.imgur.com/0fBhPPY.png", "https://i.imgur.com/NzGJLcK.png", "https://i.imgur.com/62lbxgE.png",
               "https://i.imgur.com/t6NI9ZW.png", "https://i.imgur.com/ubsbt7W.png", "https://i.imgur.com/MAqn21X.png",
               "https://i.imgur.com/xEnajhL.png", "https://i.imgur.com/wHwGcaT.png", "https://i.imgur.com/DNJakBN.png",
               "https://i.imgur.com/65fD3Wt.png", "https://i.imgur.com/GhHUZAm.png", "https://i.imgur.com/Wtmyg00.png",
               "https://i.imgur.com/k7FDQzk.png", "https://i.imgur.com/hnTjsH8.png", "https://i.imgur.com/yIZJ19G.png",
               "https://i.imgur.com/mQaUMgT.png", "https://i.imgur.com/t2NAP7b.png", "https://i.imgur.com/abzacy8.png",
               "https://i.imgur.com/Wax3h14.png", "https://i.imgur.com/Ps4w9LV.png", "https://i.imgur.com/3RpiB9t.png",
               "https://i.imgur.com/LIicGxR.png", "https://i.imgur.com/2XeqnbE.png", "https://i.imgur.com/Zal2kLb.png",
               "https://i.imgur.com/thX8zVH.png", "https://i.imgur.com/YsmG4bZ.png", "https://i.imgur.com/iv73TrE.png",
               "https://i.imgur.com/E96bbUd.png", "https://i.imgur.com/7amn8lf.png", "https://i.imgur.com/EaOoji3.png",
                // Row below is zero-indexed 60, 61, 62
               "https://i.imgur.com/IvZmYJ0.png", "https://i.imgur.com/5CYK3pl.png", "https://i.imgur.com/JfQb93F.png",
               "https://i.imgur.com/HaOVemI.png", "https://i.imgur.com/FSFBSlo.png", "https://i.imgur.com/cgkP5B6.png",
               "https://i.imgur.com/DynbJCl.png", "https://i.imgur.com/k9w5afZ.png"];

all_named = {"nigel": "https://i.imgur.com/zYolkmE.png", "vine_supporter": "https://i.imgur.com/72uDqMq.png", "root_supporter": "https://i.imgur.com/y9eN0Ae.png",
             "bone_supporter": "https://i.imgur.com/EzL4aw0.png", "stone_supporter": "https://i.imgur.com/xyB8zjm.png",
             "bunbun": "https://i.imgur.com/Qn23rZb.png", "bunbun_black": "https://i.imgur.com/S6vpB9i.png", "bunbun_white": "https://i.imgur.com/1xnwUWv.png",
             "grazing_goat": "https://i.imgur.com/6LsCzM6.png", "grazing_goatbrown": "https://i.imgur.com/ZbLlfdq.png",
             "grazing_goatspotted": "https://i.imgur.com/wR92Own.png", "micro_goat": "https://i.imgur.com/0MN5MiP.png",
             "pots'n_pans": "https://i.imgur.com/sbh42Qu.png",
             "male_cardinal": "https://i.imgur.com/0WaJacd.png", "female_cardinal": "https://i.imgur.com/1RcilE0.png", "griffon_vulture": "https://i.imgur.com/a01VWAo.png", "turkey_vulture": "https://i.imgur.com/a6jGcCr.png",
             "summer_col": "https://i.imgur.com/5hsYi2x.png", "winter_col": "https://i.imgur.com/PIvtEQp.png", "autumn_col": "https://i.imgur.com/SM9CLUW.png", "spring_col": "https://i.imgur.com/z22QWj1.png",
             "stone_simple_bench": "https://i.imgur.com/CxUk9nb.png", "sandy_simple_bench": "https://i.imgur.com/PdgM5Dm.png", "ice_simple_bench": "https://i.imgur.com/Z9KDYr7.png", "growth_simple_bench": "https://i.imgur.com/uGxm8Pp.png", "onyx_simple_bench": "https://i.imgur.com/ZHHWzqf.png", "crystal_simple_bench": "https://i.imgur.com/LewbVev.png",
             "light_uni": "https://i.imgur.com/h25jofW.png", "dark_uni": "https://i.imgur.com/wZDto2T.png",
             "big_fountain": "https://i.imgur.com/Gb64tAf.png", "bunbun_grass": "https://i.imgur.com/dzonSfL.png", "bunbun_sakura": "https://i.imgur.com/tFsZkwX.png", "bunbun_snow": "https://i.imgur.com/w5HmhlH.png",
             "plain_big_bone": "https://i.imgur.com/7uVtIgT.png", "mossy_big_bone": "https://i.imgur.com/TCwHxZY.png", "bloody_big_bone": "https://i.imgur.com/Ra1hOOE.png", "misty_big_bone": "https://i.imgur.com/Pj6BCRJ.png",
             "shaded_big_bone": "https://i.imgur.com/ZTR99ug.png",
             "giant_gold": "https://i.imgur.com/BJt4LwQ.png", "giant_rosegold": "https://i.imgur.com/mswDGRW.png", "giant_silver": "https://i.imgur.com/I4cluBv.png", "giant_copper": "https://i.imgur.com/0Ymk8oM.png", "giant_copperhalf": "https://i.imgur.com/kU4sPSw.png",
             "giant_copperfull": "https://i.imgur.com/JXyQeXD.png", "giant_copperblended": "https://i.imgur.com/DDqoxuB.png", "giant_cobalt": "https://i.imgur.com/r8tfKle.png", "giant_iron": "https://i.imgur.com/dQy3aKl.png",
             // Conservation set
             "shale_rock_1": "https://i.imgur.com/kWy5LYK.png", "shale_rock_2": "https://i.imgur.com/FvM0af4.png", "shale_rock_3": "https://i.imgur.com/gOI3GWA.png", "shale_rock_4": "https://i.imgur.com/rdHtEmf.png",
             "limestone_rock_1": "https://i.imgur.com/e8WGNIX.png", "limestone_rock_2": "https://i.imgur.com/z9G8xUz.png", "limestone_rock_3": "https://i.imgur.com/4eS8voG.png", "limestone_rock_4": "https://i.imgur.com/zisb1Sm.png",
             "obsidian_rock_1": "https://i.imgur.com/VJbGsNP.png", "obsidian_rock_2": "https://i.imgur.com/QD7qunp.png", "obsidian_rock_3": "https://i.imgur.com/wVqYlpE.png", "obsidian_rock_4": "https://i.imgur.com/G3YixT4.png",
             "aventurine_rock_1": "https://i.imgur.com/x8PAyAR.png", "aventurine_rock_2": "https://i.imgur.com/FAuYH6y.png", "aventurine_rock_3": "https://i.imgur.com/SiOomwa.png", "aventurine_rock_4": "https://i.imgur.com/XBTiOM1.png",
             "shale_cairn": "https://i.imgur.com/mPCJ6xK.png", "limestone_cairn": "https://i.imgur.com/YY3aAhM.png", "obsidian_cairn": "https://i.imgur.com/z85y3DB.png", "aventurine_cairn": "https://i.imgur.com/xfoVNh6.png",
             "shale_spring": "https://i.imgur.com/SS5wlwB.png", "limestone_spring": "https://i.imgur.com/YvFBGtb.png", "obsidian_spring": "https://i.imgur.com/HDguTqn.png","aventurine_spring": "https://i.imgur.com/aqWObIl.png", 
             "simple_fence": "https://i.imgur.com/WE4YzQb.png", "simple_fence_broken": "https://i.imgur.com/E1E1q3w.png", "simple_signpost": "https://i.imgur.com/LrdkTBi.png", "shale_birdbath": "https://i.imgur.com/7P7OqPQ.png",
             "bleached_skull": "https://i.imgur.com/kIgNges.png", "bleached_ribs": "https://i.imgur.com/gb5h2ct.png", "burnt_skull": "https://i.imgur.com/swmqdOf.png", "burnt_ribs": "https://i.imgur.com/yCHsvce.png"};
// Doing it this way lets us preserve the numbering to know which plant is which.
// But it's also key to how the seeds work!
common_foliage = [0, 1, 5, 8, 14, 19, 26, 28, 38, 41, 45, 48, 55, 57, 59, 61, 62, 64];
uncommon_foliage = common_foliage.concat([2, 3, 4, 7, 9, 10, 11, 12, 13, 15, 18, 20, 21, 24, 25, 29, 31, 35, 36, 42, 43, 46, 47, 50, 51, 52, 54, 60, 63, 66, 67]);
rare_foliage = uncommon_foliage.concat([6, 16, 17, 22, 23, 27, 30, 32, 33, 34, 37, 39, 40, 44, 49, 53, 56, 58, 65]);
boosted_rare_foliage = rare_foliage.slice(common_foliage.length);

override_foliage = [];



all_features = ["https://i.imgur.com/G4h84Ht.png", "https://i.imgur.com/vXQYMkL.png", "https://i.imgur.com/p1ipMdS.png", "https://i.imgur.com/UUFJO7h.png"]
var simple_features = [0, 1];
var complex_features = [2, 3];


// zero-indexed count: 55
var all_palettes = [["aed740", "76c935", "50aa37", "2f902b"], ["a2ac4d", "8f974a", "66732a", "4b692f"],
                    ["7ad8b7", "5eb995", "3e946d", "277b50"], ["9dbb86", "679465", "476f58", "2f4d47"],
                    ["8fbe99", "679465", "3f7252", "215a3f"], ["fdff07", "b9d50f", "669914", "34670b"],
                    ["b0f7a9", "7dcc75", "63aa5a", "448d3c"], ["c5af7a", "a6905c", "806d40", "69582e"],
                    ["6ee964", "54c44b", "3da136", "228036"], ["e7d7c1", "a78a7f", "735751", "603f3d"],
                    ["9c6695", "734978", "4c2d5c", "2f1847"], ["f8cd1e", "d3a740", "b2773a", "934634"],
                    ["e4eaf3", "c0cfe7", "9ab3db", "7389ad"], ["b98838", "8c6526", "674426", "54401f"],
                    ["8f8090", "655666", "453946", "2a212b"], ["f5dbd7", "eec3c3", "d396a8", "c9829d"],
                    ["cdd1ff", "9fc0ff", "709ade", "4b5e95"], ["f6e9a4", "e8b78e", "d5737d", "c45088"],
                    ["e88c50", "d0653e", "af3629", "9b1f1f"], ["fef4cc", "fde47b", "ffd430", "ecb600"],
                    // next row is zero-indexed 20, 21                    
                    ["f3addd", "d87fbc", "c059a0", "aa3384"], ["3ac140", "1b9832", "116d22", "085c17"],
                    ["eaf4bd", "aade87", "6cc750", "1aaa09"], ["b77e4e", "88572e", "674426", "543a24"],
                    ["b7ed6c", "83d764", "47be5c", "0ca553"], ["f3eacf", "e4d4be", "ccb4a4", "b69389"],
                    ["edc55c", "d99b61", "bf7464", "a6636c"], ["8bfdd6", "55dbc3", "25b8b5", "0b8c9d"],
                    ["f5e2af", "f3c13d", "cba134", "a7832d"], ["a66547", "6e3837", "542c37", "45283a"],
                    ["cedd80", "95c27d", "52a279", "057d77"], ["fff9cf", "f4d6bc", "eaaba8", "dc91b8"],
                    ["b77e4e", "88572e", "674426", "543a24"], ["c5af7a", "a6905c", "806d40", "69582e"],
                    ["a6705a", "8b4e35", "6c2e1c", "571d0e"], ["fa9292", "f55757", "e32b2b", "ca0e18"],
                    ["93aaff", "5778f5", "3a5ad2", "233fa8"], ["ffcf80", "ffb63e", "ff9300", "da7500"],
                    ["f5fff4", "dbf5d9", "bee1bb", "9fc99c"], ["cd41d9", "b309c0", "860d9e", "61067b"],
                    ["8cf5f8", "30e8ed", "18c9d4", "0798a6"], ["b5c085", "7b9b64", "47774a", "305540"],
                    ["9bcf4b", "719e34", "45681a", "274409"], ["4fb81d", "339324", "1d7628", "075a2d"],
                    ["6e7706", "465f14", "234d21", "033a34"], ["78a562", "4e875a", "2a6e53", "0c584d"],
                    ["077773", "135260", "21294d", "2e033a"], ["e0ea8a", "bdbb5c", "b0983a", "a5791b"],
                    ["fcf050", "dca02a", "c46212", "ae2c00"], ["adef94", "71d86b", "2fc45a", "0aab68"],
                    // next row is zero-indexed 50, 51
                    ["f6cfec", "eca9ee", "cd86e6", "ab6ce0"], ["ffd2c6", "ffb39c", "ff8e69", "f87e4a"],
                    ["684e39", "513522", "391e10", "1f0c03"], ["fce382", "ebab8a", "dc5890", "b027a1"],
                    ["71f4a3", "68dbba", "4cb1c4", "3c7fb2"], ["c5e9fc", "b5c1fa", "a494f8", "9163f5"]];
                    

// There's three types of palette:
// Foliage: Generally the bulk of a plant. Greens and browns are most common
// Feature: Think of the secondary on a dragon. Structures like trunks, flower brachts
// Accent: Think of the tertiary. Has bonus loud, bright colors that would look garish in a patch. Tone used for flowers (eventually)

// Note that some common foliage colors are double-weighted because they're very nice greens :)
var common_foliage_palettes = [0, 1, 2, 3, 3, 4, 5, 5, 6, 7, 8, 18, 21, 21, 22, 23, 29, 30, 30, 41, 42, 43, 44, 45, 49];
common_foliage_palettes = common_foliage_palettes.concat(common_foliage_palettes);  // Cheap greenery boost
var common_accent_palettes = [19, 20, 35, 36, 37, 38, 39, 40];
var common_feature_palettes = [1, 20, 29, 32, 33, 34, 52];
var uncommon_palettes = [9, 10, 11, 12, 13, 14, 15, 18, 24, 25, 38, 46, 47, 50, 55];
var rare_palettes = [16,  17, 26, 27, 28, 30, 31, 48, 51, 53, 54];

/*common_foliage_palettes = [10];
uncommon_palettes = [];
rare_palettes = [];
common_feature_palettes = [10];
common_accent_palettes = [38, 54];*/

//common_foliage_palettes = common_foliage_palettes.concat([50, 54, 54, 54, 27, 27, 27, 31, 31, 31, 53, 15, 15, 15])


var uncommon_foliage_palettes = common_foliage_palettes.concat(uncommon_palettes);
var rare_foliage_palettes = uncommon_foliage_palettes.concat(rare_palettes);

var uncommon_feature_palettes = common_feature_palettes.concat(uncommon_palettes);
var rare_feature_palettes = uncommon_feature_palettes.concat(rare_palettes);

var uncommon_accent_palettes = common_accent_palettes.concat(uncommon_palettes);
var rare_accent_palettes = uncommon_accent_palettes.concat(rare_palettes);

// Universal use, removes chance of getting common palettes
var boosted_rare_palettes = uncommon_palettes.concat(rare_palettes);


async function place_image_at_coords_with_chance(img_url, list_of_coords, ctx, chance, anchor_to_bottom=false){
    // In canvas context ctx, place image at img_path "centered" at each (x,y) in list_of_coords with chance odds (ex 0.66 for 66%)
    // 50% chance to horizontally mirror each one? (TODO)
    // Wondering if the shared ctx save/reload and use of async-await is giving me the "floating flowers" issue in here.
    // I may revisit (and mirror the final canvas instead), but it feels like overkill for now.
    img = refs[img_url];
    var w_offset = Math.floor(img.width/2)-1;
    if(!anchor_to_bottom){
      var h_offset = Math.floor(img.height/2)-1;
    } else {
      var h_offset = -img.height + 1;
    }
    for (var i=0;i<list_of_coords.length;i++) {
      if (Math.random() < chance){
        [x,y] = list_of_coords[i];
        ctx.drawImage(img, x-w_offset, y+h_offset);
      }
    }
}

async function preload_all_images()
// TODO: Gross prototype nonsense. Must be called ahead. Loads refs.
{
  lists_to_load = [all_foliage, all_features, Object.values(all_named)];
  for(var i=0; i<lists_to_load.length; i++){
      for(var j=0; j<lists_to_load[i].length;j++){
        var promise = preload_single_image(lists_to_load[i][j]);
        refs[lists_to_load[i][j]] = promise;
      }
  }
  for(const key in refs){
      refs[key] = await refs[key];
  }
}

// Sound of me not being 100% confident in my async usage yet
async function preload_single_image(url){
    var img=new Image();
    img.src=url;
    img.crossOrigin = "anonymous"
    var loaded_img = img.decode();  // To throw it in mem without blocking?
    return img
}

// We have things like foliage, colors, and features that exist in "master lists"
// These "master lists" comprise of everything in that category, regardless of rarity
// There's then sub-lists that contain the indices from the master list in each rarity category
// This function picks a random entry from a master, limited to what's allowed by the sublist.
// However, we need the in-between step of indices into the master_list, so we do it less elegantly
// with random_from_list and parse_plant_data.
function old_random_by_rarity(rarity_list, master_list) {
    var ep = rarity_list[Math.floor(Math.random()*rarity_list.length)];
    return master_list[ep];
}

function random_from_list(list, prng=null) {
    if(prng==null){return list[Math.floor(Math.random()*list.length)]};
    return list[Math.floor(prng()*list.length)];
}


//Seeded prng. Taken from https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
function mulberry32(a) {
    return function() {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

// Seed generator. Taken from https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
function xmur3(str) {
    for(var i = 0, h = 1779033703 ^ str.length; i < str.length; i++) {
        h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
        h = h << 13 | h >>> 19;
    } return function() {
        h = Math.imul(h ^ (h >>> 16), 2246822507);
        h = Math.imul(h ^ (h >>> 13), 3266489909);
        return (h ^= h >>> 16) >>> 0;
    }
}

function parse_plant_data(plant_data){
    return {"foliage": all_foliage[plant_data["foliage"]],
            "simple_feature": all_features[plant_data["simple_feature"]],
            "complex_feature": all_features[plant_data["complex_feature"]],
            "foliage_palette": all_palettes[plant_data["foliage_palette"]],
            "feature_palette": all_palettes[plant_data["feature_palette"]],
            "accent_palette": all_palettes[plant_data["accent_palette"]]}
}


// Rarity level:
// 0: only common things available
// 1: adds uncommon foliage
// 2: adds complex features, use common ones instead at lower rarities
// 3: adds uncommon foliage colors
// 4: adds uncommon feature colors
// 5: adds rare foliage
// 6: adds rare foliage colors
// 7: add rare feature colors
// 8: guarantees uncommon or rare feature color
// 9: guarantees uncommon or rare foliage color
// 10: guarantees uncommon or rare foliage

// Rarity level rework thoughts (NYI):
// 0: only common things
// 1: uncommon feature/accent colors
// 2: uncommon foliage colors
// 3: adds uncommon foliage but resets colors to common
// 4: adds back uncommon feature/accent colors
// 5: adds uncommon and rare foliage colors
// 6: adds rare feature/accent colors
// 7: adds rare foliage but resets all colors to common
// 8: adds back uncommon and rare feature/accent colors
// 9: adds back uncommon/rare foliage colors
// 10: ups chance for uncommon/rare foliage colors

function gen_plant_data(rarity, seed_string=null) {
    var available_foliage = common_foliage;
    var available_complex_features = simple_features;  // Needed to disable/enable complex features
    var available_foliage_palettes = common_foliage_palettes;
    var available_feature_palettes = common_feature_palettes;
    var available_accent_palettes = common_accent_palettes;

    // A bit grody ngl
    if(rarity>=1){available_foliage = uncommon_foliage;}
    if(rarity>=2){available_complex_features = complex_features;}
    if(rarity>=3){available_foliage_palettes = uncommon_foliage_palettes;}
    if(rarity>=4){
        available_feature_palettes = uncommon_feature_palettes;
        available_accent_palettes = uncommon_accent_palettes;
    }
    if(rarity>=5){available_foliage = rare_foliage;}
    if(rarity>=6){available_foliage_palettes = rare_foliage_palettes;}
    if(rarity>=7){
        available_feature_palettes = rare_feature_palettes;
        available_accent_palettes = rare_accent_palettes;
    }
    if(rarity>=8){available_feature_palettes = boosted_rare_palettes;}
    if(rarity>=9){available_foliage_palettes = boosted_rare_palettes;}
    if(rarity>=10){available_foliage = boosted_rare_foliage;}

    if(override_foliage.length > 0){available_foliage = override_foliage};

    var prng;
    if(seed_string == null){prng = null;}
    else{prng = mulberry32(xmur3(seed_string)());}

    return {"foliage": random_from_list(available_foliage, prng),
            "simple_feature": random_from_list(simple_features, prng),
            "complex_feature": random_from_list(available_complex_features, prng),
            "foliage_palette": random_from_list(available_foliage_palettes, prng),
            "feature_palette": random_from_list(available_feature_palettes, prng),
            "accent_palette": random_from_list(available_accent_palettes, prng)}
}

//seed format is 1<foliage><simple_feature><complex_feature>1<color><color><color><rngnum>
//random 1s are to avoid the encoding dropping the leading 0s
//foliage, feature, and the colors are all fixed-length 3 digits (ex: 100102310140060012147483647) for a max of 999 possibilities
//this number's way too big for Javascript without mantissa (Maxint is 9007199254740992 and we need highest precision and I don't know how Javascript does Things) so we break it like this:

// 1foliagesimplefeaturecomplexfeature-1colorcolorcolor-actualrandomnumberseed
// and then we put it in base64 for slightly-shorter-fixed-length purposes
function encode_plant_data(plant_data) {
    function to_padstr(entry){
        return String(plant_data[entry]).padStart(3, '0');
    }
    var part_one = parseInt("1"+to_padstr("foliage")+to_padstr("simple_feature")+to_padstr("complex_feature"));
    var part_two = parseInt("1"+to_padstr("foliage_palette")+to_padstr("feature_palette")+to_padstr("accent_palette"));
    return Base64.fromInt(part_one)+Base64.fromInt(part_two);
}


function decode_plant_data(plant_data) {
    // Conversion city baybeee
    // Might be able to do something clever with mods instead, but we'll check performance first
    var part_one = String(Base64.toInt(plant_data.slice(0,5)));
    var part_two = String(Base64.toInt(plant_data.slice(5)));
    return {"foliage": parseInt(part_one.slice(1,4)),
            "simple_feature": parseInt(part_one.slice(4,7)),
            "complex_feature": parseInt(part_one.slice(7,10)),
            "foliage_palette": parseInt(part_two.slice(1,4)),
            "feature_palette": parseInt(part_two.slice(4,7)),
            "accent_palette": parseInt(part_two.slice(7,10))}
}

// Stolen from https://stackoverflow.com/questions/6213227/fastest-way-to-convert-a-number-to-radix-64-in-javascript
Base64 = (function () {
    var digitsStr = 
    //   0       8       16      24      32      40      48      56     63
    //   v       v       v       v       v       v       v       v      v
        "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+-";
    var digits = digitsStr.split('');
    var digitsMap = {};
    for (var i = 0; i < digits.length; i++) {
        digitsMap[digits[i]] = i;
    }
    return {
        fromInt: function(int32) {
            var result = '';
            while (true) {
                result = digits[int32 & 0x3f] + result;
                int32 >>>= 6;
                if (int32 === 0)
                    break;
            }
            return result;
        },
        toInt: function(digitsStr) {
            var result = 0;
            var digits = digitsStr.split('');
            for (var i = 0; i < digits.length; i++) {
                result = (result << 6) + digitsMap[digits[i]];
            }
            return result;
        }
    };
})();

async function gen_plant(plant_data) {
    // Returns the image data for a generated plant
    var work_canvas = document.createElement("canvas");
    var work_ctx=work_canvas.getContext("2d");
    plant_data = parse_plant_data(plant_data);
    work_canvas.width = work_canvas_size;
    work_canvas.height = work_canvas_size;
    /* How much base foliage to combine
    var foliage_amount;
    const foliage_roll = Math.random();
    if(foliage_roll < two_foliage_roll){
        foliage_amount = 1;
    } else {
        foliage_amount = 2;
    }
    // https://stackoverflow.com/questions/19269545/how-to-get-a-number-of-random-elements-from-an-array
    // TODO look up =>...probably not a cursed GTE :)
    var imgs = foliage.sort(() => .5 - Math.random()).slice(0,foliage_amount);
    var do_flip = false;
    for(var i=0;i<imgs.length;i++){
      if(Math.random() < 0.5){
        do_flip=true;
        work_ctx.save();
        //work_ctx.translate(work_canvas_size, 0);
        //work_ctx.scale(-1, 1);
      } else {do_flip=false};
      await place_image_at_coords_with_chance(imgs[i], [[Math.floor(work_canvas_size/2)-1, work_canvas_size-1]], work_ctx, 1, true);
    if(do_flip){work_ctx.restore();}
    }*/
    await place_image_at_coords_with_chance(plant_data["foliage"], [[Math.floor(work_canvas_size/2)-1, work_canvas_size-1]], work_ctx, 1, true);

    // Figure out where to put each kind of feature, replacing marker pixels as we go
    simple_feature_coords = get_marker_coords(place_simple_feature, work_ctx);
    complex_feature_coords = get_marker_coords(place_complex_feature, work_ctx);

    // Place the features
    if(simple_feature_coords.length > 0){
        var place_simple = place_image_at_coords_with_chance(plant_data["simple_feature"], simple_feature_coords, work_ctx, 0.5);
    }
    if(complex_feature_coords.length > 0){
        /* Chance that if there's already simple flowers, we keep using that flower
        if(simple_flower_coords.length == 0 || Math.random()>0.5){
            flower_url = complex_flowers[Math.floor(Math.random()*complex_flowers.length)];
        } else {*/
        var place_complex = place_image_at_coords_with_chance(plant_data["complex_feature"], complex_feature_coords, work_ctx, 0.8, true);
    }

    await place_simple
    await place_complex

    // We do all the recolors at once because Speed?(TM)?
    var new_overall_palette = plant_data["foliage_palette"].concat(plant_data["accent_palette"]).concat(plant_data["feature_palette"]);
    replace_color_palette(overall_palette, new_overall_palette, work_ctx);

    // We can draw a canvas directly on another canvas
    return work_canvas;
}

function hexToRgb(hex) {
  // taken from https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : null;
}


function replace_color(old_rgb, new_rgb, ctx, width=work_canvas_size, height=work_canvas_size) {
    // `old_rgb` and `new_rgb`: (r, g, b)
    // taken from https://stackoverflow.com/questions/16228048/replace-a-specific-color-by-another-in-an-image-sprite
    var imageData = ctx.getImageData(0, 0, width, height);
    var oldRed, oldGreen, oldBlue;
    var newRed, newGreen, newBlue;
    [oldRed, oldGreen, oldBlue] = old_rgb;
    [newRed, newGreen, newBlue] = new_rgb;
    for (var i=0;i<imageData.data.length;i+=4)
      {
          // is this pixel the old rgb?
          if(imageData.data[i]==oldRed &&
             imageData.data[i+1]==oldGreen &&
             imageData.data[i+2]==oldBlue
          ){
              // change to your new rgb
              imageData.data[i]=newRed;
              imageData.data[i+1]=newGreen;
              imageData.data[i+2]=newBlue;
          }
      }
    // put the data back on the canvas  
    ctx.putImageData(imageData,0,0);
}


// Basically just wraps replace_color_palette
function replace_color_palette_single_image(old_palette, new_palette, img){
    var work_canvas = document.createElement("canvas");
    var work_ctx=work_canvas.getContext("2d");
    work_canvas.width = img.width;
    work_canvas.height = img.height;
    work_ctx.drawImage(img, 0, 0);
    replace_color_palette(old_palette, new_palette, work_ctx, img.width, img.height);
    return work_canvas;
}

// Palettes MUST be the same length, FYI
function replace_color_palette(old_palette, new_palette, ctx, work_canvas_width=work_canvas_size, work_canvas_height=work_canvas_size) {
    var oldRGB, newRGB;
    // We do some truly hideous hacks because I'm bad at Javascript :)
    // Basically, we use the r, g, and b as a 3-level key into an object
    // If we follow it to the bottom and something exists, it's something we replace
    var paletteSwap = {};
    for(var i=0; i<old_palette.length; i++){
        oldRGB = hexToRgb(old_palette[i]);
        // (cries in defaultdict)
        // but seriously there might be a better way. As is, this stuff's prolly power word kill for JS devs...
        if(paletteSwap[oldRGB[0]] == undefined){paletteSwap[oldRGB[0]] = {};}
        if(paletteSwap[oldRGB[0]][oldRGB[1]] == undefined){paletteSwap[oldRGB[0]][oldRGB[1]] = {};}
        paletteSwap[oldRGB[0]][oldRGB[1]][oldRGB[2]] = hexToRgb(new_palette[i]);
    }
    // taken from https://stackoverflow.com/questions/16228048/replace-a-specific-color-by-another-in-an-image-sprite
    var imageData;
    imageData = ctx.getImageData(0, 0, work_canvas_width, work_canvas_height);
    for (var i=0;i<imageData.data.length;i+=4)
      {
          // god this is painful to look at. I'm sorry.
          if(paletteSwap[imageData.data[i]] != undefined &&
             paletteSwap[imageData.data[i]][imageData.data[i+1]] != undefined &&
             paletteSwap[imageData.data[i]][imageData.data[i+1]][imageData.data[i+2]] != undefined){
              newRGB = paletteSwap[imageData.data[i]][imageData.data[i+1]][imageData.data[i+2]];
              imageData.data[i]=newRGB[0];
              imageData.data[i+1]=newRGB[1];
              imageData.data[i+2]=newRGB[2];
          }
      }
    // put the data back on the canvas  
    ctx.putImageData(imageData,0,0);
}

function get_marker_coords(marker_hex, ctx) {
    // Go through an image and find where to place features. Very similar to replace_color().
    // NOTE: replaces marker pixels with base_foliage ones! This is because we don't always
    // place features and don't want a pixel escaping.
    var ret_coords = [];
    var imageData = ctx.getImageData(0, 0, work_canvas_size, work_canvas_size);
    [oldRed, oldGreen, oldBlue] = hexToRgb(marker_hex);
    [newRed, newGreen, newBlue] = hexToRgb(base_foliage_palette[1]);
    var pixel = 0;
    for (var i=0;i<imageData.data.length;i+=4)
      {
          // is this pixel the old rgb?
          if(imageData.data[i]==oldRed &&
             imageData.data[i+1]==oldGreen &&
             imageData.data[i+2]==oldBlue
          ){
              // change to your new rgb
              imageData.data[i]=newRed;
              imageData.data[i+1]=newGreen;
              imageData.data[i+2]=newBlue;
              // Ready to get a little cursed? Because there's probably a better way to do this, but it's a dumb project so...
              pixel = i/4;
              ret_coords.push([pixel%work_canvas_size, Math.floor(pixel/work_canvas_size)]);
          }
      }
    ctx.putImageData(imageData,0,0);
    return ret_coords
  }

// Same shuffle as bingo.js. TODO: I should add a baselib
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}
