// This contains the code for generating a single, random plant badge.
// The colors we'll be replacing. Touch at your peril!
var base_foliage_palette = ["#aed740", "#76c935", "#50aa37", "#2f902b"];
var base_accent_palette = ["fef4cc", "fde47b", "ffd430", "ecb600"];
var base_feature_palette = ["f3addd", "d87fbc", "c059a0", "aa3384"];
var overall_palette = base_foliage_palette.concat(base_accent_palette).concat(base_feature_palette);
var work_canvas_size = 32; // in pixels
// A pixel of these colors indicates we should place the corresponding feature type
var place_complex_feature = "ff943a";
var place_simple_feature = "e900ff";
// Holder for all the images we'll need
var refs = {};
// In case of error (probably CORS)
const BAD_IMG_URL = "https://i.imgur.com/kxStIJE.png";
// In case of error (probably subtly malformed seed)
const ERROR_PLANT = { "foliage": 160,
    "simple_feature": 0,
    "complex_feature": 3,
    "foliage_palette": 35,
    "feature_palette": 35,
    "accent_palette": 35 };
// old spotted mushroom: https://i.imgur.com/MyF1tCA.png
// old medium tree with the wonky trunk: https://i.imgur.com/ZMe5J0j.png
// old medium tree with wonky trunk #2 (49 0-idx) https://i.imgur.com/Ps4w9LV.png
var all_foliage = [
    { "artist": "Oranitha", "name": "tall stalk", "categories": ["flower"], "source": "https://i.imgur.com/PabdLnL.png" },
    { "artist": "Oranitha", "name": "short stalk", "categories": ["flower"], "source": "https://i.imgur.com/WN2m2Aa.png" },
    { "artist": "Oranitha", "name": "pebble", "categories": ["rock"], "source": "https://i.imgur.com/wsC3ifp.png" },
    { "artist": "Oranitha", "name": "leafy stalk", "categories": ["flower"], "source": "https://i.imgur.com/NFM09J5.png" },
    { "artist": "Oranitha", "name": "curled stalk", "categories": ["foliage"], "source": "https://i.imgur.com/urBlTiV.png" },
    { "artist": "Oranitha", "name": "sprigs", "categories": ["flower"], "source": "https://i.imgur.com/kyfs2Yl.png" },
    { "artist": "Oranitha", "name": "small bamboo", "categories": ["grass"], "source": "https://i.imgur.com/nMW2bBb.png" },
    { "artist": "Oranitha", "name": "spiky sprout", "categories": ["flower"], "source": "https://i.imgur.com/tBQb6yy.png" },
    { "artist": "Oranitha", "name": "hawkbit", "categories": ["flower"], "source": "https://i.imgur.com/5j6u58a.png" },
    { "artist": "Oranitha", "name": "broadleaf", "categories": ["foliage"], "source": "https://i.imgur.com/Mb1wqi1.png" },
    { "artist": "Oranitha", "name": "slimeleaf", "categories": ["foliage"], "source": "https://i.imgur.com/Rk7vvo3.png" },
    { "artist": "Oranitha", "name": "conifer sapling", "categories": ["tree"], "source": "https://i.imgur.com/DdEYVYA.png" },
    { "artist": "Oranitha", "name": "bonsai", "categories": ["tree"], "source": "https://i.imgur.com/IF5MQWY.png" },
    { "artist": "Oranitha", "name": "lily of the valley", "categories": ["flower"], "source": "https://i.imgur.com/Z6njdmV.png" },
    { "artist": "Oranitha", "name": "flowering tuft", "categories": ["grass"], "source": "https://i.imgur.com/cDAqt4U.png" },
    { "artist": "Oranitha", "name": "slouched sprig", "categories": ["flower"], "source": "https://i.imgur.com/117aiCY.png" },
    { "artist": "Oranitha", "name": "swamp sprout", "categories": ["foliage"], "source": "https://i.imgur.com/7ZrX05Y.png" },
    { "artist": "Oranitha", "name": "elm", "categories": ["tree"], "source": "https://i.imgur.com/ccBvzqU.png" },
    { "artist": "Oranitha", "name": "maple", "categories": ["tree"], "source": "https://i.imgur.com/wLsuJSX.png" },
    { "artist": "Oranitha", "name": "thistle", "categories": ["flower"], "source": "https://i.imgur.com/dxJbfgi.png" },
    { "artist": "Oranitha", "name": "fernleaf", "categories": ["flower"], "source": "https://i.imgur.com/l1MK3yJ.png" },
    { "artist": "Oranitha", "name": "lacy fern", "categories": ["foliage"], "source": "https://i.imgur.com/kTbrzeL.png" },
    { "artist": "Oranitha", "name": "tropic fern", "categories": ["foliage"], "source": "https://i.imgur.com/s4Uav2q.png" },
    { "artist": "Oranitha", "name": "palm tree", "categories": ["tree"], "source": "https://i.imgur.com/6GPgZzr.png" },
    { "artist": "Oranitha", "name": "split stalk", "categories": ["flower"], "source": "https://i.imgur.com/E6ikrq8.png" },
    { "artist": "Oranitha", "name": "spotted mushroom", "categories": ["mushroom"], "source": "https://i.imgur.com/VvrBOM2.png" },
    { "artist": "Oranitha", "name": "small mushroom", "categories": ["mushroom"], "source": "https://i.imgur.com/5y1UeDM.png" },
    { "artist": "Oranitha", "name": "flatcap", "categories": ["mushroom"], "source": "https://i.imgur.com/uYswz0s.png" },
    { "artist": "Oranitha", "name": "slim sprout", "categories": ["flower"], "source": "https://i.imgur.com/qGczjJf.png" },
    { "artist": "Oranitha", "name": "floral scrub", "categories": ["shrub"], "source": "https://i.imgur.com/PaWgGAq.png" },
    { "artist": "Oranitha", "name": "primrose", "categories": ["flower"], "source": "https://i.imgur.com/0fBhPPY.png" },
    { "artist": "Oranitha", "name": "deciduous scrub", "categories": ["shrub"], "source": "https://i.imgur.com/NzGJLcK.png" },
    { "artist": "Oranitha", "name": "wavy mushroom", "categories": ["mushroom"], "source": "https://i.imgur.com/62lbxgE.png" },
    { "artist": "Oranitha", "name": "stump", "categories": ["tree"], "source": "https://i.imgur.com/t6NI9ZW.png" },
    { "artist": "Oranitha", "name": "crumbled pillar", "categories": ["construct"], "source": "https://i.imgur.com/ubsbt7W.png" },
    { "artist": "Oranitha", "name": "palm frond", "categories": ["flower"], "source": "https://i.imgur.com/MAqn21X.png" },
    { "artist": "Oranitha", "name": "curlicue", "categories": ["foliage"], "source": "https://i.imgur.com/xEnajhL.png" },
    { "artist": "Oranitha", "name": "planter box", "categories": ["construct"], "source": "https://i.imgur.com/wHwGcaT.png" },
    { "artist": "Oranitha", "name": "snakesprout", "categories": ["flower"], "source": "https://i.imgur.com/DNJakBN.png" },
    { "artist": "Oranitha", "name": "planter urn", "categories": ["construct"], "source": "https://i.imgur.com/65fD3Wt.png" },
    { "artist": "Oranitha", "name": "cattail", "categories": ["foliage"], "source": "https://i.imgur.com/GhHUZAm.png" },
    { "artist": "Oranitha", "name": "flowering scrubgrass", "categories": ["grass"], "source": "https://i.imgur.com/Wtmyg00.png" },
    { "artist": "Oranitha", "name": "urn", "categories": ["construct"], "source": "https://i.imgur.com/k7FDQzk.png" },
    { "artist": "Oranitha", "name": "lodgepole pine", "categories": ["tree"], "source": "https://i.imgur.com/hnTjsH8.png" },
    { "artist": "Oranitha", "name": "", "categories": ["construct"], "source": "https://i.imgur.com/yIZJ19G.png" },
    { "artist": "Oranitha", "name": "mushlets", "categories": ["mushroom"], "source": "https://i.imgur.com/mQaUMgT.png" },
    { "artist": "Oranitha", "name": "kelp", "categories": ["aquatic"], "source": "https://i.imgur.com/t2NAP7b.png" },
    { "artist": "Oranitha", "name": "coral", "categories": ["aquatic"], "source": "https://i.imgur.com/abzacy8.png" },
    { "artist": "Oranitha", "name": "budding grass", "categories": ["grass"], "source": "https://i.imgur.com/Wax3h14.png" },
    { "artist": "Oranitha", "name": "ash", "categories": ["tree"], "source": "https://i.imgur.com/LXwHQjn.png" },
    { "artist": "Oranitha", "name": "shrub", "categories": ["shrub"], "source": "https://i.imgur.com/3RpiB9t.png" },
    { "artist": "Oranitha", "name": "oak", "categories": ["tree"], "source": "https://i.imgur.com/LIicGxR.png" },
    { "artist": "Oranitha", "name": "bare tree", "categories": ["tree"], "source": "https://i.imgur.com/2XeqnbE.png" },
    { "artist": "Oranitha", "name": "small crystal", "categories": ["rock"], "source": "https://i.imgur.com/Zal2kLb.png" },
    { "artist": "Oranitha", "name": "magnolia", "categories": ["shrub"], "source": "https://i.imgur.com/thX8zVH.png" },
    { "artist": "Oranitha", "name": "manzanita", "categories": ["shrub"], "source": "https://i.imgur.com/YsmG4bZ.png" },
    { "artist": "Oranitha", "name": "tall mushroom", "categories": ["mushroom"], "source": "https://i.imgur.com/iv73TrE.png" },
    { "artist": "Oranitha", "name": "flowering grass", "categories": ["grass"], "source": "https://i.imgur.com/E96bbUd.png" },
    { "artist": "Oranitha", "name": "tall crystal", "categories": ["rock"], "source": "https://i.imgur.com/7amn8lf.png" },
    { "artist": "Oranitha", "name": "birch", "categories": ["tree"], "source": "https://i.imgur.com/EaOoji3.png" },
    { "artist": "Oranitha", "name": "willow", "categories": ["tree"], "source": "https://i.imgur.com/IvZmYJ0.png" },
    { "artist": "Oranitha", "name": "bamboo", "categories": ["grass"], "source": "https://i.imgur.com/5CYK3pl.png" },
    { "artist": "Oranitha", "name": "goldenrod", "categories": ["flower"], "source": "https://i.imgur.com/JfQb93F.png" },
    { "artist": "Oranitha", "name": "curled fern", "categories": ["foliage"], "source": "https://i.imgur.com/HaOVemI.png" },
    { "artist": "Xaotician", "name": "saguaro", "categories": ["succulent"], "source": "https://i.imgur.com/FSFBSlo.png" },
    { "artist": "RedRevival", "name": "giant gem tree", "categories": ["tree"], "source": "https://i.imgur.com/cgkP5B6.png" },
    { "artist": "Oranitha", "name": "curved oak", "categories": ["tree"], "source": "https://i.imgur.com/DynbJCl.png" },
    { "artist": "RedRevival", "name": "giant tree", "categories": ["tree"], "source": "https://i.imgur.com/k9w5afZ.png" },
    { "artist": "Oranitha", "name": "scrubby shrub", "categories": ["shrub"], "source": "https://i.imgur.com/CGp6xFF.png" },
    { "artist": "Oranitha", "name": "tall grass", "categories": ["grass"], "source": "https://i.imgur.com/tASn4zC.png" },
    { "artist": "Oranitha", "name": "overgrown pillar", "categories": ["construct"], "source": "https://i.imgur.com/Muj9pgt.png" },
    { "artist": "Oranitha", "name": "spruce", "categories": ["tree"], "source": "https://i.imgur.com/FL4BAHX.png" },
    { "artist": "Xaotician", "name": "boabab", "categories": ["tree"], "source": "https://i.imgur.com/qqUgOYg.png" },
    { "artist": "Xaotician", "name": "acacia", "categories": ["tree"], "source": "https://i.imgur.com/LAQZ4s7.png" },
    { "artist": "Xaotician", "name": "mini acacia", "categories": ["tree"], "source": "https://i.imgur.com/9NyqPmf.png" },
    { "artist": "Xaotician", "name": "giant echinacea", "categories": ["flower"], "source": "https://i.imgur.com/dbS96tA.png" },
    { "artist": "RedRevival", "name": "berry bush", "categories": ["shrub"], "source": "https://i.imgur.com/1Y5ls06.png" },
    { "artist": "Oranitha", "name": "palmflower", "categories": ["flower"], "source": "https://i.imgur.com/EhMFu9B.png" },
    { "artist": "Oranitha", "name": "magic corn", "categories": ["flower"], "source": "https://i.imgur.com/qgJ3827.png" },
    { "artist": "Oranitha", "name": "hanging pot tree", "categories": ["tree"], "source": "https://i.imgur.com/XyaY9kF.png" },
    { "artist": "Oranitha", "name": "aspen", "categories": ["tree"], "source": "https://i.imgur.com/BhMMhrn.png" },
    { "artist": "Xaotician", "name": "chaos grass", "categories": ["grass"], "source": "https://i.imgur.com/RNv63mA.png" },
    { "artist": "Xaotician", "name": "branching flower", "categories": ["flower"], "source": "https://i.imgur.com/t5T7Vb7.png" },
    { "artist": "Xaotician", "name": "tilted spotted mushroom", "categories": ["mushroom"], "source": "https://i.imgur.com/Ox6ArQN.png" },
    { "artist": "RedRevival", "name": "small prickly pear", "categories": ["succulent"], "source": "https://i.imgur.com/WKvhSXz.png" },
    { "artist": "RedRevival", "name": "prickly pear", "categories": ["succulent"], "source": "https://i.imgur.com/Fz6ldEU.png" },
    { "artist": "Xaotician", "name": "desert rose", "categories": ["flower"], "source": "https://i.imgur.com/XDenv4L.png" },
    { "artist": "Xaotician", "name": "wild desert rose", "categories": ["tree"], "source": "https://i.imgur.com/qT4F8Wh.png" },
    { "artist": "Xaotician", "name": "barrel cactus", "categories": ["succulent"], "source": "https://i.imgur.com/0j5Khpm.png" },
    { "artist": "Xaotician", "name": "dracaena cinnibari", "categories": ["tree"], "source": "https://i.imgur.com/NhefjfV.png" },
    { "artist": "Xaotician", "name": "Australian grass tree", "categories": ["tree"], "source": "https://i.imgur.com/C95Je1X.png" },
    { "artist": "Xaotician", "name": "small feathery fern", "categories": ["foliage"], "source": "https://i.imgur.com/UkOY96i.png" },
    { "artist": "Xaotician", "name": "feathery fern", "categories": ["foliage"], "source": "https://i.imgur.com/0Fml1MI.png" },
    { "artist": "Xaotician", "name": "venus flytrap", "categories": ["foliage"], "source": "https://i.imgur.com/N8Blg9w.png" },
    { "artist": "Xaotician", "name": "fallen log", "categories": ["tree"], "source": "https://i.imgur.com/xNwcdSt.png" },
    { "artist": "Xaotician", "name": "flowering trellis", "categories": ["construct"], "source": "https://i.imgur.com/gic1Bgj.png" },
    { "artist": "Xaotician", "name": "planting bench", "categories": ["rare"], "source": "https://i.imgur.com/NDnKMrY.png" },
    { "artist": "Oranitha", "name": "magic display", "categories": ["construct"], "source": "https://i.imgur.com/MmN2A17.png" },
    { "artist": "Oranitha", "name": "parlor plant", "categories": ["foliage"], "source": "https://i.imgur.com/HNkWjgK.png" },
    { "artist": "RedRevival", "name": "bluebell", "categories": ["flower"], "source": "https://i.imgur.com/aoTsd6a.png" },
    { "artist": "Xaotician", "name": "giant candle", "categories": ["rare"], "source": "https://i.imgur.com/1NZlHPp.png" },
    { "artist": "FoxyCipher", "name": "bleeding heart", "categories": ["flower"], "source": "https://i.imgur.com/ShUbORE.png" },
    { "artist": "Oranitha", "name": "low arum", "categories": ["flower"], "source": "https://i.imgur.com/qLIC1dw.png" },
    { "artist": "Oranitha", "name": "territory marker", "categories": ["construct"], "source": "https://i.imgur.com/KbqDATE.png" },
    { "artist": "Oranitha", "name": "floating crystal", "categories": ["rare"], "source": "https://i.imgur.com/jDtvMDk.png" },
    { "artist": "Oranitha", "name": "fireflies", "categories": ["rare"], "source": "https://i.imgur.com/BFJa2xX.png" },
    { "artist": "Xaotician", "name": "giant ink cap", "categories": ["mushroom"], "source": "https://i.imgur.com/C0Elhph.png" },
    { "artist": "Oranitha", "name": "stately planter", "categories": ["construct"], "source": "https://i.imgur.com/4yp3rQR.png" },
    { "artist": "Oranitha", "name": "giant sponge", "categories": ["aquatic"], "source": "https://i.imgur.com/AmgtEol.png" },
    { "artist": "Oranitha", "name": "giant flower", "categories": ["flower"], "source": "https://i.imgur.com/Oc9hXis.png" },
    { "artist": "Oranitha", "name": "streetlamp", "categories": ["rare"], "source": "https://i.imgur.com/QEXAoEh.png" },
    { "artist": "Oranitha", "name": "curly grass", "categories": ["grass"], "source": "https://i.imgur.com/oSwzqLT.png" },
    { "artist": "Oranitha", "name": "glowshroom", "categories": ["rare"], "source": "https://i.imgur.com/Fqj9xcu.png" },
    { "artist": "Natron", "name": "rhizophora m.", "categories": ["tree"], "source": "https://i.imgur.com/eDs8qlm.png" },
    { "artist": "Natron", "name": "cypress", "categories": ["tree"], "source": "https://i.imgur.com/usTpyqu.png" },
    { "artist": "Natron", "name": "tamarix g.", "categories": ["tree"], "source": "https://i.imgur.com/KdUmQ0G.png" },
    { "artist": "Natron", "name": "papyrus", "categories": ["grass"], "source": "https://i.imgur.com/ncvp3HG.png" },
    { "artist": "Natron", "name": "hyphaene thebaica", "categories": ["tree"], "source": "https://i.imgur.com/h7rKTLT.png" },
    { "artist": "Natron", "name": "ben tree", "categories": ["tree"], "source": "https://i.imgur.com/azU9uXZ.png" },
    { "artist": "Natron", "name": "pistacia khinjuk", "categories": ["tree"], "source": "https://i.imgur.com/8QB13Ym.png" },
    { "artist": "Natron", "name": "wild mediterranean cypress", "categories": ["tree"], "source": "https://i.imgur.com/OmvleHV.png" },
    { "artist": "Natron", "name": "salam tree", "categories": ["tree"], "source": "https://i.imgur.com/wbFJFwo.png" },
    { "artist": "Natron", "name": "caper bush", "categories": ["shrub"], "source": "https://i.imgur.com/qtejXew.png" },
    { "artist": "Natron", "name": "argun", "categories": ["tree"], "source": "https://i.imgur.com/wEkbiKg.png" },
    { "artist": "Natron", "name": "small argun", "categories": ["tree"], "source": "https://i.imgur.com/ZNsUIoX.png" },
    { "artist": "Natron", "name": "spreading desert rose", "categories": ["tree"], "source": "https://i.imgur.com/tKKBGYy.png" },
    { "artist": "Natron", "name": "haloxylon", "categories": ["tree"], "source": "https://i.imgur.com/xSkGKFE.png" },
    { "artist": "Natron", "name": "vachellia m", "categories": ["tree"], "source": "https://i.imgur.com/FiC0yXS.png" },
    { "artist": "Natron", "name": "mimusops", "categories": ["tree"], "source": "https://i.imgur.com/hXw6SDR.png" },
    { "artist": "Natron", "name": "silphium", "categories": ["flower"], "source": "https://i.imgur.com/OWKfuqG.png" },
    { "artist": "Oranitha", "name": "wizard\"s cap", "categories": ["mushroom"], "source": "https://i.imgur.com/IVsCxl7.png" },
    { "artist": "Oranitha", "name": "eyebush", "categories": ["shrub"], "source": "https://i.imgur.com/buYHu4d.png" },
    { "artist": "Oranitha", "name": "spooky tree", "categories": ["tree"], "source": "https://i.imgur.com/r9apGXo.png" },
    { "artist": "Oranitha", "name": "giant coral", "categories": ["aquatic"], "source": "https://i.imgur.com/St7i7Sn.png" },
    { "artist": "Oranitha", "name": "splortch", "categories": ["rare"], "source": "https://i.imgur.com/K9yCFDg.png" },
    { "artist": "Semisketched", "name": "butterfly fish", "categories": ["rare"], "source": "https://i.imgur.com/RRCQvhA.png" },
    { "artist": "Semisketched", "name": "jellyfish", "categories": ["aquatic"], "source": "https://i.imgur.com/08TmImE.png" },
    { "artist": "Semisketched", "name": "fish school", "categories": ["aquatic"], "source": "https://i.imgur.com/gDYO9gF.png" },
    { "artist": "Semisketched", "name": "angelfish", "categories": ["aquatic"], "source": "https://i.imgur.com/wORUHzS.png" },
    { "artist": "RedRevival", "name": "showy oxytropis", "categories": ["flower"], "source": "https://i.imgur.com/tqiMbgP.png" },
    { "artist": "Oranitha", "name": "mossy stump", "categories": ["tree"], "source": "https://i.imgur.com/6dYyYt1.png" },
    { "artist": "Oranitha", "name": "lanky bush", "categories": ["shrub"], "source": "https://i.imgur.com/S01WpzA.png" },
    { "artist": "Oranitha", "name": "pots", "categories": ["construct"], "source": "https://i.imgur.com/BKrhChN.png" },
    { "artist": "Oranitha", "name": "fairy lights", "categories": ["rare"], "source": "https://i.imgur.com/g07biTg.png" },
    { "artist": "Oranitha", "name": "large bamboo", "categories": ["grass"], "source": "https://i.imgur.com/ieCLRr4.png" },
    { "artist": "Oranitha", "name": "stone outcrop", "categories": ["rock"], "source": "https://i.imgur.com/vrsojTx.png" },
    { "artist": "Oranitha", "name": "table rock", "categories": ["rock"], "source": "https://i.imgur.com/JdBQXD9.png" },
    { "artist": "Xaotician", "name": "viney arch", "categories": ["construct"], "source": "https://i.imgur.com/yHAyHer.png" },
    { "artist": "RedRevival", "name": "organ pipe cactus", "categories": ["succulent"], "source": "https://i.imgur.com/te0LiY6.png" },
    { "artist": "Frigate", "name": "waving pennant", "categories": ["construct"], "source": "https://i.imgur.com/DVXz8Nr.png" },
    { "artist": "HurricaneWinds", "name": "lupine", "categories": ["flower"], "source": "https://i.imgur.com/snN8fJY.png" },
    { "artist": "Xaotician", "name": "feral bonsai", "categories": ["tree"], "source": "https://i.imgur.com/wNf7FXA.png" },
    { "artist": "Oranitha", "name": "cave crystal", "categories": ["rock"], "source": "https://i.imgur.com/mrELvLA.png" },
    { "artist": "Oranitha", "name": "magic orb", "categories": ["rare"], "source": "https://i.imgur.com/okGXTzn.png" },
    { "artist": "Oranitha", "name": "western white pine", "categories": ["tree"], "source": "https://i.imgur.com/nLv8jTq.png" },
    { "artist": "Oranitha", "name": "chaos kelp", "categories": ["aquatic"], "source": "https://i.imgur.com/pn3p8UY.png" },
    { "artist": "Oranitha", "name": "orb cluster", "categories": ["construct"], "source": "https://i.imgur.com/kyORogL.png" },
    { "artist": "Oranitha", "name": "alien cactus", "categories": ["succulent"], "source": "https://i.imgur.com/LlmBQcI.png" },
    { "artist": "Rat & Reaver of the Bearskull collective", "name": "grand geode", "categories": ["rock"], "source": "https://i.imgur.com/IcEfMHF.png" },
    { "artist": "Rat & Reaver of the Bearskull collective", "name": "deep geode", "categories": ["rock"], "source": "https://i.imgur.com/cbnv85f.png" },
    { "artist": "Oranitha", "name": "I AM ERROR", "categories": [], "source": "https://i.imgur.com/U1qlGFl.png" }
];
// END all_foliage
// The above marker and similar are used to make Python automation easier, I use it to build fresh spritesheets without needing to
// store the data in two places.
var foliage_by_category = {};
function assemble_categories(target_list) {
    by_category = {};
    for (let i = 0; i < window[target_list].length; i++) {
        let entry = window[target_list][i];
        for (category of entry["categories"]) {
            if (!by_category.hasOwnProperty(category)) {
                by_category[category] = [];
            }
            by_category[category].push(i);
        }
    }
    return by_category;
}
function assemble_base_odds(target_categories, base_odd_num) {
    base_odds = {};
    for (category of Object.keys(target_categories)) {
        base_odds[category] = base_odd_num;
    }
    return base_odds;
}
function assemble_choice_list_given_odds(target_categories, target_odds) {
    odds_list = [];
    for (odds_of of Object.keys(target_odds)) {
        for (let i = 0; i < target_odds[odds_of]; i++) {
            odds_list.push(...target_categories[odds_of]);
        }
    }
    return odds_list;
}
foliage_by_category = assemble_categories("all_foliage");
foliage_base_odds = assemble_base_odds(foliage_by_category, 5);
foliage_base_odds["rare"] = 1;
foliage_base_list = assemble_choice_list_given_odds(foliage_by_category, foliage_base_odds);
/*message = "";
for (const [key, value] of Object.entries(foliage_by_category)) {
    message += `${key}: ${value.length}\n`;
  }
alert(message);*/
var all_named = { "nigel": "https://i.imgur.com/zYolkmE.png", "vine_supporter": "https://i.imgur.com/72uDqMq.png", "root_supporter": "https://i.imgur.com/y9eN0Ae.png",
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
    "shale_spring": "https://i.imgur.com/SS5wlwB.png", "limestone_spring": "https://i.imgur.com/YvFBGtb.png", "obsidian_spring": "https://i.imgur.com/HDguTqn.png", "aventurine_spring": "https://i.imgur.com/aqWObIl.png",
    "simple_fence": "https://i.imgur.com/WE4YzQb.png", "simple_fence_broken": "https://i.imgur.com/E1E1q3w.png", "simple_signpost": "https://i.imgur.com/LrdkTBi.png", "shale_birdbath": "https://i.imgur.com/7P7OqPQ.png",
    "bleached_skull": "https://i.imgur.com/kIgNges.png", "bleached_ribs": "https://i.imgur.com/gb5h2ct.png", "burnt_skull": "https://i.imgur.com/swmqdOf.png", "burnt_ribs": "https://i.imgur.com/yCHsvce.png",
    "lawn_deco": "https://i.imgur.com/A5SsKVL.png", "lawn_sin": "https://i.imgur.com/hAqeR7Z.png", "peacock": "https://i.imgur.com/AqGytLV.png",
    "brown_cat": "https://i.imgur.com/has3IZH.png", "colorpoint_cat": "https://i.imgur.com/alQoAKw.png", "grey_cat": "https://i.imgur.com/IGjw0kH.png",
    "ginger_cat": "https://i.imgur.com/XMZSI4u.png", "tuxedo_cat": "https://i.imgur.com/H93FT89.png",
    "robin": "https://i.imgur.com/jtY79vc.png", "bluebird": "https://i.imgur.com/MMdnP2E.png", "gardeneel": "https://i.imgur.com/P5j7JGs.png",
    "bubble_column": "https://i.imgur.com/iDCiNK0.png", "bubble_cloud": "https://i.imgur.com/WbUJsff.png",
    "punkle": "https://i.imgur.com/mGu0QXM.png", "grummi": "https://i.imgur.com/XZqToAL.png", "pip": "https://i.imgur.com/5PRAPj7.png",
    "tlik": "https://i.imgur.com/MaDQORq.png", "the_council": "https://i.imgur.com/P7eG6uq.png", "rupert": "https://i.imgur.com/CnfSm6K.png",
    "rupert_ascendant": "https://i.imgur.com/Na1gT9v.png",
    "oriole": "https://i.imgur.com/KTdWhYB.png", "blackbird": "https://i.imgur.com/GvnkSA7.png", "cardinal": "https://i.imgur.com/Zu9xxP5.png",
    "spoop_one": "https://i.imgur.com/2BYYsbd.png", "spoop_two": "https://i.imgur.com/iUxGYsi.png", "spoop_three": "https://i.imgur.com/mQRx5sJ.png",
    "ghost_one": "https://i.imgur.com/KrLlzh3.png", "ghost_two": "https://i.imgur.com/ppt6svW.png", "ghost_three": "https://i.imgur.com/6gjzp4g.png",
    "lamppost_glow": "https://i.imgur.com/cOcM3OH.png", "pumpkin": "https://i.imgur.com/FdHd60J.png",
    "tamarix_g": "https://i.imgur.com/sYgm6Vn.png", "rhizophora_m": "https://i.imgur.com/fysAyNU.png", "capparis": "https://i.imgur.com/lMlO3l6.png",
    "vachellia_n": "https://i.imgur.com/IbCbKic.png", "haloxylon": "https://i.imgur.com/1WxCgPc.png", "silphium": "https://i.imgur.com/QRu7OJ4.png",
    "meat_stalagmite_left": "https://i.imgur.com/B2Xy5fz.png", "meat_stalagmite_right": "https://i.imgur.com/JsZZYIF.png",
    "pink_jellies": "https://i.imgur.com/MaBKpxS.png", "blue_jellies": "https://i.imgur.com/I37WOzN.png", "whales": "https://i.imgur.com/AqEPGpx.png",
    "frog_green": "https://i.imgur.com/0X7RqRg.png", "frog_brown": "https://i.imgur.com/F93ic5D.png", "tree_frog": "https://i.imgur.com/Zt0jeT9.png",
    "pride_flag": "https://i.imgur.com/DtqGXQD.png", "blue_heron": "https://i.imgur.com/rVcZX7c.png", "great_egret": "https://i.imgur.com/b0eN5mb.png",
    "glossy_ibis": "https://i.imgur.com/1oSfgPo.png", "scarlet_ibis": "https://i.imgur.com/R1a5AIJ.png", "white_ibis": "https://i.imgur.com/6MPgjBa.png",
    "spoonbill": "https://i.imgur.com/Rtj4qvX.png" };
var reformatted_named = {
    "nigel": { "artist": "Oranitha", "source": "https://i.imgur.com/zYolkmE.png", "offset": 0 },
    "vine_supporter": { "artist": "Oranitha", "source": "https://i.imgur.com/72uDqMq.png", "offset": 1 },
    "root_supporter": { "artist": "Oranitha", "source": "https://i.imgur.com/y9eN0Ae.png", "offset": 2 },
    "bone_supporter": { "artist": "Oranitha", "source": "https://i.imgur.com/EzL4aw0.png", "offset": 3 },
    "stone_supporter": { "artist": "Oranitha", "source": "https://i.imgur.com/xyB8zjm.png", "offset": 4 },
    "bunbun": { "artist": "aprilofsnow", "source": "https://i.imgur.com/Qn23rZb.png", "offset": 5 },
    "bunbun_black": { "artist": "aprilofsnow", "source": "https://i.imgur.com/S6vpB9i.png", "offset": 6 },
    "bunbun_white": { "artist": "aprilofsnow", "source": "https://i.imgur.com/1xnwUWv.png", "offset": 7 },
    "grazing_goat": { "artist": "TwoPuffins", "source": "https://i.imgur.com/6LsCzM6.png", "offset": 8 },
    "grazing_goatbrown": { "artist": "TwoPuffins", "source": "https://i.imgur.com/ZbLlfdq.png", "offset": 9 },
    "grazing_goatspotted": { "artist": "TwoPuffins", "source": "https://i.imgur.com/wR92Own.png", "offset": 10 },
    "micro_goat": { "artist": "TwoPuffins", "source": "https://i.imgur.com/0MN5MiP.png", "offset": 11 },
    "pots'n_pans": { "artist": "aprilofsnow", "source": "https://i.imgur.com/sbh42Qu.png", "offset": 12 },
    "male_cardinal": { "artist": "Lixue", "source": "https://i.imgur.com/0WaJacd.png", "offset": 13 },
    "female_cardinal": { "artist": "Lixue", "source": "https://i.imgur.com/1RcilE0.png", "offset": 14 },
    "griffon_vulture": { "artist": "Lixue", "source": "https://i.imgur.com/a01VWAo.png", "offset": 15 },
    "turkey_vulture": { "artist": "Lixue", "source": "https://i.imgur.com/a6jGcCr.png", "offset": 16 },
    "summer_col": { "artist": "Ico", "source": "https://i.imgur.com/5hsYi2x.png", "offset": 17 },
    "winter_col": { "artist": "Ico", "source": "https://i.imgur.com/PIvtEQp.png", "offset": 18 },
    "autumn_col": { "artist": "Ico", "source": "https://i.imgur.com/SM9CLUW.png", "offset": 19 },
    "spring_col": { "artist": "Ico", "source": "https://i.imgur.com/z22QWj1.png", "offset": 20 },
    "stone_simple_bench": { "artist": "Oranitha", "source": "https://i.imgur.com/CxUk9nb.png", "offset": 21 },
    "sandy_simple_bench": { "artist": "Oranitha", "source": "https://i.imgur.com/PdgM5Dm.png", "offset": 22 },
    "ice_simple_bench": { "artist": "Oranitha", "source": "https://i.imgur.com/Z9KDYr7.png", "offset": 23 },
    "growth_simple_bench": { "artist": "Oranitha", "source": "https://i.imgur.com/uGxm8Pp.png", "offset": 24 },
    "onyx_simple_bench": { "artist": "Oranitha", "source": "https://i.imgur.com/ZHHWzqf.png", "offset": 25 },
    "crystal_simple_bench": { "artist": "Oranitha", "source": "https://i.imgur.com/LewbVev.png", "offset": 26 },
    "light_uni": { "artist": "TwoPuffins", "source": "https://i.imgur.com/h25jofW.png", "offset": 27 },
    "dark_uni": { "artist": "TwoPuffins", "source": "https://i.imgur.com/wZDto2T.png", "offset": 28 },
    "big_fountain": { "artist": "aprilofsnow", "source": "https://i.imgur.com/Gb64tAf.png", "offset": 29 },
    "bunbun_grass": { "artist": "aprilofsnow", "source": "https://i.imgur.com/dzonSfL.png", "offset": 30 },
    "bunbun_sakura": { "artist": "aprilofsnow", "source": "https://i.imgur.com/tFsZkwX.png", "offset": 31 },
    "bunbun_snow": { "artist": "aprilofsnow", "source": "https://i.imgur.com/w5HmhlH.png", "offset": 32 },
    "plain_big_bone": { "artist": "WynnDawnstrider", "source": "https://i.imgur.com/7uVtIgT.png", "offset": 33 },
    "mossy_big_bone": { "artist": "WynnDawnstrider", "source": "https://i.imgur.com/TCwHxZY.png", "offset": 34 },
    "bloody_big_bone": { "artist": "WynnDawnstrider", "source": "https://i.imgur.com/Ra1hOOE.png", "offset": 35 },
    "misty_big_bone": { "artist": "WynnDawnstrider", "source": "https://i.imgur.com/Pj6BCRJ.png", "offset": 36 },
    "shaded_big_bone": { "artist": "WynnDawnstrider", "source": "https://i.imgur.com/ZTR99ug.png", "offset": 37 },
    "giant_gold": { "artist": "RedRevival", "source": "https://i.imgur.com/BJt4LwQ.png", "offset": 38 },
    "giant_rosegold": { "artist": "RedRevival", "source": "https://i.imgur.com/mswDGRW.png", "offset": 39 },
    "giant_silver": { "artist": "RedRevival", "source": "https://i.imgur.com/I4cluBv.png", "offset": 40 },
    "giant_copper": { "artist": "RedRevival", "source": "https://i.imgur.com/0Ymk8oM.png", "offset": 41 },
    "giant_copperhalf": { "artist": "RedRevival", "source": "https://i.imgur.com/kU4sPSw.png", "offset": 42 },
    "giant_copperfull": { "artist": "RedRevival", "source": "https://i.imgur.com/JXyQeXD.png", "offset": 43 },
    "giant_copperblended": { "artist": "RedRevival", "source": "https://i.imgur.com/DDqoxuB.png", "offset": 44 },
    "giant_cobalt": { "artist": "RedRevival", "source": "https://i.imgur.com/r8tfKle.png", "offset": 45 },
    "giant_iron": { "artist": "RedRevival", "source": "https://i.imgur.com/dQy3aKl.png", "offset": 46 },
    "shale_rock_1": { "artist": "Oranitha", "source": "https://i.imgur.com/kWy5LYK.png", "offset": 47 },
    "shale_rock_2": { "artist": "Oranitha", "source": "https://i.imgur.com/FvM0af4.png", "offset": 48 },
    "shale_rock_3": { "artist": "Oranitha", "source": "https://i.imgur.com/gOI3GWA.png", "offset": 49 },
    "shale_rock_4": { "artist": "Oranitha", "source": "https://i.imgur.com/rdHtEmf.png", "offset": 50 },
    "limestone_rock_1": { "artist": "Oranitha", "source": "https://i.imgur.com/e8WGNIX.png", "offset": 51 },
    "limestone_rock_2": { "artist": "Oranitha", "source": "https://i.imgur.com/z9G8xUz.png", "offset": 52 },
    "limestone_rock_3": { "artist": "Oranitha", "source": "https://i.imgur.com/4eS8voG.png", "offset": 53 },
    "limestone_rock_4": { "artist": "Oranitha", "source": "https://i.imgur.com/zisb1Sm.png", "offset": 54 },
    "obsidian_rock_1": { "artist": "Oranitha", "source": "https://i.imgur.com/VJbGsNP.png", "offset": 55 },
    "obsidian_rock_2": { "artist": "Oranitha", "source": "https://i.imgur.com/QD7qunp.png", "offset": 56 },
    "obsidian_rock_3": { "artist": "Oranitha", "source": "https://i.imgur.com/wVqYlpE.png", "offset": 57 },
    "obsidian_rock_4": { "artist": "Oranitha", "source": "https://i.imgur.com/G3YixT4.png", "offset": 58 },
    "aventurine_rock_1": { "artist": "Oranitha", "source": "https://i.imgur.com/x8PAyAR.png", "offset": 59 },
    "aventurine_rock_2": { "artist": "Oranitha", "source": "https://i.imgur.com/FAuYH6y.png", "offset": 60 },
    "aventurine_rock_3": { "artist": "Oranitha", "source": "https://i.imgur.com/SiOomwa.png", "offset": 61 },
    "aventurine_rock_4": { "artist": "Oranitha", "source": "https://i.imgur.com/XBTiOM1.png", "offset": 62 },
    "shale_cairn": { "artist": "Oranitha", "source": "https://i.imgur.com/mPCJ6xK.png", "offset": 63 },
    "limestone_cairn": { "artist": "Oranitha", "source": "https://i.imgur.com/YY3aAhM.png", "offset": 64 },
    "obsidian_cairn": { "artist": "Oranitha", "source": "https://i.imgur.com/z85y3DB.png", "offset": 65 },
    "aventurine_cairn": { "artist": "Oranitha", "source": "https://i.imgur.com/xfoVNh6.png", "offset": 66 },
    "shale_spring": { "artist": "Oranitha", "source": "https://i.imgur.com/SS5wlwB.png", "offset": 67 },
    "limestone_spring": { "artist": "Oranitha", "source": "https://i.imgur.com/YvFBGtb.png", "offset": 68 },
    "obsidian_spring": { "artist": "Oranitha", "source": "https://i.imgur.com/HDguTqn.png", "offset": 69 },
    "aventurine_spring": { "artist": "Oranitha", "source": "https://i.imgur.com/aqWObIl.png", "offset": 70 },
    "simple_fence": { "artist": "Oranitha", "source": "https://i.imgur.com/WE4YzQb.png", "offset": 71 },
    "simple_fence_broken": { "artist": "Oranitha", "source": "https://i.imgur.com/E1E1q3w.png", "offset": 72 },
    "simple_signpost": { "artist": "Oranitha", "source": "https://i.imgur.com/LrdkTBi.png", "offset": 73 },
    "shale_birdbath": { "artist": "Oranitha", "source": "https://i.imgur.com/7P7OqPQ.png", "offset": 74 },
    "bleached_skull": { "artist": "Oranitha", "source": "https://i.imgur.com/kIgNges.png", "offset": 75 },
    "bleached_ribs": { "artist": "Oranitha", "source": "https://i.imgur.com/gb5h2ct.png", "offset": 76 },
    "burnt_skull": { "artist": "Oranitha", "source": "https://i.imgur.com/swmqdOf.png", "offset": 77 },
    "burnt_ribs": { "artist": "Oranitha", "source": "https://i.imgur.com/yCHsvce.png", "offset": 78 },
    "lawn_deco": { "artist": "Xaotician", "source": "https://i.imgur.com/A5SsKVL.png", "offset": 79 },
    "lawn_sin": { "artist": "Xaotician", "source": "https://i.imgur.com/hAqeR7Z.png", "offset": 80 },
    "peacock": { "artist": "Xaotician", "source": "https://i.imgur.com/AqGytLV.png", "offset": 81 },
    "brown_cat": { "artist": "CrystalDragon14", "source": "https://i.imgur.com/has3IZH.png", "offset": 82 },
    "colorpoint_cat": { "artist": "CrystalDragon14", "source": "https://i.imgur.com/alQoAKw.png", "offset": 83 },
    "grey_cat": { "artist": "CrystalDragon14", "source": "https://i.imgur.com/IGjw0kH.png", "offset": 84 },
    "ginger_cat": { "artist": "CrystalDragon14", "source": "https://i.imgur.com/XMZSI4u.png", "offset": 85 },
    "tuxedo_cat": { "artist": "CrystalDragon14", "source": "https://i.imgur.com/H93FT89.png", "offset": 86 },
    "robin": { "artist": "Ambulocetus", "source": "https://i.imgur.com/jtY79vc.png", "offset": 87 },
    "bluebird": { "artist": "Ambulocetus", "source": "https://i.imgur.com/MMdnP2E.png", "offset": 88 },
    "gardeneel": { "artist": "Ambulocetus", "source": "https://i.imgur.com/P5j7JGs.png", "offset": 89 },
    "bubble_column": { "artist": "Oranitha", "source": "https://i.imgur.com/iDCiNK0.png", "offset": 90 },
    "bubble_cloud": { "artist": "Oranitha", "source": "https://i.imgur.com/WbUJsff.png", "offset": 91 },
    "punkle": { "artist": "Oranitha", "source": "https://i.imgur.com/mGu0QXM.png", "offset": 92 },
    "grummi": { "artist": "Oranitha", "source": "https://i.imgur.com/XZqToAL.png", "offset": 93 },
    "pip": { "artist": "Oranitha", "source": "https://i.imgur.com/5PRAPj7.png", "offset": 94 },
    "tlik": { "artist": "Oranitha", "source": "https://i.imgur.com/MaDQORq.png", "offset": 95 },
    "the_council": { "artist": "Oranitha", "source": "https://i.imgur.com/P7eG6uq.png", "offset": 96 },
    "rupert": { "artist": "Oranitha", "source": "https://i.imgur.com/CnfSm6K.png", "offset": 97 },
    "rupert_ascendant": { "artist": "Oranitha", "source": "https://i.imgur.com/Na1gT9v.png", "offset": 98 },
    "oriole": { "artist": "Oranitha", "source": "https://i.imgur.com/KTdWhYB.png", "offset": 99 },
    "blackbird": { "artist": "Oranitha", "source": "https://i.imgur.com/GvnkSA7.png", "offset": 100 },
    "cardinal": { "artist": "Oranitha", "source": "https://i.imgur.com/Zu9xxP5.png", "offset": 101 },
    "spoop_one": { "artist": "Xaotician", "source": "https://i.imgur.com/2BYYsbd.png", "offset": 102 },
    "spoop_two": { "artist": "Xaotician", "source": "https://i.imgur.com/iUxGYsi.png", "offset": 103 },
    "spoop_three": { "artist": "Xaotician", "source": "https://i.imgur.com/mQRx5sJ.png", "offset": 104 },
    "ghost_one": { "artist": "Xaotician", "source": "https://i.imgur.com/KrLlzh3.png", "offset": 105 },
    "ghost_two": { "artist": "Xaotician", "source": "https://i.imgur.com/ppt6svW.png", "offset": 106 },
    "ghost_three": { "artist": "Xaotician", "source": "https://i.imgur.com/6gjzp4g.png", "offset": 107 },
    "lamppost_glow": { "artist": "Oranitha", "source": "https://i.imgur.com/cOcM3OH.png", "offset": 108 },
    "pumpkin": { "artist": "Frigate", "source": "https://i.imgur.com/FdHd60J.png", "offset": 109 },
    "tamarix_g": { "artist": "Natron", "source": "https://i.imgur.com/sYgm6Vn.png", "offset": 110 },
    "rhizophora_m": { "artist": "Natron", "source": "https://i.imgur.com/fysAyNU.png", "offset": 111 },
    "capparis": { "artist": "Natron", "source": "https://i.imgur.com/lMlO3l6.png", "offset": 112 },
    "vachellia_n": { "artist": "Natron", "source": "https://i.imgur.com/IbCbKic.png", "offset": 113 },
    "haloxylon": { "artist": "Natron", "source": "https://i.imgur.com/1WxCgPc.png", "offset": 114 },
    "silphium": { "artist": "Natron", "source": "https://i.imgur.com/QRu7OJ4.png", "offset": 115 },
    "meat_stalagmite_left": { "artist": "Oranitha", "source": "https://i.imgur.com/B2Xy5fz.png", "offset": 116 },
    "meat_stalagmite_right": { "artist": "Oranitha", "source": "https://i.imgur.com/JsZZYIF.png", "offset": 117 },
    "pink_jellies": { "artist": "Semisketched", "source": "https://i.imgur.com/MaBKpxS.png", "offset": 118 },
    "blue_jellies": { "artist": "Semisketched", "source": "https://i.imgur.com/I37WOzN.png", "offset": 119 },
    "whales": { "artist": "Semisketched", "source": "https://i.imgur.com/AqEPGpx.png", "offset": 120 },
    "frog_green": { "artist": "RedRevival", "source": "https://i.imgur.com/0X7RqRg.png", "offset": 121 },
    "frog_brown": { "artist": "RedRevival", "source": "https://i.imgur.com/F93ic5D.png", "offset": 122 },
    "tree_frog": { "artist": "RedRevival", "source": "https://i.imgur.com/Zt0jeT9.png", "offset": 123 },
    "pride_flag": { "artist": "Frigate", "source": "https://i.imgur.com/DtqGXQD.png", "offset": 124 },
    "blue_heron": { "artist": "HurricaneWinds", "source": "https://i.imgur.com/rVcZX7c.png", "offset": 125 },
    "great_egret": { "artist": "HurricaneWinds", "source": "https://i.imgur.com/b0eN5mb.png", "offset": 126 },
    "glossy_ibis": { "artist": "HurricaneWinds", "source": "https://i.imgur.com/1oSfgPo.png", "offset": 127 },
    "scarlet_ibis": { "artist": "HurricaneWinds", "source": "https://i.imgur.com/R1a5AIJ.png", "offset": 128 },
    "white_ibis": { "artist": "HurricaneWinds", "source": "https://i.imgur.com/6MPgjBa.png", "offset": 129 },
    "spoonbill": { "artist": "HurricaneWinds", "source": "https://i.imgur.com/Rtj4qvX.png", "offset": 130 }
};
// END reformatted_named
var FOLIAGE_SPRITESHEET = "https://raw.githubusercontent.com/OriWritesAPlugin/AlphaGarden/master/images/all_foliage.png";
var NAMED_SPRITESHEET = "https://raw.githubusercontent.com/OriWritesAPlugin/AlphaGarden/master/images/reformatted_named.png";
override_foliage = [];
temp_boost_foliage = [];
all_features = ["https://i.imgur.com/G4h84Ht.png", "https://i.imgur.com/vXQYMkL.png", "https://i.imgur.com/p1ipMdS.png", "https://i.imgur.com/UUFJO7h.png", "https://i.imgur.com/IyaeNvt.png", "https://i.imgur.com/NXRWexZ.png", "https://i.imgur.com/VwMnyDB.png", "https://i.imgur.com/mLfzmM8.png", "https://i.imgur.com/zcXm5Op.png", "https://i.imgur.com/Osvq1V0.png", "https://i.imgur.com/iPK9aJ7.png", "https://i.imgur.com/3SpYgDN.png", "https://i.imgur.com/6MRuqb7.png", "https://i.imgur.com/jrYQjIW.png"];
var simple_features = [0, 1];
var complex_features = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
var all_palettes = [{ "palette": ['aed740', '76c935', '50aa37', '2f902b'], "categories": ["foliar"] },
    { "palette": ['a2ac4d', '8f974a', '66732a', '4b692f'], "categories": ["foliar"] },
    { "palette": ['7ad8b7', '5eb995', '3e946d', '277b50'], "categories": ["foliar"] },
    { "palette": ['9dbb86', '679465', '476f58', '2f4d47'], "categories": ["foliar"] },
    { "palette": ['8fbe99', '58906f', '3f7252', '215a3f'], "categories": ["foliar"] },
    { "palette": ['fdff07', 'b9d50f', '669914', '34670b'], "categories": ["strange"] }, // nuclear
    { "palette": ['b0f7a9', '7dcc75', '63aa5a', '448d3c'], "categories": ["foliar"] },
    { "palette": ['c5af7a', 'a6905c', '806d40', '69582e'], "categories": ["earthen", "foliar"] },
    { "palette": ['6ee964', '54c44b', '3da136', '228036'], "categories": ["foliar"] },
    { "palette": ['e7d7c1', 'a78a7f', '735751', '603f3d'], "categories": ["earthen"] },
    { "palette": ['9c6695', '734978', '4c2d5c', '2f1847'], "categories": ["dark"] },
    { "palette": ['f8cd1e', 'd3a740', 'b2773a', '934634'], "categories": ["foliar"] },
    { "palette": ['e4eaf3', 'c0cfe7', '9ab3db', '7389ad'], "categories": ["pastel"] },
    { "palette": ['b98838', '8c6526', '674426', '54401f'], "categories": ["earthen"] },
    { "palette": ['8f8090', '655666', '453946', '2a212b'], "categories": ["dark"] },
    { "palette": ['f5dbd7', 'eec3c3', 'd396a8', 'c9829d'], "categories": ["pastel"] },
    { "palette": ['cdd1ff', '9fc0ff', '709ade', '4b5e95'], "categories": ["pastel"] },
    { "palette": ['f6e9a4', 'e8b78e', 'd5737d', 'c45088'], "categories": ["strange"] }, // soft sunrise
    { "palette": ['e88c50', 'd0653e', 'af3629', '9b1f1f'], "categories": ["foliar"] },
    { "palette": ['fef4cc', 'fde47b', 'ffd430', 'ecb600'], "categories": ["bold"] },
    { "palette": ['f3addd', 'd87fbc', 'c059a0', 'aa3384'], "categories": ["bold"] },
    { "palette": ['3ac140', '1b9832', '116d22', '085c17'], "categories": ["foliar", "bold"] },
    { "palette": ['eaf4bd', 'aade87', '6cc750', '1aaa09'], "categories": ["strange"] }, // slime
    { "palette": ['b77e4e', '88572e', '674426', '543a24'], "categories": ["earthen"] },
    { "palette": ['b7ed6c', '83d764', '47be5c', '0ca553'], "categories": ["foliar"] },
    { "palette": ['f3eacf', 'e4d4be', 'ccb4a4', 'b69389'], "categories": ["pastel"] },
    { "palette": ['edc55c', 'd99b61', 'bf7464', 'a6636c'], "categories": ["foliar"] },
    { "palette": ['8bfdd6', '55dbc3', '25b8b5', '0b8c9d'], "categories": ["bold"] },
    { "palette": ['f5e2af', 'f3c13d', 'cba134', 'a7832d'], "categories": ["strange"] }, // gold
    { "palette": ['a66547', '6e3837', '542c37', '45283a'], "categories": ["earthen"] },
    { "palette": ['cedd80', '95c27d', '52a279', '057d77'], "categories": ["foliar"] },
    { "palette": ['fff9cf', 'f4d6bc', 'eaaba8', 'dc91b8'], "categories": ["pastel"] },
    { "palette": ['b77e4e', '88572e', '674426', '543a24'], "categories": [] }, // duplicate color
    { "palette": ['c5af7a', 'a6905c', '806d40', '69582e'], "categories": ["earthen"] },
    { "palette": ['a6705a', '8b4e35', '6c2e1c', '571d0e'], "categories": ["earthen"] },
    { "palette": ['fa9292', 'f55757', 'e32b2b', 'ca0e18'], "categories": ["bold"] }, // the default accent block
    { "palette": ['93aaff', '5778f5', '3a5ad2', '233fa8'], "categories": ["bold"] },
    { "palette": ['ffcf80', 'ffb63e', 'ff9300', 'da7500'], "categories": ["bold"] },
    { "palette": ['f5fff4', 'dbf5d9', 'bee1bb', '9fc99c'], "categories": ["pastel"] },
    { "palette": ['cd41d9', 'b309c0', '860d9e', '61067b'], "categories": ["bold"] },
    { "palette": ['8cf5f8', '30e8ed', '18c9d4', '0798a6'], "categories": ["bold"] },
    { "palette": ['b5c085', '7b9b64', '47774a', '305540'], "categories": ["foliar"] },
    { "palette": ['9bcf4b', '719e34', '45681a', '274409'], "categories": ["foliar"] },
    { "palette": ['4fb81d', '339324', '1d7628', '075a2d'], "categories": ["foliar"] },
    { "palette": ['6e7706', '465f14', '234d21', '033a34'], "categories": ["dark"] },
    { "palette": ['78a562', '4e875a', '2a6e53', '0c584d'], "categories": ["foliar"] },
    { "palette": ['077773', '135260', '21294d', '2e033a'], "categories": ["dark"] },
    { "palette": ['e0ea8a', 'bdbb5c', 'b0983a', 'a5791b'], "categories": ["strange"] },
    { "palette": ['fcf050', 'dca02a', 'c46212', 'ae2c00'], "categories": ["foliar"] }, // fiery autumn
    { "palette": ['adef94', '71d86b', '2fc45a', '0aab68'], "categories": ["foliar"] },
    { "palette": ['f6cfec', 'eca9ee', 'cd86e6', 'ab6ce0'], "categories": ["pastel"] },
    { "palette": ['ffd2c6', 'ffb39c', 'ff8e69', 'f87e4a'], "categories": ["bold"] },
    { "palette": ['684e39', '513522', '391e10', '1f0c03'], "categories": ["dark"] },
    { "palette": ['fce382', 'ebab8a', 'dc5890', 'b027a1'], "categories": ["strange"] },
    { "palette": ['71f4a3', '68dbba', '4cb1c4', '3c7fb2'], "categories": ["strange"] },
    { "palette": ['c5e9fc', 'b5c1fa', 'a494f8', '9163f5'], "categories": ["strange"] },
    { "palette": ['f83234', 'c92637', '841732', '560e27'], "categories": ["bold"] },
    { "palette": ['fbeba5', 'c6b05f', '929564', '527259'], "categories": ["strange"] }, // brass
    { "palette": ['fff7cf', 'ece2b1', 'ddcea1', 'ccb78e'], "categories": ["pastel"] },
    { "palette": ['fb8dc2', 'd75dd0', 'a44abf', '7c3fae'], "categories": ["strange"] },
    { "palette": ['e1e0ff', 'aaa8c1', '7c7a8f', '4c4b53'], "categories": ["strange"] },
    { "palette": ['a6a190', '938a7d', '74685a', '5a5144'], "categories": ["earthen"] },
    { "palette": ['2e7747', '175143', '143841', '12253e'], "categories": ["foliar"] },
    { "palette": ['7dc9d2', '4e85b1', '325689', '312f70'], "categories": ["strange"] },
    { "palette": ['405251', '2b393a', '1e252a', '14151e'], "categories": ["dark"] },
    { "palette": ['666fa9', '424071', '2c1f4c', '240539'], "categories": ["dark"] },
    { "palette": ['cc3a77', '942162', '5d1354', '2f0e4d'], "categories": ["bold", "dark"] },
    { "palette": ['59a89f', '325354', '2b262e', '2e0d19'], "categories": ["dark"] },
    { "palette": ['899571', '545a4a', '40463a', '2d302e'], "categories": ["foliar"] },
    { "palette": ['99ad57', '54623c', '37422c', '151d1d'], "categories": ["foliar"] },
    { "palette": ['c25a4a', '8f2e21', '711612', '4d0606'], "categories": ["foliar"] },
    { "palette": ['9c0900', '6a0b00', '3e0600', '180200'], "categories": ["dark"] }, // bloodtone
    { "palette": ['ddd784', 'c1c656', '99ae39', '769926'], "categories": ["foliar"] },
    { "palette": ['b1ed11', '46d01b', '18b069', '168b98'], "categories": ["strange"] },
    { "palette": ['ccc65d', '99902f', '7f771d', '605a16'], "categories": ["foliar"] },
    { "palette": ['8e8e4f', '6d703e', '4d542b', '3b4429'], "categories": ["foliar"] },
    { "palette": ['b9d163', 'b7a949', '9b6d3b', '7c352c'], "categories": ["strange"] },
    { "palette": ['e3c510', 'bc8c0e', '864a0b', '541f08'], "categories": ["foliar"] },
    { "palette": ['452a31', '3b1817', '29100e', '1a0a06'], "categories": ["dark", "earthen"] },
    { "palette": ['ba7b59', 'a05d39', '7f4323', '66371c'], "categories": ["earthen"] },
    { "palette": ['bc8060', '8c6047', '76523c', '644030'], "categories": ["earthen"] },
    { "palette": ['b4a58a', '8e795e', '674d36', '432a1c'], "categories": ["earthen"] },
    { "palette": ['e2cda7', 'd5835d', 'bd4b34', '692b26'], "categories": ["strange"] },
    { "palette": ['578759', '316140', '21372a', '101e11'], "categories": ["foliar"] },
    { "palette": ['82d083', '53ab6b', '277e5a', '0d534b'], "categories": ["foliar"] },
    { "palette": ['82d083', '81b964', '318945', '105949'], "categories": ["foliar"] },
    { "palette": ['ab5b11', '8f4711', '5d2611', '481b13'], "categories": ["earthen"] },
    { "palette": ['d8c6f2', 'a08dcb', '7466b0', '352e63'], "categories": ["bold"] },
    { "palette": ['759e94', '77725b', '785634', '7a4017'], "categories": ["strange"] },
    { "palette": ['b4f6eb', '76c6cd', '3a7b9c', '1f4f7f'], "categories": ["bold"] },
    { "palette": ['d0c26d', 'aaaa6a', '738a66', '446c62'], "categories": ["strange"] },
    { "palette": ['b8efe6', '83a3ce', '6b60b3', '6e3789'], "categories": ["strange"] },
    { "palette": ['c498a3', '9f7688', '6e446c', '472147'], "categories": ["dark"] },
    { "palette": ['d17936', 'b35d33', '7b2806', '421c16'], "categories": ["foliar"] },
    { "palette": ['ecffdd', 'aed0c0', '718c93', '444e63'], "categories": ["earthen"] },
    { "palette": ['9c4547', '7f3d4a', '51314d', '3b2b4f'], "categories": ["earthen"] },
    { "palette": ['efeccc', 'd1cba6', '978d72', '6c6a6e'], "categories": ["earthen"] },
    { "palette": ['479ec2', '3b76aa', '1e3663', '1a0945'], "categories": ["bold"] },
    { "palette": ['f8a818', 'fe5f14', 'c91831', '730c4e'], "categories": ["strange"] },
    { "palette": ['eca3b2', 'b65d86', '72205f', '440843'], "categories": ["bold"] },
    { "palette": ['f0d9ee', 'e0c0e4', 'bd9ad5', '9379bd'], "categories": ["pastel"] },
    { "palette": ['d798f3', 'da6ace', 'ca3b97', 'a22152'], "categories": ["strange"] },
    { "palette": ['d4f1d7', 'c4e47b', 'e9db5d', 'ef924b'], "categories": ["strange"] },
    { "palette": ['ffe0b5', 'eea383', 'db5754', 'ca2e55'], "categories": ["foliar"] }];
//{"palette": ["ffffff", "ffffff", "ffffff", "ffffff"], "categories": ["blorpo"]}];
// foliar earthen soft bold strange deep
// metallic celestial verdant senescent
palettes_by_category = assemble_categories("all_palettes");
foliage_palettes_base_odds = assemble_base_odds(palettes_by_category, 2);
foliage_palettes_base_odds["foliar"] = 5;
foliage_palettes_base_odds["bold"] = 1;
feature_palettes_base_odds = assemble_base_odds(palettes_by_category, 2);
feature_palettes_base_odds["earthen"] = 5;
feature_palettes_base_odds["pastel"] = 3;
feature_palettes_base_odds["strange"] = 1;
accent_palettes_base_odds = assemble_base_odds(palettes_by_category, 2);
accent_palettes_base_odds["bold"] = 4;
accent_palettes_base_odds["strange"] = 3;
accent_palettes_base_odds["foliar"] = 1;
accent_palettes_base_odds["earthen"] = 1;
const foliage_palettes = assemble_choice_list_given_odds(palettes_by_category, foliage_palettes_base_odds);
const feature_palettes = assemble_choice_list_given_odds(palettes_by_category, feature_palettes_base_odds);
const accent_palettes = assemble_choice_list_given_odds(palettes_by_category, accent_palettes_base_odds);
async function place_image_at_coords_with_chance(img_url, list_of_coords, ctx, chance, anchor_to_bottom = false) {
    // In canvas context ctx, place image at img_path "centered" at each (x,y) in list_of_coords with chance odds (ex 0.66 for 66%)
    img = await refs[img_url];
    var w_offset = Math.floor(img.width / 2);
    if (!anchor_to_bottom) {
        var h_offset = Math.floor(img.height / 2) - 1;
    }
    else {
        var h_offset = -img.height + 1;
    }
    for (var i = 0; i < list_of_coords.length; i++) {
        if (Math.random() < chance) {
            [x, y] = list_of_coords[i];
            ctx.drawImage(img, x - w_offset, y + h_offset);
        }
    }
}
async function place_foliage(img_idx, ctx) {
    ctx.drawImage(refs["foliage" + img_idx.toString()], 0, 0);
}
async function preload_plants() {
    // TODO: Replace with spritesheet
    lists_to_load = [all_features];
    for (var i = 0; i < lists_to_load.length; i++) {
        for (var j = 0; j < lists_to_load[i].length; j++) {
            refs[lists_to_load[i][j]] = preload_single_image(lists_to_load[i][j]);
        }
    }
    await preload_spritesheet("foliage", FOLIAGE_SPRITESHEET, all_foliage.length);
}
async function preload_named() {
    await preload_spritesheet("named", NAMED_SPRITESHEET, Object.keys(reformatted_named).length);
}
// Sound of me not being 100% confident in my async usage yet
function preload_single_image(url) {
    return new Promise(resolve => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => { resolve(img); };
        img.onerror = function () { img.src = BAD_IMG_URL; };
        img.src = url;
    });
    // Not yet supported in common versions of Safari
    /*return fetch(url)
           .then(response => response.blob())
           .then(blob => createImageBitmap(blob));*/
}
async function preload_spritesheet(name, URL, count) {
    let img = await preload_single_image(URL);
    let canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    let ctx = canvas.getContext("2d");
    offset = 0;
    while (offset < count) {
        ctx.clearRect(0, 0, 32, 32);
        // All spritesheets are 10 wide, N tall
        source_offset_y = Math.floor(offset / 10) * 32;
        source_offset_x = (offset % 10) * 32;
        ctx.drawImage(img, source_offset_x, source_offset_y, 32, 32, 0, 0, 32, 32);
        let new_img = new Image;
        new_img.src = canvas.toDataURL();
        await new_img.decode();
        refs[name + offset.toString()] = new_img;
        offset++;
    }
}
function random_from_list(list, prng = null) {
    if (prng == null) {
        return list[Math.floor(Math.random() * list.length)];
    }
    ;
    return list[Math.floor(prng() * list.length)];
}
function random_from_foliage(list, prng = null) {
    let diceroll;
    if (prng == null) {
        diceroll = Math.random();
    }
    else {
        diceroll = prng();
    }
    return random_from_list(list, prng);
}
//Seeded prng. Taken from https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
function mulberry32(a) {
    return function () {
        var t = a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}
// Seed generator. Taken from https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
function xmur3(str) {
    for (var i = 0, h = 1779033703 ^ str.length; i < str.length; i++) {
        h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
        h = h << 13 | h >>> 19;
    }
    return function () {
        h = Math.imul(h ^ (h >>> 16), 2246822507);
        h = Math.imul(h ^ (h >>> 13), 3266489909);
        return (h ^= h >>> 16) >>> 0;
    };
}
function parse_plant_data(plant_data) {
    // Validate and, if any number is bad, give back Worst Plant
    if (plant_data["simple_feature"] >= all_features.length || plant_data["complex_feature"] >= all_features.length ||
        plant_data["foliage_palette"] >= all_palettes.length || plant_data["feature_palette"] >= all_palettes.length ||
        plant_data["accent_palette"] >= all_palettes.length) {
        return parse_plant_data(ERROR_PLANT);
    }
    return { "foliage": plant_data["foliage"],
        "simple_feature": all_features[plant_data["simple_feature"]],
        "complex_feature": all_features[plant_data["complex_feature"]],
        "foliage_palette": all_palettes[plant_data["foliage_palette"]]["palette"],
        "feature_palette": all_palettes[plant_data["feature_palette"]]["palette"],
        "accent_palette": all_palettes[plant_data["accent_palette"]]["palette"] };
}
function gen_plant_data(rarity, seed_string = null) {
    var prng;
    if (seed_string == null) {
        prng = null;
    }
    else {
        prng = mulberry32(xmur3(seed_string)());
    }
    return { "foliage": random_from_foliage(foliage_base_list, prng),
        "simple_feature": random_from_list(simple_features, prng),
        "complex_feature": random_from_list(complex_features, prng),
        "foliage_palette": random_from_list(foliage_palettes, prng),
        "feature_palette": random_from_list(feature_palettes, prng),
        "accent_palette": random_from_list(accent_palettes, prng) };
}
//seed format is 1<foliage><simple_feature><complex_feature>1<color><color><color><rngnum>
//random 1s are to avoid the encoding dropping the leading 0s
//foliage, feature, and the colors are all fixed-length 3 digits (ex: 100102310140060012147483647) for a max of 999 possibilities
//this number's way too big for Javascript without mantissa (Maxint is 9007199254740992 and we need highest precision and I don't know how Javascript does Things) so we break it like this:
// 1foliagesimplefeaturecomplexfeature-1colorcolorcolor-actualrandomnumberseed
// and then we put it in base64 for slightly-shorter-fixed-length purposes
function encode_plant_data(plant_data) {
    function to_padstr(entry) {
        return String(plant_data[entry]).padStart(3, '0');
    }
    var part_one = parseInt("1" + to_padstr("foliage") + to_padstr("simple_feature") + to_padstr("complex_feature"));
    var part_two = parseInt("1" + to_padstr("foliage_palette") + to_padstr("feature_palette") + to_padstr("accent_palette"));
    return Base64.fromInt(part_one) + Base64.fromInt(part_two);
}
function encode_plant_data_v2(plant_data) {
    function to_padstr(entry) {
        return String(plant_data[entry]).padStart(3, '0');
    }
    function to_lesser_padstr(entry) {
        return String(plant_data[entry]).padStart(2, '0');
    }
    var part_one = parseInt("2" + to_padstr("foliage") + to_padstr("foliage_palette") + to_lesser_padstr("simple_feature"));
    var part_two = parseInt("2" + to_padstr("feature_palette") + to_padstr("accent_palette") + to_lesser_padstr("complex_feature"));
    return Base64.fromInt(part_one) + Base64.fromInt(part_two);
}
function decode_plant_data(plant_data) {
    // Conversion city baybeee
    // Might be able to do something clever with mods instead, but we'll check performance first
    var part_one = String(Base64.toInt(plant_data.slice(0, 5)));
    var part_two = String(Base64.toInt(plant_data.slice(5)));
    // alert("Part one"+part_one+" Part two: "+part_two);
    if (parseInt(part_one.slice(0, 1)) == 2) {
        return { "foliage": parseInt(part_one.slice(1, 4)),
            "foliage_palette": parseInt(part_one.slice(4, 7)),
            "simple_feature": parseInt(part_one.slice(7, 9)),
            "feature_palette": parseInt(part_two.slice(1, 4)),
            "accent_palette": parseInt(part_two.slice(4, 7)),
            "complex_feature": parseInt(part_two.slice(7, 9))
        };
    }
    else {
        return { "foliage": parseInt(part_one.slice(1, 4)),
            "simple_feature": parseInt(part_one.slice(4, 7)),
            "complex_feature": parseInt(part_one.slice(7, 10)),
            "foliage_palette": parseInt(part_two.slice(1, 4)),
            "feature_palette": parseInt(part_two.slice(4, 7)),
            "accent_palette": parseInt(part_two.slice(7, 10)) };
    }
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
        fromInt: function (int32) {
            var result = '';
            while (true) {
                result = digits[int32 & 0x3f] + result;
                int32 >>>= 6;
                if (int32 === 0)
                    break;
            }
            return result;
        },
        toInt: function (digitsStr) {
            var result = 0;
            var digits = digitsStr.split('');
            for (var i = 0; i < digits.length; i++) {
                result = (result << 6) + digitsMap[digits[i]];
            }
            return result;
        }
    };
})();
async function gen_plant(plant_data, with_color_key = false) {
    // Returns the image data for a generated plant
    var work_canvas = document.createElement("canvas");
    var work_ctx = work_canvas.getContext("2d");
    plant_data = parse_plant_data(plant_data);
    work_canvas.width = work_canvas_size;
    work_canvas.height = work_canvas_size;
    if (with_color_key) {
        await place_foliage(160, work_ctx); // Place I AM ERROR, actually the palette display sprite
    }
    await place_foliage(plant_data["foliage"], work_ctx);
    // Figure out where to put each kind of feature, replacing marker pixels as we go
    let simple_feature_coords = get_marker_coords(place_simple_feature, work_ctx);
    let complex_feature_coords = get_marker_coords(place_complex_feature, work_ctx);
    // Place the features
    if (simple_feature_coords.length > 0) {
        var place_simple = await place_image_at_coords_with_chance(plant_data["simple_feature"], simple_feature_coords, work_ctx, 0.5);
    }
    if (complex_feature_coords.length > 0) {
        /* Chance that if there's already simple flowers, we keep using that flower
        if(simple_flower_coords.length == 0 || Math.random()>0.5){
            flower_url = complex_flowers[Math.floor(Math.random()*complex_flowers.length)];
        } else {*/
        var place_complex = await place_image_at_coords_with_chance(plant_data["complex_feature"], complex_feature_coords, work_ctx, 0.8, true);
    }
    // We do all the recolors at once because Speed?(TM)?
    var new_overall_palette = plant_data["foliage_palette"].concat(plant_data["accent_palette"]).concat(plant_data["feature_palette"]);
    replace_color_palette(overall_palette, new_overall_palette, work_ctx);
    // We can draw a canvas directly on another canvas
    return work_canvas;
}
async function gen_named(name) {
    let work_canvas = document.createElement("canvas");
    let work_ctx = work_canvas.getContext("2d");
    work_canvas.width = work_canvas_size;
    work_canvas.height = work_canvas_size;
    place_image_at_coords_with_chance("named" + reformatted_named[name]["offset"], [[Math.floor(work_canvas_size / 2), work_canvas_size - 1]], work_ctx, 1, true);
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
function replace_color(old_rgb, new_rgb, ctx, width = work_canvas_size, height = work_canvas_size) {
    // `old_rgb` and `new_rgb`: (r, g, b)
    // taken from https://stackoverflow.com/questions/16228048/replace-a-specific-color-by-another-in-an-image-sprite
    var imageData = ctx.getImageData(0, 0, width, height);
    var oldRed, oldGreen, oldBlue;
    var newRed, newGreen, newBlue;
    [oldRed, oldGreen, oldBlue] = old_rgb;
    [newRed, newGreen, newBlue] = new_rgb;
    for (var i = 0; i < imageData.data.length; i += 4) {
        // is this pixel the old rgb?
        if (imageData.data[i] == oldRed &&
            imageData.data[i + 1] == oldGreen &&
            imageData.data[i + 2] == oldBlue) {
            // change to your new rgb
            imageData.data[i] = newRed;
            imageData.data[i + 1] = newGreen;
            imageData.data[i + 2] = newBlue;
        }
    }
    // put the data back on the canvas
    ctx.putImageData(imageData, 0, 0);
}
// Basically just wraps replace_color_palette
function replace_color_palette_single_image(old_palette, new_palette, img) {
    var work_canvas = document.createElement("canvas");
    var work_ctx = work_canvas.getContext("2d");
    work_canvas.width = img.width;
    work_canvas.height = img.height;
    work_ctx.drawImage(img, 0, 0);
    replace_color_palette(old_palette, new_palette, work_ctx, img.width, img.height);
    return work_canvas;
}
// Palettes MUST be the same length, FYI
function replace_color_palette(old_palette, new_palette, ctx, work_canvas_width = work_canvas_size, work_canvas_height = work_canvas_size) {
    var oldRGB, newRGB;
    // We do some truly hideous hacks because I'm bad at Javascript :)
    // Basically, we use the r, g, and b as a 3-level key into an object
    // If we follow it to the bottom and something exists, it's something we replace
    var paletteSwap = {};
    for (var i = 0; i < old_palette.length; i++) {
        oldRGB = hexToRgb(old_palette[i]);
        // (cries in defaultdict)
        // but seriously there might be a better way. As is, this stuff's prolly power word kill for JS devs...
        if (paletteSwap[oldRGB[0]] == undefined) {
            paletteSwap[oldRGB[0]] = {};
        }
        if (paletteSwap[oldRGB[0]][oldRGB[1]] == undefined) {
            paletteSwap[oldRGB[0]][oldRGB[1]] = {};
        }
        paletteSwap[oldRGB[0]][oldRGB[1]][oldRGB[2]] = hexToRgb(new_palette[i]);
    }
    // taken from https://stackoverflow.com/questions/16228048/replace-a-specific-color-by-another-in-an-image-sprite
    var imageData;
    imageData = ctx.getImageData(0, 0, work_canvas_width, work_canvas_height);
    for (var i = 0; i < imageData.data.length; i += 4) {
        // god this is painful to look at. I'm sorry.
        if (paletteSwap[imageData.data[i]] != undefined &&
            paletteSwap[imageData.data[i]][imageData.data[i + 1]] != undefined &&
            paletteSwap[imageData.data[i]][imageData.data[i + 1]][imageData.data[i + 2]] != undefined) {
            newRGB = paletteSwap[imageData.data[i]][imageData.data[i + 1]][imageData.data[i + 2]];
            imageData.data[i] = newRGB[0];
            imageData.data[i + 1] = newRGB[1];
            imageData.data[i + 2] = newRGB[2];
        }
    }
    // put the data back on the canvas
    ctx.putImageData(imageData, 0, 0);
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
    for (var i = 0; i < imageData.data.length; i += 4) {
        // is this pixel the old rgb?
        if (imageData.data[i] == oldRed &&
            imageData.data[i + 1] == oldGreen &&
            imageData.data[i + 2] == oldBlue) {
            // change to your new rgb
            imageData.data[i] = newRed;
            imageData.data[i + 1] = newGreen;
            imageData.data[i + 2] = newBlue;
            // Ready to get a little cursed? Because there's probably a better way to do this, but it's a dumb project so...
            pixel = i / 4;
            ret_coords.push([pixel % work_canvas_size, Math.floor(pixel / work_canvas_size)]);
        }
    }
    ctx.putImageData(imageData, 0, 0);
    return ret_coords;
}
// Same shuffle as bingo.js. TODO: I should add a baselib
function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}
