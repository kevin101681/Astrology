// ---------------------------------------------------------------------------
// Interpretive text for signs (as Sun, Moon and Rising placements) and houses.
// ---------------------------------------------------------------------------

export const SIGN_MEANINGS = {
  Aries: {
    element: 'Fire', quality: 'Cardinal', ruler: 'Mars', symbol: 'The Ram',
    dates: 'Mar 21 – Apr 19',
    keywords: ['bold', 'pioneering', 'direct', 'energetic', 'competitive'],
    sun: 'With the Sun in Aries, your core identity runs on courage and momentum. You are a natural initiator who would rather act and adjust than wait and wonder, and you feel most alive at the start of things — new projects, new challenges, new frontiers. Your directness is refreshing, though patience and follow-through are lifelong lessons.',
    moon: 'A Moon in Aries gives you a fast-burning emotional life: feelings arrive suddenly, blaze hot, and pass just as quickly. You need independence and honesty in your inner world, and you process emotion best through action and movement rather than long reflection. Frustration is your signal that something needs to change now.',
    rising: 'Aries rising meets the world head-on. Others read you as confident, energetic and decisive before you say a word, and you tend to walk faster, decide quicker and challenge sooner than the people around you. First impressions of you are rarely lukewarm — you arrive like an event.',
  },
  Taurus: {
    element: 'Earth', quality: 'Fixed', ruler: 'Venus', symbol: 'The Bull',
    dates: 'Apr 20 – May 20',
    keywords: ['steadfast', 'sensual', 'patient', 'loyal', 'grounded'],
    sun: 'With the Sun in Taurus, your core self is built for endurance and enjoyment. You value what is real and lasting — good food, good land, good people — and you build your life slowly and solidly, like a wall meant to stand for a century. Once committed, you are nearly immovable, in devotion and in stubbornness alike.',
    moon: 'A Moon in Taurus needs calm, comfort and continuity to feel safe. You are the steady emotional anchor in most rooms you enter, slow to anger and slow to forgive, and you soothe yourself through the senses — music, touch, cooking, nature. Sudden change is your least favorite weather.',
    rising: 'Taurus rising gives a calm, unhurried, quietly magnetic presence. People sense that you cannot be rushed or rattled, and they often find your groundedness soothing. You approach new situations deliberately, preferring to watch before you commit.',
  },
  Gemini: {
    element: 'Air', quality: 'Mutable', ruler: 'Mercury', symbol: 'The Twins',
    dates: 'May 21 – Jun 20',
    keywords: ['curious', 'witty', 'adaptable', 'communicative', 'restless'],
    sun: 'With the Sun in Gemini, your core identity is a conversation in progress. You are endlessly curious, quick-thinking and verbally gifted, collecting ideas, people and skills the way others collect objects. Variety is not a luxury for you — it is oxygen — and your gift is connecting things no one else thought to connect.',
    moon: 'A Moon in Gemini processes feelings by talking and thinking them through — an emotion is not fully real to you until you have found words for it. You need mental stimulation the way others need reassurance, and restlessness or scattered thoughts are usually your first sign of emotional overload.',
    rising: 'Gemini rising leads with wit and curiosity. You come across as youthful, quick and engaging, the person who asks good questions and keeps conversation moving. You adapt your style to whoever is in front of you, which makes you socially fluent — and occasionally hard to pin down.',
  },
  Cancer: {
    element: 'Water', quality: 'Cardinal', ruler: 'The Moon', symbol: 'The Crab',
    dates: 'Jun 21 – Jul 22',
    keywords: ['nurturing', 'intuitive', 'protective', 'tenacious', 'sentimental'],
    sun: 'With the Sun in Cancer, your core self is oriented around belonging, memory and care. You build emotional homes wherever you go and defend the people inside them fiercely. Beneath a protective shell is a deeply intuitive nature that reads rooms, moods and needs long before anything is said.',
    moon: 'The Moon rules Cancer, so a Cancer Moon is the Moon at full strength: your emotional life is deep, tidal and central to everything you do. You absorb the feelings of others easily, remember emotional moments forever, and need a secure nest — physical and relational — to truly thrive.',
    rising: 'Cancer rising presents a gentle, approachable, slightly guarded face to the world. People instinctively trust you with their feelings, and you tend to size up the emotional safety of a room before stepping fully into it. Your warmth, once offered, makes people feel immediately at home.',
  },
  Leo: {
    element: 'Fire', quality: 'Fixed', ruler: 'The Sun', symbol: 'The Lion',
    dates: 'Jul 23 – Aug 22',
    keywords: ['radiant', 'generous', 'proud', 'creative', 'loyal'],
    sun: 'The Sun rules Leo, so a Leo Sun shines at full wattage: your core identity is expressive, generous and built to be seen. You lead with heart, create with flair, and give warmth and loyalty on a grand scale. Your challenge is remembering that the light is still yours on the days no one applauds.',
    moon: 'A Moon in Leo feels things dramatically and needs to feel special to feel safe. Your emotional generosity is enormous — you celebrate the people you love lavishly — and in return you need genuine appreciation, not flattery. Wounded pride is your tender spot; sincere recognition is your medicine.',
    rising: 'Leo rising walks in like the lights just came up. You have natural stage presence — warm, confident, a little regal — and people often look to you to set the tone. Even when you feel shy inside, the world tends to hand you the spotlight anyway.',
  },
  Virgo: {
    element: 'Earth', quality: 'Mutable', ruler: 'Mercury', symbol: 'The Maiden',
    dates: 'Aug 23 – Sep 22',
    keywords: ['precise', 'helpful', 'analytical', 'modest', 'devoted'],
    sun: 'With the Sun in Virgo, your core self is a craftsman: you find meaning in doing things well, improving what is broken, and being genuinely useful. You see the detail everyone else missed — in a spreadsheet, a recipe, a person — and your quiet devotion often does more good than louder people ever notice.',
    moon: 'A Moon in Virgo feels best when life is in order: emotions are processed by analyzing, organizing and fixing. You show love through acts of practical service, and anxiety is usually your signal that something feels out of your control. Learning that you are enough — unedited — is your deepest work.',
    rising: 'Virgo rising presents as composed, observant and put-together. People read you as capable and intelligent, the one who notices what needs doing and quietly does it. You tend to enter new situations in analysis mode, cataloguing details before you relax.',
  },
  Libra: {
    element: 'Air', quality: 'Cardinal', ruler: 'Venus', symbol: 'The Scales',
    dates: 'Sep 23 – Oct 22',
    keywords: ['diplomatic', 'charming', 'fair-minded', 'aesthetic', 'partnership-oriented'],
    sun: 'With the Sun in Libra, your core identity is relational and aesthetic: you are wired to seek balance, beauty and fairness in everything you touch. You see every side of every question — a gift in diplomacy, a torment at dinner-menu time — and you do your best work in true partnership.',
    moon: 'A Moon in Libra needs harmony to feel emotionally at ease; conflict lands on you almost physically. You process feelings by talking them through with someone you trust, and you have a gift for restoring peace. The growth edge is learning that your own needs count as much as everyone else\'s.',
    rising: 'Libra rising leads with charm and grace. You come across as polished, pleasant and socially effortless, instinctively putting others at ease and smoothing rough edges in any room. People often remember you as the most agreeable person they met that day.',
  },
  Scorpio: {
    element: 'Water', quality: 'Fixed', ruler: 'Pluto (and Mars)', symbol: 'The Scorpion',
    dates: 'Oct 23 – Nov 21',
    keywords: ['intense', 'perceptive', 'private', 'transformative', 'magnetic'],
    sun: 'With the Sun in Scorpio, your core self runs deep and hot beneath a controlled surface. You are drawn to the truth under the truth — motives, secrets, the machinery of power and desire — and you transform yourself repeatedly over a lifetime. Your loyalty, once earned, is absolute.',
    moon: 'A Moon in Scorpio feels everything at maximum depth and reveals almost none of it by default. Your emotional world is private, intense and profoundly loyal; trust is your currency and betrayal is your one unforgivable. When you finally let someone all the way in, it is total.',
    rising: 'Scorpio rising projects quiet intensity. People sense there is more going on behind your eyes than you are saying — and they are right. You observe first, reveal last, and carry a magnetic, slightly mysterious presence that others find either compelling or intimidating, usually both.',
  },
  Sagittarius: {
    element: 'Fire', quality: 'Mutable', ruler: 'Jupiter', symbol: 'The Archer',
    dates: 'Nov 22 – Dec 21',
    keywords: ['adventurous', 'optimistic', 'philosophical', 'candid', 'freedom-loving'],
    sun: 'With the Sun in Sagittarius, your core identity is an expedition: you are here to explore, learn, laugh and find the biggest possible picture. Optimism is your default setting and honesty your policy — sometimes more honesty than anyone ordered. You need a horizon; fences of any kind make you itch.',
    moon: 'A Moon in Sagittarius needs freedom and meaning to feel emotionally well. You metabolize hard feelings through humor, movement and perspective — a long trip or a big idea can heal you faster than a long talk. Feeling trapped, bored or micromanaged is your emotional kryptonite.',
    rising: 'Sagittarius rising arrives with energy, humor and an air of adventure. People read you as upbeat, candid and larger than life, the friend with the best stories and the next trip already planned. You give first impressions of openness — because you genuinely are open.',
  },
  Capricorn: {
    element: 'Earth', quality: 'Cardinal', ruler: 'Saturn', symbol: 'The Sea-Goat',
    dates: 'Dec 22 – Jan 19',
    keywords: ['ambitious', 'disciplined', 'pragmatic', 'responsible', 'enduring'],
    sun: 'With the Sun in Capricorn, your core self is an architect of the long game. You measure life in mountains climbed: set the goal, make the plan, do the work, repeat for forty years. Beneath the dry wit and reserve is a deep sense of duty — and a person who quietly carries more than their share.',
    moon: 'A Moon in Capricorn manages feelings the way it manages everything: with structure and self-control. You are slow to lean on others, preferring to be the reliable one, and you show love through commitment and provision rather than words. Letting yourself need people is your lifelong assignment.',
    rising: 'Capricorn rising presents as composed, competent and a touch reserved. People instinctively treat you as the responsible adult in the room — often from a young age — and you tend to earn respect before you seek affection. Your dry humor surprises everyone who assumed you were all business.',
  },
  Aquarius: {
    element: 'Air', quality: 'Fixed', ruler: 'Uranus (and Saturn)', symbol: 'The Water-Bearer',
    dates: 'Jan 20 – Feb 18',
    keywords: ['original', 'humanitarian', 'independent', 'inventive', 'unconventional'],
    sun: 'With the Sun in Aquarius, your core identity is the friendly outsider: you see systems from above, question every default, and care intensely about the group even while standing slightly apart from it. You are wired for the future — ideas, technology, social change — and being ordinary was never on the menu.',
    moon: 'A Moon in Aquarius feels first with the head: you instinctively step back from strong emotion to analyze it, and you need space and independence even from the people you love most. Your compassion is real but runs wide rather than close — you can love humanity fluently and need practice with one human at a time.',
    rising: 'Aquarius rising comes across as intriguing and a little unclassifiable — friendly, but on your own frequency. People notice quickly that you think differently, dress differently or simply refuse the script. You make an excellent first impression on anyone bored with normal.',
  },
  Pisces: {
    element: 'Water', quality: 'Mutable', ruler: 'Neptune (and Jupiter)', symbol: 'The Fish',
    dates: 'Feb 19 – Mar 20',
    keywords: ['empathic', 'imaginative', 'gentle', 'artistic', 'intuitive'],
    sun: 'With the Sun in Pisces, your core self is porous to everything — beauty, suffering, music, other people\'s moods, the numinous. You are the zodiac\'s dreamer and healer, gifted with imagination and compassion that have no natural edges. Your task is building banks for a very deep river: boundaries that protect the gift.',
    moon: 'A Moon in Pisces is an open emotional channel: you feel what others feel, often before they do, and you need regular solitude to find out which feelings are actually yours. Art, water, music and sleep restore you. Your empathy is a superpower exactly as long as it includes yourself.',
    rising: 'Pisces rising gives a soft, dreamy, approachable presence. Strangers tell you their life stories; rooms grow gentler when you enter. You seem to drift rather than march through the world, and people often project their ideals onto your unusually open face.',
  },
};

export const HOUSE_MEANINGS = [
  { num: 1,  title: 'Self & Appearance',      text: 'Your identity, body, first impressions and the way you launch into life. Ruled by your rising sign — the mask that turns out to be a face.' },
  { num: 2,  title: 'Money & Values',          text: 'Income, possessions, self-worth and what you consider truly valuable. How you earn, spend and hold on.' },
  { num: 3,  title: 'Mind & Communication',    text: 'Thinking, speaking, writing, siblings, neighbors and short journeys. Your everyday mental weather.' },
  { num: 4,  title: 'Home & Roots',            text: 'Family, ancestry, home and your private inner foundation. Where you come from and where you retreat to.' },
  { num: 5,  title: 'Creativity & Joy',        text: 'Romance, play, children, art and self-expression. Everything you do purely because it lights you up.' },
  { num: 6,  title: 'Work & Health',           text: 'Daily routines, service, craft, coworkers and physical wellbeing. The maintenance schedule of a life.' },
  { num: 7,  title: 'Partnership',             text: 'Marriage, business partners, close one-to-one bonds — and open rivals. The others who mirror you.' },
  { num: 8,  title: 'Depth & Transformation',  text: 'Shared resources, intimacy, inheritance, crisis and rebirth. Where you merge, lose control and are remade.' },
  { num: 9,  title: 'Beliefs & Horizons',      text: 'Philosophy, higher education, long journeys, publishing and faith. The big picture you steer by.' },
  { num: 10, title: 'Career & Reputation',     text: 'Vocation, public standing, authority and legacy. What you are known for at the top of your chart.' },
  { num: 11, title: 'Community & Future',      text: 'Friends, groups, causes and long-range hopes. Your tribe and the future you are building with it.' },
  { num: 12, title: 'The Unseen',              text: 'Solitude, dreams, the subconscious, hidden strengths and self-undoing. The backstage of the psyche.' },
];

export const PLACEMENT_INTRO = {
  sun: 'Your Sun sign is the center of your chart — your core identity, vitality and the story your life is fundamentally about. It is set by the Sun\'s position along the ecliptic on your birthday.',
  moon: 'Your Moon sign is your inner world — instincts, emotional needs and what you require to feel safe. The Moon changes signs every 2–3 days, which is why birth date and time matter.',
  rising: 'Your Rising sign (Ascendant) is the zodiac sign climbing over the eastern horizon at the minute and place you were born. It shapes your appearance, first impressions and how you meet the world — and it anchors your whole house system.',
};
