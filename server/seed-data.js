// Seed vocabulary for all lessons.
//
// IMPORTANT: This vocabulary was drafted by an AI assistant without native
// fluency in Tigrinya, then cross-checked word-by-word against multiple
// online Tigrinya dictionaries/phrasebooks (omniglot.com, wikivoyage,
// tigrinyadictionary.com, polyglotclub, learnentry.com, glosbe.com, and
// others) to catch outright errors — several were found and fixed this way
// (e.g. the original "good morning" and "grandfather" entries were wrong).
// That process still isn't the same as native-speaker review: sources
// sometimes disagreed (e.g. "nice to meet you" had three different
// phrasings across sources), and transliteration spelling varies by source.
//
// The Colors/Days/Food/Places/Adjectives lessons (added in a second research
// pass) have one extra known risk: their example sentences all reuse the
// same simple copula pattern ("እዚ ... እዩ" / "This is ...") with the
// masculine "እዩ" form, since Tigrinya nouns carry grammatical gender that
// determines "እዩ" vs "እያ" and this wasn't verified per word — some of these
// example sentences likely have the wrong gender agreement even though the
// vocabulary word itself was individually verified.
//
// `example_translit` (the Latin-alphabet transliteration of each example
// sentence) was added by an AI assistant in a later pass, built by
// transliterating word-by-word from the existing per-word `transliteration`
// values. It carries the same fluency caveat as everything else here and
// should be reviewed alongside the rest.
//
// Please review every row before trusting it for teaching. Edit the arrays
// below — each lesson's `words` list maps directly to rows in the `words`
// table, and the app reseeds automatically the next time the database is
// empty.

const lessons = [
  {
    title_en: "Greetings",
    title_ti: "ሰላምታ",
    sort_order: 1,
    words: [
      { english: "hello", tigrinya: "ሰላም", transliteration: "selam", example_en: "Hello, how are you?", example_ti: "ሰላም, ከመይ ኣለኻ?", example_translit: "selam, kemey aleka?" },
      { english: "good morning", tigrinya: "ከመይ ሓዲርኩም", transliteration: "kemey hadirkum", example_en: "Good morning!", example_ti: "ከመይ ሓዲርኩም!", example_translit: "kemey hadirkum!" },
      { english: "goodbye", tigrinya: "ደሓን ኹን", transliteration: "dehan kun", example_en: "Goodbye, see you tomorrow.", example_ti: "ደሓን ኹን, ጽባሕ ንራኸብ።", example_translit: "dehan kun, tsbah nrakeb." },
      { english: "thank you", tigrinya: "የቐንየለይ", transliteration: "yeqeneyeley", example_en: "Thank you very much.", example_ti: "ብጣዕሚ የቐንየለይ።", example_translit: "bta'emi yeqeneyeley." },
      { english: "please", tigrinya: "በጃኻ", transliteration: "bejaka", example_en: "Please, come in.", example_ti: "በጃኻ, እቶ።", example_translit: "bejaka, eto." },
      { english: "yes", tigrinya: "እወ", transliteration: "ewe", example_en: "Yes, I understand.", example_ti: "እወ, ተረዲኡኒ።", example_translit: "ewe, teredi'uni." },
      { english: "no", tigrinya: "ኣይፋልን", transliteration: "ayfalen", example_en: "No, thank you.", example_ti: "ኣይፋልን, የቐንየለይ።", example_translit: "ayfalen, yeqeneyeley." },
      { english: "how are you?", tigrinya: "ከመይ ኣለኻ?", transliteration: "kemey aleka?", example_en: "Hi, how are you?", example_ti: "ሰላም, ከመይ ኣለኻ?", example_translit: "selam, kemey aleka?" },
      { english: "I am fine", tigrinya: "ጽቡቕ ኣለኹ", transliteration: "tsbuq aleku", example_en: "I am fine, thank you.", example_ti: "ጽቡቕ ኣለኹ, የቐንየለይ።", example_translit: "tsbuq aleku, yeqeneyeley." },
      { english: "welcome", tigrinya: "እንኳዕ ደሓን መጻእካ", transliteration: "enkwa'e dehan metsaeka", example_en: "Welcome to our home.", example_ti: "እንኳዕ ደሓን መጻእካ ናብ ገዛና።", example_translit: "enkwa'e dehan metsaeka nab gezana." },
      { english: "my name is...", tigrinya: "ስመይ ... እዩ", transliteration: "semey ... eyu", example_en: "My name is Akber.", example_ti: "ስመይ ኣክበር እዩ።", example_translit: "semey Akber eyu." },
      { english: "nice to meet you", tigrinya: "ብምርኻብካ ተሓጒሰ", transliteration: "bemrkabka tehagwuse", example_en: "Nice to meet you.", example_ti: "ብምርኻብካ ተሓጒሰ።", example_translit: "bemrkabka tehagwuse." },
    ],
  },
  {
    title_en: "Numbers",
    title_ti: "ቁጽርታት",
    sort_order: 2,
    ordered: true,
    words: [
      { english: "one", tigrinya: "ሓደ", transliteration: "hade", example_en: "I have one book.", example_ti: "ሓደ መጽሓፍ ኣለኒ።", example_translit: "hade metshaf aleni." },
      { english: "two", tigrinya: "ክልተ", transliteration: "kelte", example_en: "Two cups of coffee.", example_ti: "ክልተ ብርጭቆ ቡን።", example_translit: "kelte brchqo bun." },
      { english: "three", tigrinya: "ሰለስተ", transliteration: "seleste", example_en: "Three children.", example_ti: "ሰለስተ ቆልዑ።", example_translit: "seleste qol'u." },
      { english: "four", tigrinya: "ኣርባዕተ", transliteration: "arba'ete", example_en: "Four chairs.", example_ti: "ኣርባዕተ ኮፍ መበሊ።", example_translit: "arba'ete kof mebeli." },
      { english: "five", tigrinya: "ሓሙሽተ", transliteration: "hamushte", example_en: "Five minutes.", example_ti: "ሓሙሽተ ደቓይቕ።", example_translit: "hamushte deqayq." },
      { english: "six", tigrinya: "ሽዱሽተ", transliteration: "shudushte", example_en: "Six days.", example_ti: "ሽዱሽተ መዓልቲ።", example_translit: "shudushte me'alti." },
      { english: "seven", tigrinya: "ሸውዓተ", transliteration: "shew'ate", example_en: "Seven days in a week.", example_ti: "ሸውዓተ መዓልቲ ኣብ ሰሙን።", example_translit: "shew'ate me'alti ab semun." },
      { english: "eight", tigrinya: "ሸሞንተ", transliteration: "shemonte", example_en: "Eight hours.", example_ti: "ሸሞንተ ሰዓታት።", example_translit: "shemonte se'atat." },
      { english: "nine", tigrinya: "ትሽዓተ", transliteration: "tish'ate", example_en: "Nine months.", example_ti: "ትሽዓተ ኣዋርሕ።", example_translit: "tish'ate awarh." },
      { english: "ten", tigrinya: "ዓሰርተ", transliteration: "aserte", example_en: "Ten fingers.", example_ti: "ዓሰርተ ኣጻብዕ።", example_translit: "aserte atsab'e." },
      { english: "zero", tigrinya: "ባዶ", transliteration: "bado", example_en: "The score is zero.", example_ti: "ውጽኢት ባዶ እዩ።", example_translit: "wuts'it bado eyu." },
      { english: "how many?", tigrinya: "ክንደይ?", transliteration: "kndey?", example_en: "How many books do you have?", example_ti: "ክንደይ መጽሓፍቲ ኣለካ?", example_translit: "kndey metshafti aleka?" },
    ],
  },
  {
    title_en: "Family",
    title_ti: "ስድራቤት",
    sort_order: 3,
    words: [
      { english: "mother", tigrinya: "ኣደ", transliteration: "ade", example_en: "My mother is kind.", example_ti: "ኣደይ ሕያዋይ እያ።", example_translit: "adey hyaway eya." },
      { english: "father", tigrinya: "ኣቦ", transliteration: "abo", example_en: "My father works hard.", example_ti: "ኣቦይ ብትግሃት ይሰርሕ።", example_translit: "aboy btghat yiserh." },
      { english: "brother", tigrinya: "ሓው", transliteration: "hawi", example_en: "This is my brother.", example_ti: "እዚ ሓወይ እዩ።", example_translit: "ezi hawey eyu." },
      { english: "sister", tigrinya: "ሓፍቲ", transliteration: "hafti", example_en: "My sister is a teacher.", example_ti: "ሓፍተይ መምህር እያ።", example_translit: "haftey memhr eya." },
      { english: "son", tigrinya: "ወዲ", transliteration: "wedi", example_en: "Their son is five years old.", example_ti: "ወዶም ሓሙሽተ ዓመት እዩ።", example_translit: "wedom hamushte amet eyu." },
      { english: "daughter", tigrinya: "ጓል", transliteration: "gual", example_en: "Their daughter loves music.", example_ti: "ጓሎም ሙዚቃ ተፍቅር።", example_translit: "gualom muziqa tefqr." },
      { english: "family", tigrinya: "ስድራቤት", transliteration: "sidra-bet", example_en: "I love my family.", example_ti: "ንስድራቤተይ ይፈትዎም እየ።", example_translit: "nsdrabetey yfetwom eye." },
      { english: "grandmother", tigrinya: "ዓባይ", transliteration: "abay", example_en: "My grandmother tells great stories.", example_ti: "ዓባየይ ጽቡቕ ዛንታታት ትነግር።", example_translit: "abayey tsbuq zantatat tneger." },
      { english: "grandfather", tigrinya: "ኣቦሓጎ", transliteration: "abo-hago", example_en: "My grandfather is very wise.", example_ti: "ኣቦሓጎይ ብጣዕሚ ጠቢብ እዩ።", example_translit: "abohagoy bta'emi tebib eyu." },
      { english: "child", tigrinya: "ቆልዓ", transliteration: "qol'a", example_en: "The child is playing.", example_ti: "እቲ ቆልዓ ይጻወት ኣሎ።", example_translit: "eti qol'a yitsawet alo." },
      { english: "friend", tigrinya: "ዓርኪ", transliteration: "arki", example_en: "He is my best friend.", example_ti: "ንሱ ዝበለጸ ዓርከይ እዩ።", example_translit: "nsu zbeletse arkey eyu." },
      { english: "husband", tigrinya: "ሰብኣይ", transliteration: "sebay", example_en: "Her husband is a doctor.", example_ti: "ሰብኣያ ሓኪም እዩ።", example_translit: "seb'aya hakim eyu." },
    ],
  },
  {
    title_en: "Colors",
    title_ti: "ሕብርታት",
    sort_order: 4,
    words: [
      { english: "red", tigrinya: "ቀይሕ", transliteration: "qeyih", example_en: "This is red.", example_ti: "እዚ ቀይሕ እዩ።", example_translit: "ezi qeyih eyu." },
      { english: "blue", tigrinya: "ሰማያዊ", transliteration: "semayawi", example_en: "This is blue.", example_ti: "እዚ ሰማያዊ እዩ።", example_translit: "ezi semayawi eyu." },
      { english: "green", tigrinya: "ቀጠልያ", transliteration: "qetelya", example_en: "This is green.", example_ti: "እዚ ቀጠልያ እዩ።", example_translit: "ezi qetelya eyu." },
      { english: "yellow", tigrinya: "ብጫ", transliteration: "bicha", example_en: "This is yellow.", example_ti: "እዚ ብጫ እዩ።", example_translit: "ezi bicha eyu." },
      { english: "black", tigrinya: "ጸሊም", transliteration: "tselim", example_en: "This is black.", example_ti: "እዚ ጸሊም እዩ።", example_translit: "ezi tselim eyu." },
      { english: "white", tigrinya: "ጻዕዳ", transliteration: "tsa'ida", example_en: "This is white.", example_ti: "እዚ ጻዕዳ እዩ።", example_translit: "ezi tsa'ida eyu." },
      { english: "orange", tigrinya: "ኣራንሾኒ", transliteration: "aranshoni", example_en: "This is orange.", example_ti: "እዚ ኣራንሾኒ እዩ።", example_translit: "ezi aranshoni eyu." },
      { english: "purple", tigrinya: "ሊላ", transliteration: "lila", example_en: "This is purple.", example_ti: "እዚ ሊላ እዩ።", example_translit: "ezi lila eyu." },
      { english: "pink", tigrinya: "ሮዛ", transliteration: "roza", example_en: "This is pink.", example_ti: "እዚ ሮዛ እዩ።", example_translit: "ezi roza eyu." },
      { english: "brown", tigrinya: "ቡናዊ", transliteration: "bunawi", example_en: "This is brown.", example_ti: "እዚ ቡናዊ እዩ።", example_translit: "ezi bunawi eyu." },
      { english: "gray", tigrinya: "ሓሙኹሽታይ", transliteration: "hamukushtay", example_en: "This is gray.", example_ti: "እዚ ሓሙኹሽታይ እዩ።", example_translit: "ezi hamukushtay eyu." },
    ],
  },
  {
    title_en: "Days of the Week",
    title_ti: "መዓልትታት ሰሙን",
    sort_order: 5,
    ordered: true,
    words: [
      { english: "Monday", tigrinya: "ሰኑይ", transliteration: "senuy", example_en: "Today is Monday.", example_ti: "ሎሚ ሰኑይ እዩ።", example_translit: "lomi senuy eyu." },
      { english: "Tuesday", tigrinya: "ሰሉስ", transliteration: "selus", example_en: "Today is Tuesday.", example_ti: "ሎሚ ሰሉስ እዩ።", example_translit: "lomi selus eyu." },
      { english: "Wednesday", tigrinya: "ረቡዕ", transliteration: "rebu'a", example_en: "Today is Wednesday.", example_ti: "ሎሚ ረቡዕ እዩ።", example_translit: "lomi rebu'a eyu." },
      { english: "Thursday", tigrinya: "ሓሙስ", transliteration: "hamus", example_en: "Today is Thursday.", example_ti: "ሎሚ ሓሙስ እዩ።", example_translit: "lomi hamus eyu." },
      { english: "Friday", tigrinya: "ዓርቢ", transliteration: "arbi", example_en: "Today is Friday.", example_ti: "ሎሚ ዓርቢ እዩ።", example_translit: "lomi arbi eyu." },
      { english: "Saturday", tigrinya: "ቀዳም", transliteration: "kedam", example_en: "Today is Saturday.", example_ti: "ሎሚ ቀዳም እዩ።", example_translit: "lomi kedam eyu." },
      { english: "Sunday", tigrinya: "ሰንበት", transliteration: "senbet", example_en: "Today is Sunday.", example_ti: "ሎሚ ሰንበት እዩ።", example_translit: "lomi senbet eyu." },
    ],
  },
  {
    title_en: "Food & Drink",
    title_ti: "ምግቢ",
    sort_order: 6,
    words: [
      { english: "bread", tigrinya: "ባኒ", transliteration: "bani", example_en: "I have bread.", example_ti: "ባኒ ኣለኒ።", example_translit: "bani aleni." },
      { english: "rice", tigrinya: "ሩዝ", transliteration: "ruz", example_en: "I have rice.", example_ti: "ሩዝ ኣለኒ።", example_translit: "ruz aleni." },
      { english: "water", tigrinya: "ማይ", transliteration: "mai", example_en: "I have water.", example_ti: "ማይ ኣለኒ።", example_translit: "mai aleni." },
      { english: "coffee", tigrinya: "ቡን", transliteration: "bun", example_en: "I have coffee.", example_ti: "ቡን ኣለኒ።", example_translit: "bun aleni." },
      { english: "milk", tigrinya: "ጸባ", transliteration: "tseba", example_en: "I have milk.", example_ti: "ጸባ ኣለኒ።", example_translit: "tseba aleni." },
      { english: "meat", tigrinya: "ስጋ", transliteration: "siga", example_en: "I have meat.", example_ti: "ስጋ ኣለኒ።", example_translit: "siga aleni." },
      { english: "tea", tigrinya: "ሻሂ", transliteration: "shahi", example_en: "I have tea.", example_ti: "ሻሂ ኣለኒ።", example_translit: "shahi aleni." },
      { english: "vegetable", tigrinya: "ኣሕምልቲ", transliteration: "ahmelti", example_en: "I have vegetables.", example_ti: "ኣሕምልቲ ኣለኒ።", example_translit: "ahmelti aleni." },
      { english: "egg", tigrinya: "እንቋቑሖ", transliteration: "enqaqiho", example_en: "I have eggs.", example_ti: "እንቋቑሖ ኣለኒ።", example_translit: "enqaqiho aleni." },
      { english: "fruit", tigrinya: "ፍረ", transliteration: "fre", example_en: "I have fruit.", example_ti: "ፍረ ኣለኒ።", example_translit: "fre aleni." },
      { english: "salt", tigrinya: "ጨው", transliteration: "chew", example_en: "I have salt.", example_ti: "ጨው ኣለኒ።", example_translit: "chew aleni." },
      { english: "sugar", tigrinya: "ሽኮር", transliteration: "shikor", example_en: "I have sugar.", example_ti: "ሽኮር ኣለኒ።", example_translit: "shikor aleni." },
    ],
  },
  {
    title_en: "Places",
    title_ti: "ቦታታት",
    sort_order: 7,
    words: [
      { english: "house", tigrinya: "ገዛ", transliteration: "geza", example_en: "This is my house.", example_ti: "እዚ ገዛይ እዩ።", example_translit: "ezi gezay eyu." },
      { english: "school", tigrinya: "ቤት ትምህርቲ", transliteration: "bet timhrti", example_en: "This is a school.", example_ti: "እዚ ቤት ትምህርቲ እዩ።", example_translit: "ezi bet timhrti eyu." },
      { english: "hospital", tigrinya: "ቤትሕክምና", transliteration: "bet hikmna", example_en: "This is a hospital.", example_ti: "እዚ ቤትሕክምና እዩ።", example_translit: "ezi bet hikmna eyu." },
      { english: "market", tigrinya: "ዕዳጋ", transliteration: "edaga", example_en: "This is a market.", example_ti: "እዚ ዕዳጋ እዩ።", example_translit: "ezi edaga eyu." },
      { english: "city", tigrinya: "ከተማ", transliteration: "ketema", example_en: "This is a city.", example_ti: "እዚ ከተማ እዩ።", example_translit: "ezi ketema eyu." },
      { english: "shop", tigrinya: "ድኳን", transliteration: "dikwan", example_en: "This is a shop.", example_ti: "እዚ ድኳን እዩ።", example_translit: "ezi dikwan eyu." },
      { english: "road", tigrinya: "መንገዲ", transliteration: "mengedi", example_en: "This is a road.", example_ti: "እዚ መንገዲ እዩ።", example_translit: "ezi mengedi eyu." },
      { english: "church", tigrinya: "ቤተ ክርስቲያን", transliteration: "bete kristiyan", example_en: "This is a church.", example_ti: "እዚ ቤተ ክርስቲያን እዩ።", example_translit: "ezi bete kristiyan eyu." },
      { english: "bathroom", tigrinya: "ሽንቲ ቤት", transliteration: "shnti bet", example_en: "This is a bathroom.", example_ti: "እዚ ሽንቲ ቤት እዩ።", example_translit: "ezi shnti bet eyu." },
    ],
  },
  {
    title_en: "Adjectives",
    title_ti: "ቅጽላት",
    sort_order: 8,
    words: [
      { english: "big", tigrinya: "ገዚፍ", transliteration: "gezif", example_en: "This is big.", example_ti: "እዚ ገዚፍ እዩ።", example_translit: "ezi gezif eyu." },
      { english: "small", tigrinya: "ንእሽቶ", transliteration: "n'eshto", example_en: "This is small.", example_ti: "እዚ ንእሽቶ እዩ።", example_translit: "ezi n'eshto eyu." },
      { english: "hot", tigrinya: "ውዑይ", transliteration: "wuy", example_en: "This is hot.", example_ti: "እዚ ውዑይ እዩ።", example_translit: "ezi wuy eyu." },
      { english: "cold", tigrinya: "ዝሑል", transliteration: "zhul", example_en: "This is cold.", example_ti: "እዚ ዝሑል እዩ።", example_translit: "ezi zhul eyu." },
      { english: "good", tigrinya: "ጽቡቕ", transliteration: "tsbuq", example_en: "This is good.", example_ti: "እዚ ጽቡቕ እዩ።", example_translit: "ezi tsbuq eyu." },
      { english: "bad", tigrinya: "ሕማቕ", transliteration: "hmaq", example_en: "This is bad.", example_ti: "እዚ ሕማቕ እዩ።", example_translit: "ezi hmaq eyu." },
      { english: "new", tigrinya: "ሓዲሽ", transliteration: "hadish", example_en: "This is new.", example_ti: "እዚ ሓዲሽ እዩ።", example_translit: "ezi hadish eyu." },
      { english: "old", tigrinya: "ኣረጊት", transliteration: "aregit", example_en: "This is old.", example_ti: "እዚ ኣረጊት እዩ።", example_translit: "ezi aregit eyu." },
      { english: "happy", tigrinya: "ሕጉስ", transliteration: "hgus", example_en: "He is happy.", example_ti: "ንሱ ሕጉስ እዩ።", example_translit: "nsu hgus eyu." },
    ],
  },
];

module.exports = { lessons };
