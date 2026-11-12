// Contenu des cours de Gidro — tout est embarqué, aucune connexion requise.
// Format d'une leçon :
//   words     : [motCible, traduction(s) séparées par « | », emoji]
//   sentences : [phraseCible, traduction(s) séparées par « | », note facultative]
//   tip       : { title, body } — explication grammaticale (en langue source)
// Les niveaux : 'beginner' | 'intermediate' | 'advanced'

export const COURSES = [
  // ───────────────────────────── ANGLAIS (depuis le français) ─────────────────────────────
  {
    id: 'en-fr', target: 'en', from: 'fr', flag: '🇬🇧', tts: 'en-US',
    name: { fr: 'Anglais', mg: 'Anglisy' },
    units: [
      {
        id: 'en-u1', level: 'beginner', color: '#58cc02', title: 'Premiers pas',
        lessons: [
          {
            id: 'en-1', icon: '👋', title: 'Salutations',
            tip: { title: 'Dire bonjour', body: '« Hello » sert à tout moment de la journée. « Please » traduit à la fois « s\'il te plaît » et « s\'il vous plaît » : l\'anglais ne fait pas la différence entre tu et vous — tout le monde se dit « you ».' },
            words: [['hello', 'bonjour|salut', '👋'], ['goodbye', 'au revoir', '🚶'], ['thank you', 'merci', '🙏'], ['please', 's\'il te plaît|s\'il vous plaît', '🥺'], ['yes', 'oui', '✅'], ['no', 'non', '❌']],
            sentences: [
              ['Hello, my name is Anna.', 'Bonjour, je m\'appelle Anna.|Salut, je m\'appelle Anna.|Bonjour, mon nom est Anna.', 'Littéralement « mon nom est Anna ».'],
              ['Thank you very much.', 'Merci beaucoup.'],
              ['Goodbye, see you tomorrow.', 'Au revoir, à demain.'],
              ['Yes, please.', 'Oui, s\'il te plaît.|Oui, s\'il vous plaît.|Oui, merci.'],
              ['No, thank you.', 'Non, merci.'],
            ],
          },
          {
            id: 'en-2', icon: '👨‍👩‍👧', title: 'La famille',
            tip: { title: 'My = mon, ma, mes', body: 'En anglais, le possessif ne change jamais : « my mother », « my father », « my parents ». Pas de masculin, féminin ni pluriel à retenir !' },
            words: [['mother', 'mère|maman', '👩'], ['father', 'père|papa', '👨'], ['sister', 'sœur', '👧'], ['brother', 'frère', '👦'], ['baby', 'bébé', '👶'], ['family', 'famille', '👪']],
            sentences: [
              ['This is my mother.', 'C\'est ma mère.|Voici ma mère.'],
              ['I have a brother.', 'J\'ai un frère.'],
              ['My father is tall.', 'Mon père est grand.'],
              ['We are a family.', 'Nous sommes une famille.|On est une famille.'],
              ['The baby is sleeping.', 'Le bébé dort.|Le bébé est en train de dormir.'],
            ],
          },
          {
            id: 'en-3', icon: '🍎', title: 'La nourriture',
            tip: { title: 'A ou an ?', body: 'On utilise « a » devant un son de consonne (a banana) et « an » devant un son de voyelle (an apple, an egg). Le français « du / de la » (partitif) disparaît souvent : « I drink water » = « je bois de l\'eau ».' },
            words: [['apple', 'pomme', '🍎'], ['bread', 'pain', '🍞'], ['water', 'eau', '💧'], ['milk', 'lait', '🥛'], ['rice', 'riz', '🍚'], ['fish', 'poisson', '🐟']],
            sentences: [
              ['I eat an apple.', 'Je mange une pomme.'],
              ['She drinks water.', 'Elle boit de l\'eau.'],
              ['We eat rice and fish.', 'Nous mangeons du riz et du poisson.|On mange du riz et du poisson.'],
              ['The bread is good.', 'Le pain est bon.'],
              ['I like milk.', 'J\'aime le lait.'],
            ],
          },
          {
            id: 'en-4', icon: '🧍', title: 'Le verbe être',
            tip: { title: 'To be — être', body: 'I am · you are · he/she/it is · we are · you are · they are.\nÀ l\'oral on contracte : I\'m, you\'re, he\'s, we\'re, they\'re.\nAttention : pour l\'âge, l\'anglais utilise « être » : « I am ten » = « j\'ai dix ans ».' },
            words: [['I am', 'je suis', '🙋'], ['you are', 'tu es|vous êtes', '👉'], ['he is', 'il est', '👨'], ['she is', 'elle est', '👩'], ['we are', 'nous sommes', '👫'], ['they are', 'ils sont|elles sont', '👥']],
            sentences: [
              ['I am happy.', 'Je suis heureux.|Je suis heureuse.|Je suis content.|Je suis contente.'],
              ['You are my friend.', 'Tu es mon ami.|Tu es mon amie.|Vous êtes mon ami.|Vous êtes mon amie.'],
              ['She is a teacher.', 'Elle est professeure.|Elle est professeur.|Elle est enseignante.|Elle est institutrice.', 'Devant un métier, l\'anglais garde l\'article « a ».'],
              ['We are at home.', 'Nous sommes à la maison.|On est à la maison.'],
              ['They are students.', 'Ils sont étudiants.|Elles sont étudiantes.|Ce sont des étudiants.'],
            ],
          },
        ],
      },
      {
        id: 'en-u2', level: 'beginner', color: '#1cb0f6', title: 'Le quotidien',
        lessons: [
          {
            id: 'en-5', icon: '🎨', title: 'Les couleurs',
            tip: { title: 'L\'adjectif se place avant le nom', body: 'On dit « a red car » (une voiture rouge). L\'adjectif anglais est invariable : « red cars » — jamais de « s » sur la couleur.' },
            words: [['red', 'rouge', '🔴'], ['blue', 'bleu', '🔵'], ['green', 'vert', '🟢'], ['yellow', 'jaune', '🟡'], ['black', 'noir', '⚫'], ['white', 'blanc', '⚪']],
            sentences: [
              ['The car is red.', 'La voiture est rouge.'],
              ['The sky is blue.', 'Le ciel est bleu.'],
              ['I like the green shirt.', 'J\'aime la chemise verte.'],
              ['My cat is black and white.', 'Mon chat est noir et blanc.'],
            ],
          },
          {
            id: 'en-6', icon: '🐾', title: 'Les animaux',
            tip: { title: 'Le pluriel en -s', body: 'Pour la plupart des noms, on ajoute -s : dog → dogs, cat → cats. Quelques exceptions courantes : fish → fish, child → children, mouse → mice.' },
            words: [['dog', 'chien', '🐶'], ['cat', 'chat', '🐱'], ['bird', 'oiseau', '🐦'], ['horse', 'cheval', '🐴'], ['cow', 'vache', '🐮'], ['chicken', 'poulet|poule', '🐔']],
            sentences: [
              ['The dog is big.', 'Le chien est grand.|Le chien est gros.'],
              ['I have a cat.', 'J\'ai un chat.'],
              ['The bird sings.', 'L\'oiseau chante.'],
              ['The cows eat grass.', 'Les vaches mangent de l\'herbe.'],
            ],
          },
          {
            id: 'en-7', icon: '🔢', title: 'Les nombres',
            tip: { title: 'Dire son âge', body: '« How old are you? » — « I am ten (years old). » On utilise le verbe être (to be) et non avoir.' },
            words: [['one', 'un|une', '1️⃣'], ['two', 'deux', '2️⃣'], ['three', 'trois', '3️⃣'], ['four', 'quatre', '4️⃣'], ['five', 'cinq', '5️⃣'], ['ten', 'dix', '🔟']],
            sentences: [
              ['I have two brothers.', 'J\'ai deux frères.'],
              ['She is ten years old.', 'Elle a dix ans.'],
              ['Three apples, please.', 'Trois pommes, s\'il vous plaît.|Trois pommes, s\'il te plaît.'],
              ['We have five dogs.', 'Nous avons cinq chiens.|On a cinq chiens.'],
            ],
          },
        ],
      },
      {
        id: 'en-u3', level: 'intermediate', color: '#ce82ff', title: 'Agir au présent',
        lessons: [
          {
            id: 'en-8', icon: '🔁', title: 'Le présent simple',
            tip: { title: 'Le -s de la 3ᵉ personne', body: 'Au présent simple, on ajoute -s avec he, she, it : « I work » mais « she works ».\nPour poser une question : Do you…? / Does he…? — « Do you speak French? »' },
            words: [['to eat', 'manger', '🍽️'], ['to drink', 'boire', '🥤'], ['to work', 'travailler', '💼'], ['to sleep', 'dormir', '😴'], ['to read', 'lire', '📖'], ['to speak', 'parler', '🗣️']],
            sentences: [
              ['He works every day.', 'Il travaille tous les jours.|Il travaille chaque jour.', 'He → works : n\'oublie pas le -s !'],
              ['I read a book.', 'Je lis un livre.'],
              ['She speaks English.', 'Elle parle anglais.|Elle parle l\'anglais.'],
              ['They sleep at night.', 'Ils dorment la nuit.|Elles dorment la nuit.'],
              ['Do you speak French?', 'Parles-tu français ?|Tu parles français ?|Est-ce que tu parles français ?|Parlez-vous français ?|Vous parlez français ?|Est-ce que vous parlez français ?'],
            ],
          },
          {
            id: 'en-9', icon: '🏙️', title: 'En ville',
            tip: { title: 'Demander son chemin', body: '« Where is…? » = Où est… ? · « near » = près de · « turn left / right » = tournez à gauche / droite · « straight ahead » = tout droit.' },
            words: [['school', 'école', '🏫'], ['hospital', 'hôpital', '🏥'], ['market', 'marché', '🏪'], ['church', 'église', '⛪'], ['street', 'rue', '🛣️'], ['bank', 'banque', '🏦']],
            sentences: [
              ['Where is the hospital?', 'Où est l\'hôpital ?|Où se trouve l\'hôpital ?'],
              ['The school is near the market.', 'L\'école est près du marché.|L\'école se trouve près du marché.'],
              ['I go to the bank.', 'Je vais à la banque.'],
              ['Turn left after the church.', 'Tournez à gauche après l\'église.|Tourne à gauche après l\'église.'],
            ],
          },
          {
            id: 'en-10', icon: '⏳', title: 'Le présent continu',
            tip: { title: 'Be + verbe-ing', body: 'Pour une action en cours : « I am eating » = je mange (en ce moment).\nPour une habitude, on garde le présent simple : « I always eat rice ».\nLes adverbes de fréquence (always, never) se placent avant le verbe.' },
            words: [['now', 'maintenant', '⏰'], ['today', 'aujourd\'hui', '📅'], ['tomorrow', 'demain', '🌅'], ['yesterday', 'hier', '⏪'], ['always', 'toujours', '♾️'], ['never', 'jamais', '🚫']],
            sentences: [
              ['I am eating now.', 'Je mange maintenant.|Je suis en train de manger maintenant.|Je suis en train de manger.'],
              ['She is reading a book.', 'Elle lit un livre.|Elle est en train de lire un livre.'],
              ['We are working today.', 'Nous travaillons aujourd\'hui.|On travaille aujourd\'hui.'],
              ['Are you sleeping?', 'Tu dors ?|Est-ce que tu dors ?|Dors-tu ?|Vous dormez ?|Est-ce que vous dormez ?'],
              ['He never drinks milk.', 'Il ne boit jamais de lait.'],
            ],
          },
        ],
      },
      {
        id: 'en-u4', level: 'advanced', color: '#ff9600', title: 'Raconter et argumenter',
        lessons: [
          {
            id: 'en-11', icon: '📜', title: 'Le passé (prétérit)',
            tip: { title: 'Le prétérit', body: 'Verbes réguliers : on ajoute -ed (work → worked).\nVerbes irréguliers à connaître : go → went, eat → ate, see → saw, be → was/were, have → had, make → made.\nQuestion : Did you…? — « Did you eat? »' },
            words: [['went', 'suis allé|est allé|allé', '🚶'], ['ate', 'ai mangé|a mangé|mangé', '🍽️'], ['saw', 'ai vu|a vu|vu', '👀'], ['was', 'étais|était', '🕰️'], ['had', 'avais|avait|ai eu', '🎁'], ['made', 'ai fait|a fait|fait', '🛠️']],
            sentences: [
              ['Yesterday I went to the market.', 'Hier, je suis allé au marché.|Hier, je suis allée au marché.'],
              ['We saw a beautiful film.', 'Nous avons vu un beau film.|On a vu un beau film.'],
              ['She was tired.', 'Elle était fatiguée.'],
              ['They made a cake.', 'Ils ont fait un gâteau.|Elles ont fait un gâteau.'],
              ['Did you eat?', 'As-tu mangé ?|Tu as mangé ?|Est-ce que tu as mangé ?|Avez-vous mangé ?|Vous avez mangé ?'],
            ],
          },
          {
            id: 'en-12', icon: '🚀', title: 'Le futur',
            tip: { title: 'Will et going to', body: '« will + verbe » : décision ou prédiction — « It will rain ».\n« be going to + verbe » : projet déjà prévu — « We are going to travel ».' },
            words: [['soon', 'bientôt', '⏩'], ['later', 'plus tard', '🕓'], ['maybe', 'peut-être', '🤔'], ['next week', 'la semaine prochaine', '📆'], ['to travel', 'voyager', '✈️'], ['to call', 'appeler', '📞']],
            sentences: [
              ['I will call you tomorrow.', 'Je t\'appellerai demain.|Je vais t\'appeler demain.|Je vous appellerai demain.|Je vais vous appeler demain.'],
              ['We are going to travel next week.', 'Nous allons voyager la semaine prochaine.|On va voyager la semaine prochaine.'],
              ['It will rain later.', 'Il pleuvra plus tard.|Il va pleuvoir plus tard.'],
              ['Maybe she will come.', 'Elle viendra peut-être.|Peut-être qu\'elle viendra.|Elle va peut-être venir.'],
            ],
          },
          {
            id: 'en-13', icon: '💬', title: 'Donner son avis',
            tip: { title: 'Exprimer une opinion', body: '« I think (that)… » = je pense que… · « In my opinion… » = à mon avis… · « I agree / I disagree » = je suis d\'accord / pas d\'accord.\nAttention : « I am agree » est une faute fréquente ; on dit simplement « I agree ».' },
            words: [['I think', 'je pense|je crois', '💭'], ['I agree', 'je suis d\'accord', '🤝'], ['because', 'parce que|car', '🔗'], ['however', 'cependant|pourtant|toutefois', '↔️'], ['expensive', 'cher', '💰'], ['opinion', 'avis|opinion', '🗨️']],
            sentences: [
              ['I think that it is important.', 'Je pense que c\'est important.|Je crois que c\'est important.'],
              ['I agree with you.', 'Je suis d\'accord avec toi.|Je suis d\'accord avec vous.'],
              ['I stayed at home because it was raining.', 'Je suis resté à la maison parce qu\'il pleuvait.|Je suis restée à la maison parce qu\'il pleuvait.|Je suis resté chez moi parce qu\'il pleuvait.|Je suis restée chez moi parce qu\'il pleuvait.'],
              ['In my opinion, it is too expensive.', 'À mon avis, c\'est trop cher.|Selon moi, c\'est trop cher.'],
            ],
          },
        ],
      },
    ],
  },

  // ───────────────────────────── ESPAGNOL (depuis le français) ─────────────────────────────
  {
    id: 'es-fr', target: 'es', from: 'fr', flag: '🇪🇸', tts: 'es-ES',
    name: { fr: 'Espagnol', mg: 'Espaniola' },
    units: [
      {
        id: 'es-u1', level: 'beginner', color: '#58cc02', title: 'Premiers pas',
        lessons: [
          {
            id: 'es-1', icon: '👋', title: 'Salutations',
            tip: { title: '¡Hola!', body: 'En espagnol, les phrases exclamatives et interrogatives commencent par un signe à l\'envers : ¡Hola! ¿Qué tal? Le « h » ne se prononce jamais.' },
            words: [['hola', 'bonjour|salut', '👋'], ['adiós', 'au revoir', '🚶'], ['gracias', 'merci', '🙏'], ['por favor', 's\'il te plaît|s\'il vous plaît', '🥺'], ['sí', 'oui', '✅'], ['no', 'non', '❌']],
            sentences: [
              ['Hola, me llamo Ana.', 'Bonjour, je m\'appelle Ana.|Salut, je m\'appelle Ana.'],
              ['Muchas gracias.', 'Merci beaucoup.'],
              ['Adiós, hasta mañana.', 'Au revoir, à demain.'],
              ['Sí, por favor.', 'Oui, s\'il te plaît.|Oui, s\'il vous plaît.'],
            ],
          },
          {
            id: 'es-2', icon: '🍎', title: 'La nourriture',
            tip: { title: 'El ou la ?', body: 'Les noms en -o sont souvent masculins (el pescado) et ceux en -a féminins (la manzana). Mais attention : el agua, el pan, la leche ne suivent pas toujours la logique française.' },
            words: [['manzana', 'pomme', '🍎'], ['pan', 'pain', '🍞'], ['agua', 'eau', '💧'], ['leche', 'lait', '🥛'], ['arroz', 'riz', '🍚'], ['pescado', 'poisson', '🐟']],
            sentences: [
              ['Yo como una manzana.', 'Je mange une pomme.'],
              ['Ella bebe agua.', 'Elle boit de l\'eau.'],
              ['Comemos arroz con pescado.', 'Nous mangeons du riz avec du poisson.|On mange du riz avec du poisson.|Nous mangeons du riz au poisson.', 'Le pronom sujet (nosotros) est souvent omis : la terminaison -emos suffit.'],
              ['El pan es bueno.', 'Le pain est bon.'],
            ],
          },
          {
            id: 'es-3', icon: '👨‍👩‍👧', title: 'La famille',
            tip: { title: 'Mi / mis', body: '« mi » = mon / ma, « mis » = mes. Pas de différence entre masculin et féminin : mi padre, mi madre.' },
            words: [['madre', 'mère', '👩'], ['padre', 'père', '👨'], ['hermana', 'sœur', '👧'], ['hermano', 'frère', '👦'], ['bebé', 'bébé', '👶'], ['familia', 'famille', '👪']],
            sentences: [
              ['Esta es mi madre.', 'C\'est ma mère.|Voici ma mère.'],
              ['Tengo un hermano.', 'J\'ai un frère.'],
              ['Mi padre es alto.', 'Mon père est grand.'],
              ['Somos una familia.', 'Nous sommes une famille.|On est une famille.'],
            ],
          },
        ],
      },
      {
        id: 'es-u2', level: 'beginner', color: '#1cb0f6', title: 'Décrire',
        lessons: [
          {
            id: 'es-4', icon: '🧍', title: 'Ser et estar',
            tip: { title: 'Deux verbes « être »', body: 'SER : identité, caractéristique durable — « Soy estudiante ».\nESTAR : état passager, lieu — « Estoy cansado », « Estamos en casa ».\nser : soy, eres, es, somos, son · estar : estoy, estás, está, estamos, están.' },
            words: [['soy', 'je suis (identité)', '🪪'], ['estoy', 'je suis (état, lieu)', '📍'], ['eres', 'tu es (identité)', '👉'], ['es', 'il/elle est (identité)', '👤'], ['somos', 'nous sommes (identité)', '👫'], ['estamos', 'nous sommes (état, lieu)', '🏠']],
            sentences: [
              ['Soy estudiante.', 'Je suis étudiant.|Je suis étudiante.'],
              ['Estoy cansado.', 'Je suis fatigué.'],
              ['Ella es mi amiga.', 'Elle est mon amie.|C\'est mon amie.'],
              ['Estamos en casa.', 'Nous sommes à la maison.|On est à la maison.|Nous sommes chez nous.', 'Un lieu → estar.'],
            ],
          },
          {
            id: 'es-5', icon: '🎨', title: 'Les couleurs',
            tip: { title: 'L\'accord des couleurs', body: 'Comme en français, l\'adjectif suit le nom et s\'accorde : el coche rojo, la casa roja, los coches rojos. « azul » et « verde » ne changent qu\'au pluriel.' },
            words: [['rojo', 'rouge', '🔴'], ['azul', 'bleu', '🔵'], ['verde', 'vert', '🟢'], ['amarillo', 'jaune', '🟡'], ['negro', 'noir', '⚫'], ['blanco', 'blanc', '⚪']],
            sentences: [
              ['El coche es rojo.', 'La voiture est rouge.'],
              ['El cielo es azul.', 'Le ciel est bleu.'],
              ['Mi gato es negro.', 'Mon chat est noir.'],
              ['Me gusta el color verde.', 'J\'aime la couleur verte.|J\'aime le vert.', '« Me gusta » = littéralement « ça me plaît ».'],
            ],
          },
        ],
      },
      {
        id: 'es-u3', level: 'intermediate', color: '#ce82ff', title: 'Au quotidien',
        lessons: [
          {
            id: 'es-6', icon: '🔁', title: 'Verbes en -ar',
            tip: { title: 'Présent des verbes en -ar', body: 'hablar → hablo, hablas, habla, hablamos, habláis, hablan.\nLe pronom sujet est généralement omis : « Hablo español » = je parle espagnol.' },
            words: [['hablar', 'parler', '🗣️'], ['trabajar', 'travailler', '💼'], ['cantar', 'chanter', '🎤'], ['estudiar', 'étudier', '📚'], ['caminar', 'marcher', '🚶'], ['comprar', 'acheter', '🛍️']],
            sentences: [
              ['Hablo español.', 'Je parle espagnol.|Je parle l\'espagnol.'],
              ['Ella trabaja mucho.', 'Elle travaille beaucoup.'],
              ['Estudiamos en casa.', 'Nous étudions à la maison.|On étudie à la maison.'],
              ['¿Hablas francés?', 'Parles-tu français ?|Tu parles français ?|Est-ce que tu parles français ?'],
              ['Compran pan en el mercado.', 'Ils achètent du pain au marché.|Elles achètent du pain au marché.'],
            ],
          },
          {
            id: 'es-7', icon: '🏙️', title: 'En ville',
            tip: { title: 'Al / del', body: 'a + el = al (Voy al banco) · de + el = del (cerca del mercado). « ¿Dónde está…? » = Où est… ?' },
            words: [['escuela', 'école', '🏫'], ['hospital', 'hôpital', '🏥'], ['mercado', 'marché', '🏪'], ['iglesia', 'église', '⛪'], ['calle', 'rue', '🛣️'], ['banco', 'banque', '🏦']],
            sentences: [
              ['¿Dónde está el hospital?', 'Où est l\'hôpital ?|Où se trouve l\'hôpital ?'],
              ['La escuela está cerca del mercado.', 'L\'école est près du marché.'],
              ['Voy al banco.', 'Je vais à la banque.'],
            ],
          },
        ],
      },
      {
        id: 'es-u4', level: 'advanced', color: '#ff9600', title: 'Raconter',
        lessons: [
          {
            id: 'es-8', icon: '📜', title: 'Le passé (pretérito)',
            tip: { title: 'Le pretérito indefinido', body: 'Pour une action terminée : comí (j\'ai mangé), fui (je suis allé), vi (j\'ai vu), hice (j\'ai fait).\nVerbes en -ar : hablé, hablaste, habló, hablamos… Verbes en -er/-ir : comí, comiste, comió, comimos…' },
            words: [['comí', 'j\'ai mangé', '🍽️'], ['fui', 'je suis allé', '🚶'], ['vi', 'j\'ai vu', '👀'], ['hice', 'j\'ai fait', '🛠️'], ['tuve', 'j\'ai eu', '🎁'], ['ayer', 'hier', '⏪']],
            sentences: [
              ['Ayer fui al mercado.', 'Hier, je suis allé au marché.|Hier, je suis allée au marché.'],
              ['Comimos pescado.', 'Nous avons mangé du poisson.|On a mangé du poisson.'],
              ['Ella vio una película.', 'Elle a vu un film.'],
              ['¿Qué hiciste ayer?', 'Qu\'as-tu fait hier ?|Qu\'est-ce que tu as fait hier ?|Tu as fait quoi hier ?'],
            ],
          },
        ],
      },
    ],
  },

  // ───────────────────────────── FRANÇAIS (avy amin'ny teny malagasy) ─────────────────────────────
  {
    id: 'fr-mg', target: 'fr', from: 'mg', flag: '🇫🇷', tts: 'fr-FR',
    name: { fr: 'Français (pour malgachophones)', mg: 'Frantsay' },
    units: [
      {
        id: 'fr-u1', level: 'beginner', color: '#58cc02', title: 'Fiandohana',
        lessons: [
          {
            id: 'fr-1', icon: '👋', title: 'Fiarahabana',
            tip: { title: 'Bonjour sy bonsoir', body: '« Bonjour » no ampiasaina maraina sy antoandro, « bonsoir » kosa rehefa hariva.\n« Vous » dia fanajana na olona maro ; « tu » kosa amin\'ny namana sy ankizy.' },
            words: [['bonjour', 'manao ahoana|salama', '👋'], ['au revoir', 'veloma', '🚶'], ['merci', 'misaotra', '🙏'], ['s\'il vous plaît', 'azafady', '🥺'], ['oui', 'eny', '✅'], ['non', 'tsia', '❌']],
            sentences: [
              ['Bonjour, je m\'appelle Rija.', 'Manao ahoana, Rija no anarako.|Salama, Rija no anarako.|Manao ahoana, ny anarako dia Rija.|Salama, ny anarako dia Rija.'],
              ['Merci beaucoup.', 'Misaotra betsaka.|Misaotra indrindra.|Misaotra be.'],
              ['Au revoir, à demain.', 'Veloma, rahampitso indray.|Veloma, mandra-pihaona rahampitso.|Veloma, amin\'ny rahampitso.'],
              ['Comment allez-vous ?', 'Manao ahoana ianao?|Manao ahoana ianareo?|Salama ve ianao?'],
            ],
          },
          {
            id: 'fr-2', icon: '👨‍👩‍👧', title: 'Fianakaviana',
            tip: { title: 'Le, la, les', body: 'Amin\'ny teny frantsay, ny anarana rehetra dia lahy (le) na vavy (la). « les » rehefa maro.\nOhatra : le père, la mère, les enfants. Tsara ny mianatra ny anarana miaraka amin\'ny « le » na « la ».' },
            words: [['la mère', 'ny reny', '👩'], ['le père', 'ny ray', '👨'], ['la sœur', 'ny anabavy|ny rahavavy', '👧'], ['le frère', 'ny anadahy|ny rahalahy', '👦'], ['le bébé', 'ny zazakely', '👶'], ['la famille', 'ny fianakaviana', '👪']],
            sentences: [
              ['C\'est ma mère.', 'Io no reniko.|Ity no reniko.|Reniko io.'],
              ['J\'ai un frère.', 'Manana anadahy aho.|Manana rahalahy aho.|Manana anadahy iray aho.'],
              ['Mon père est grand.', 'Lava ny raiko.|Avo ny raiko.'],
              ['Nous sommes une famille.', 'Fianakaviana iray isika.|Fianakaviana iray izahay.'],
            ],
          },
          {
            id: 'fr-3', icon: '🍎', title: 'Sakafo',
            tip: { title: 'Du, de la, des', body: 'Rehefa tsy voafaritra ny habetsahana dia ampiasaina ny « du » (lahy), « de la » (vavy), « de l\' » (eo alohan\'ny zanatsoratra) : je mange du riz, je bois de l\'eau.' },
            words: [['la pomme', 'paoma', '🍎'], ['le pain', 'mofo', '🍞'], ['l\'eau', 'rano', '💧'], ['le lait', 'ronono', '🥛'], ['le riz', 'vary', '🍚'], ['le poisson', 'trondro', '🐟']],
            sentences: [
              ['Je mange du riz.', 'Mihinana vary aho.'],
              ['Elle boit de l\'eau.', 'Misotro rano izy.'],
              ['Le pain est bon.', 'Tsara ny mofo.|Matsiro ny mofo.'],
              ['Nous mangeons du poisson.', 'Mihinana trondro izahay.|Mihinana trondro isika.'],
            ],
          },
        ],
      },
      {
        id: 'fr-u2', level: 'beginner', color: '#1cb0f6', title: 'Andavanandro',
        lessons: [
          {
            id: 'fr-4', icon: '🧍', title: 'Ny matoanteny « être »',
            tip: { title: 'Être = « dia / no »', body: 'Tsy manana matoanteny « être » ny teny malagasy (« Faly aho »), fa ilaina foana izy amin\'ny teny frantsay : « Je suis content ».\nje suis · tu es · il/elle est · nous sommes · vous êtes · ils/elles sont.' },
            words: [['je suis', 'izaho (aho)', '🙋'], ['tu es', 'ianao', '👉'], ['il est', 'izy (lehilahy)', '👨'], ['elle est', 'izy (vehivavy)', '👩'], ['nous sommes', 'izahay|isika', '👫'], ['ils sont', 'izy ireo', '👥']],
            sentences: [
              ['Je suis content.', 'Faly aho.|Faly ny foko.'],
              ['Tu es mon ami.', 'Namako ianao.|Ianao no namako.'],
              ['Elle est enseignante.', 'Mpampianatra izy.'],
              ['Nous sommes à la maison.', 'Ao an-trano izahay.|Ao an-trano isika.'],
              ['Ils sont étudiants.', 'Mpianatra izy ireo.'],
            ],
          },
          {
            id: 'fr-5', icon: '🎨', title: 'Loko',
            tip: { title: 'Ny filaharan\'ny teny', body: 'Ny loko dia apetraka aorian\'ny anarana : « une voiture rouge ».\nMiova arakaraka ny lahy/vavy izy : vert → verte, noir → noire, blanc → blanche.' },
            words: [['rouge', 'mena', '🔴'], ['bleu', 'manga', '🔵'], ['vert', 'maitso', '🟢'], ['jaune', 'mavo', '🟡'], ['noir', 'mainty', '⚫'], ['blanc', 'fotsy', '⚪']],
            sentences: [
              ['La voiture est rouge.', 'Mena ny fiara.'],
              ['Le ciel est bleu.', 'Manga ny lanitra.'],
              ['Mon chat est noir.', 'Mainty ny sakako.|Mainty ny saka-ko.'],
              ['J\'aime le vert.', 'Tiako ny maitso.|Tiako ny loko maitso.'],
            ],
          },
          {
            id: 'fr-6', icon: '🔢', title: 'Isa',
            tip: { title: 'Ny taona', body: 'Amin\'ny teny frantsay dia « avoir » no ampiasaina hilazana ny taona : « J\'ai dix ans » = Folo taona aho.' },
            words: [['un', 'iray', '1️⃣'], ['deux', 'roa', '2️⃣'], ['trois', 'telo', '3️⃣'], ['quatre', 'efatra', '4️⃣'], ['cinq', 'dimy', '5️⃣'], ['dix', 'folo', '🔟']],
            sentences: [
              ['J\'ai deux frères.', 'Manana anadahy roa aho.|Manana rahalahy roa aho.'],
              ['Elle a dix ans.', 'Folo taona izy.'],
              ['Trois pommes, s\'il vous plaît.', 'Paoma telo, azafady.|Azafady, paoma telo.'],
            ],
          },
        ],
      },
      {
        id: 'fr-u3', level: 'intermediate', color: '#ce82ff', title: 'Ao an-tanàna',
        lessons: [
          {
            id: 'fr-7', icon: '🏙️', title: 'Tanàna',
            tip: { title: 'Au / à la', body: 'à + le = au (je vais au marché) · à + la = à la (je vais à la banque) · à + l\' = à l\' (à l\'école).' },
            words: [['l\'école', 'sekoly', '🏫'], ['l\'hôpital', 'hopitaly', '🏥'], ['le marché', 'tsena', '🏪'], ['l\'église', 'fiangonana', '⛪'], ['la rue', 'arabe|lalana', '🛣️'], ['la banque', 'banky', '🏦']],
            sentences: [
              ['Où est l\'hôpital ?', 'Aiza ny hopitaly?|Aiza no misy ny hopitaly?'],
              ['Je vais au marché.', 'Mankany an-tsena aho.|Handeha ho any an-tsena aho.'],
              ['L\'école est près de l\'église.', 'Akaikin\'ny fiangonana ny sekoly.'],
            ],
          },
          {
            id: 'fr-8', icon: '🔁', title: 'Matoanteny -er',
            tip: { title: 'Ny fanovana ny matoanteny -er', body: 'parler → je parle, tu parles, il parle, nous parlons, vous parlez, ils parlent.\nMiova ny faran\'ny matoanteny arakaraka ny mpanao — tsy toy ny teny malagasy.' },
            words: [['parler', 'miteny', '🗣️'], ['manger', 'mihinana', '🍽️'], ['travailler', 'miasa', '💼'], ['chanter', 'mihira', '🎤'], ['aimer', 'tia', '❤️'], ['habiter', 'monina|mipetraka', '🏠']],
            sentences: [
              ['Je parle français.', 'Miteny frantsay aho.'],
              ['Nous travaillons beaucoup.', 'Miasa mafy izahay.|Miasa be izahay.|Miasa mafy isika.'],
              ['Tu habites à Antananarivo ?', 'Monina any Antananarivo ve ianao?|Mipetraka any Antananarivo ve ianao?|Mipetraka eto Antananarivo ve ianao?'],
              ['Ils chantent bien.', 'Mahay mihira izy ireo.|Mihira tsara izy ireo.'],
            ],
          },
        ],
      },
      {
        id: 'fr-u4', level: 'advanced', color: '#ff9600', title: 'Mitantara',
        lessons: [
          {
            id: 'fr-9', icon: '⏪', title: 'Passé composé',
            tip: { title: 'Ny lasa (passé composé)', body: 'avoir/être + participe passé : j\'ai mangé, je suis allé.\nAmin\'ny teny malagasy dia ny tovona ni-/na- no manondro ny lasa (nihinana, nandeha) ; amin\'ny frantsay kosa « avoir » na « être » no ampiana.' },
            words: [['j\'ai mangé', 'nihinana aho', '🍽️'], ['je suis allé', 'nandeha aho', '🚶'], ['j\'ai vu', 'nahita aho', '👀'], ['j\'ai fait', 'nanao aho', '🛠️'], ['j\'ai parlé', 'niteny aho', '🗣️'], ['hier', 'omaly', '⏪']],
            sentences: [
              ['Hier, je suis allé au marché.', 'Nankany an-tsena aho omaly.|Omaly aho nankany an-tsena.|Nandeha tany an-tsena aho omaly.'],
              ['Nous avons mangé du riz.', 'Nihinana vary izahay.|Nihinana vary isika.'],
              ['Elle a vu un film.', 'Nijery sarimihetsika izy.|Nahita sarimihetsika izy.'],
              ['Qu\'as-tu fait hier ?', 'Inona no nataonao omaly?'],
            ],
          },
        ],
      },
    ],
  },
];

export const LEVELS = ['beginner', 'intermediate', 'advanced'];

export function getCourse(id) { return COURSES.find(c => c.id === id); }

export function allLessons(course) {
  const out = [];
  course.units.forEach((u, ui) => u.lessons.forEach((l, li) => out.push({ ...l, unit: u, unitIndex: ui, lessonIndex: li })));
  return out;
}
