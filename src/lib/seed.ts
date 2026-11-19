import type Database from "better-sqlite3";

type SeedProfile = {
  id: string;
  name: string;
  age: number;
  bio: string;
  location: string;
  interests: string[];
  /** Pre-existing swipe this profile made on the logged-in user. */
  swipedMe?: "like" | "pass";
};

/** One Hinge-style prompt per profile: [question, answer]. */
export const SEED_PROMPTS: Record<string, [string, string]> = {
  p01: ["A perfect Sunday", "Old Delhi breakfast, a secondhand bookshop, then open mic at night."],
  p02: ["I'm weirdly good at", "Sourdough. My starter has a name and a better social life than me."],
  p03: ["Let's debate", "Pineapple belongs on Maggi. I have data."],
  p04: ["The way to win me over", "Say yes to a 5am trek, even if you complain the whole way up."],
  p05: ["My simple pleasures", "Front row at a play, filter coffee after, and overanalysing every scene."],
  p06: ["Typical weekend", "Gully cricket in the morning, F1 qualifying at night. No in-between."],
  p07: ["I'm looking for", "Someone who'll drive 40 minutes for the right biryani without asking why."],
  p08: ["My most irrational fear", "Demo day with no Wi-Fi."],
  p09: ["A perfect Sunday", "Rain, adda, telebhaja and a Tagore song nobody else knows the words to."],
  p10: ["Green flag I look for", "You ask good questions. Bonus points if you ask 'why' back."],
  p11: ["My simple pleasures", "Finding a 1990s jacket for ₹200 at Sarojini."],
  p12: ["Two truths and a lie", "I've played violin at a temple, I'm Radiant in Valorant, I hate filter coffee."],
  p13: ["The way to win me over", "Stand up on the board once. That's it, you're in."],
  p14: ["I'm looking for", "A co-founder for life. Or at least for this pitch deck."],
  p15: ["Let's debate", "Is a hot dog a sandwich? I've written 2,000 words on it."],
  p16: ["My simple pleasures", "A well-proportioned staircase. I'm not joking."],
  p17: ["Typical weekend", "Snorkelling if the sea's calm, documentaries if it's not."],
  p18: ["I'm weirdly good at", "Guessing the year of any Bollywood song from the first five seconds."],
  p19: ["A perfect Sunday", "Kebabs in Aminabad, a sher-o-shayari evening, and a long walk home."],
  p20: ["Green flag I look for", "You'll wait twenty minutes for the light to be just right."],
  p21: ["My most irrational fear", "Being asked 'are you a doctor?' on a flight."],
  p22: ["The way to win me over", "Come to a gig. Even if it's just six people and my mom."],
  p23: ["I'm looking for", "Someone my three dogs approve of. They're strict."],
  p24: ["Let's debate", "Light mode is a crime. Change my mind."],
  p25: ["Typical weekend", "Chasing a story, then a long chai while I write it up."],
  p26: ["My simple pleasures", "Poha with extra sev after a long run by the lake."],
  p27: ["I'm weirdly good at", "Salsa. Also falling asleep in any lecture hall."],
  p28: ["A perfect Sunday", "Sunrise boat ride on the Ganga, then a long coding session."],
  p29: ["The way to win me over", "Know at least one Shillong band. Bonus if you've seen them live."],
  p30: ["Two truths and a lie", "Codeforces Expert, I make great biryani, I've finished One Piece."],
  p31: ["My simple pleasures", "Kahwa on a cold morning and a book I can't put down."],
  p32: ["Green flag I look for", "You go quiet when you spot a bird. Same."],
};

// A plain human-silhouette placeholder served by the app itself (public/), so no
// real people's photos are used and the demo works offline. The UI tints the
// background per profile.
const PLACEHOLDER_PHOTO = "/avatar-placeholder.svg";

// The likers are spread through the list on purpose: the feed is ordered by
// id, and a cluster of likers at the front would itself leak who liked you.
export const SEED_PROFILES: SeedProfile[] = [
  { id: "p01", name: "Aanya", age: 21, location: "Delhi University", bio: "Chai over coffee, always. Will judge your playlist.", interests: ["Music", "Chai", "Poetry"] },
  { id: "p02", name: "Rohan", age: 23, location: "Bengaluru", bio: "Backend dev by day, amateur baker by night.", interests: ["Baking", "Coding", "Cycling"], swipedMe: "like" },
  { id: "p03", name: "Ishita", age: 22, location: "IIT Bombay", bio: "Robotics club. Ask me about my robot that makes Maggi.", interests: ["Robotics", "Anime", "Cooking"] },
  { id: "p04", name: "Kabir", age: 24, location: "Mumbai", bio: "Weekend trekker. Sahyadris are my therapy.", interests: ["Trekking", "Photography", "Football"], swipedMe: "pass" },
  { id: "p05", name: "Meera", age: 20, location: "Christ University", bio: "Theatre kid who never grew out of it.", interests: ["Theatre", "Dance", "Books"] },
  { id: "p06", name: "Arjun", age: 22, location: "Pune", bio: "Cricket on Sundays, F1 on every other day.", interests: ["Cricket", "F1", "Gaming"] },
  { id: "p07", name: "Sana", age: 23, location: "Hyderabad", bio: "Biryani loyalist. Debate me.", interests: ["Food", "Travel", "Podcasts"], swipedMe: "like" },
  { id: "p08", name: "Vihaan", age: 21, location: "BITS Pilani", bio: "Hackathons, sunrises and too much Red Bull.", interests: ["Hackathons", "Startups", "Running"] },
  { id: "p09", name: "Diya", age: 22, location: "Kolkata", bio: "Rabindra Sangeet and rainy-day adda.", interests: ["Singing", "Art", "Books"] },
  { id: "p10", name: "Aditya", age: 25, location: "Gurugram", bio: "Product manager. I will ask 'why' at least five times.", interests: ["Startups", "Badminton", "Coffee"] },
  { id: "p11", name: "Riya", age: 21, location: "SRCC, Delhi", bio: "Economics student, thrift-store hunter.", interests: ["Thrifting", "Fashion", "Economics"], swipedMe: "like" },
  { id: "p12", name: "Nikhil", age: 23, location: "Chennai", bio: "Carnatic violin and competitive Valorant. Yes, both.", interests: ["Music", "Gaming", "Filter coffee"] },
  { id: "p13", name: "Tara", age: 24, location: "Goa", bio: "Surf instructor. Will absolutely make you try it.", interests: ["Surfing", "Yoga", "Beaches"] },
  { id: "p14", name: "Yash", age: 22, location: "VIT Vellore", bio: "Building a startup from my hostel room.", interests: ["Startups", "Gym", "Movies"], swipedMe: "pass" },
  { id: "p15", name: "Ananya", age: 20, location: "Ashoka University", bio: "Philosophy major. I have questions about your questions.", interests: ["Philosophy", "Writing", "Indie films"] },
  { id: "p16", name: "Dev", age: 24, location: "Ahmedabad", bio: "Architect. I notice every badly placed door.", interests: ["Architecture", "Sketching", "Travel"], swipedMe: "like" },
  { id: "p17", name: "Kavya", age: 23, location: "Kochi", bio: "Marine biology nerd. Ask me about octopuses.", interests: ["Ocean", "Diving", "Science"] },
  { id: "p18", name: "Reyansh", age: 21, location: "IIT Delhi", bio: "Quizzer. I know useless facts about everything.", interests: ["Quizzing", "History", "Chess"] },
  { id: "p19", name: "Zoya", age: 22, location: "Lucknow", bio: "Urdu poetry and kebab trails.", interests: ["Poetry", "Food", "Calligraphy"] },
  { id: "p20", name: "Aarav", age: 23, location: "Jaipur", bio: "Photographer. Golden hour is my whole personality.", interests: ["Photography", "Travel", "Heritage"], swipedMe: "like" },
  { id: "p21", name: "Pooja", age: 24, location: "Indore", bio: "Doctor in training. Sleep is a myth.", interests: ["Medicine", "Netflix", "Street food"] },
  { id: "p22", name: "Siddhant", age: 22, location: "NIT Trichy", bio: "Guitarist in a band nobody has heard of. Yet.", interests: ["Guitar", "Music", "Football"] },
  { id: "p23", name: "Nisha", age: 21, location: "Chandigarh", bio: "Dog mom of three. They come first, sorry.", interests: ["Dogs", "Volunteering", "Baking"] },
  { id: "p24", name: "Karan", age: 25, location: "Noida", bio: "UI designer. Your app's padding is wrong.", interests: ["Design", "Typography", "Cycling"], swipedMe: "like" },
  { id: "p25", name: "Aisha", age: 22, location: "Jamia Millia Islamia", bio: "Journalism student. Everything is a story.", interests: ["Journalism", "Books", "Films"] },
  { id: "p26", name: "Rahul", age: 24, location: "Bhopal", bio: "Lake-side runs and spicy poha.", interests: ["Running", "Food", "Podcasts"] },
  { id: "p27", name: "Saanvi", age: 20, location: "Manipal", bio: "Med school, salsa nights and late-night Maggi.", interests: ["Dance", "Medicine", "Travel"] },
  { id: "p28", name: "Om", age: 23, location: "Varanasi", bio: "Ghats at sunrise, code at sunset.", interests: ["Coding", "Spirituality", "Photography"], swipedMe: "pass" },
  { id: "p29", name: "Myra", age: 22, location: "Shillong", bio: "Live music every weekend. Shillong is the rock capital, fight me.", interests: ["Concerts", "Hiking", "Music"], swipedMe: "like" },
  { id: "p30", name: "Ayaan", age: 21, location: "IIIT Hyderabad", bio: "Competitive programmer, casual cook.", interests: ["Algorithms", "Cooking", "Anime"] },
  { id: "p31", name: "Fatima", age: 23, location: "Srinagar", bio: "Kahwa, mountains and long walks.", interests: ["Mountains", "Tea", "Reading"] },
  { id: "p32", name: "Ishaan", age: 24, location: "Dehradun", bio: "Wildlife volunteer. I have met a tiger (from far away).", interests: ["Wildlife", "Trekking", "Conservation"], swipedMe: "like" },
];

/**
 * Inserts the logged-in user, the mock profiles and their swipes on the user.
 * On a database that's already seeded, it only fills in prompts that are
 * missing (databases created before prompts existed). Swipes are never touched.
 */
export function seed(db: Database.Database): void {
  const { count } = db.prepare("SELECT COUNT(*) AS count FROM profiles").get() as { count: number };
  if (count > 0) {
    backfillPrompts(db);
    return;
  }

  const insertProfile = db.prepare(
    `INSERT INTO profiles (id, name, age, photo, bio, location, interests, prompt_question, prompt_answer)
     VALUES (@id, @name, @age, @photo, @bio, @location, @interests, @prompt_question, @prompt_answer)`,
  );
  const insertSwipe = db.prepare(
    "INSERT INTO swipes (swiper_id, target_id, action) VALUES (?, ?, ?)",
  );

  db.transaction(() => {
    insertProfile.run({
      id: "me", name: "You", age: 22, photo: PLACEHOLDER_PHOTO,
      bio: "The logged-in user.", location: "Delhi", interests: "[]",
      prompt_question: "", prompt_answer: "",
    });
    for (const { swipedMe, ...p } of SEED_PROFILES) {
      const [prompt_question, prompt_answer] = SEED_PROMPTS[p.id];
      insertProfile.run({
        ...p,
        photo: PLACEHOLDER_PHOTO,
        interests: JSON.stringify(p.interests),
        prompt_question,
        prompt_answer,
      });
      if (swipedMe) insertSwipe.run(p.id, "me", swipedMe);
    }
  })();
}

function backfillPrompts(db: Database.Database): void {
  const update = db.prepare(
    `UPDATE profiles SET prompt_question = ?, prompt_answer = ?
      WHERE id = ? AND prompt_answer = ''`,
  );
  db.transaction(() => {
    for (const [id, [question, answer]] of Object.entries(SEED_PROMPTS)) {
      update.run(question, answer, id);
    }
  })();
}
