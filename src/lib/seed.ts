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

// Generated illustrated faces: placeholder images without using real people's photos.
// The "-neutral" style is face-only (no hair or makeup), so avatars don't imply a gender.
const avatar = (seed: string) =>
  `https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${encodeURIComponent(seed)}&backgroundColor=ffd5dc,ffdfbf,d1d4f9,c0aede,b6e3f4`;

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

/** Inserts the logged-in user, the mock profiles and their swipes on the user. Runs only on an empty database. */
export function seed(db: Database.Database): void {
  const { count } = db.prepare("SELECT COUNT(*) AS count FROM profiles").get() as { count: number };
  if (count > 0) return;

  const insertProfile = db.prepare(
    `INSERT INTO profiles (id, name, age, photo, bio, location, interests)
     VALUES (@id, @name, @age, @photo, @bio, @location, @interests)`,
  );
  const insertSwipe = db.prepare(
    "INSERT INTO swipes (swiper_id, target_id, action) VALUES (?, ?, ?)",
  );

  db.transaction(() => {
    insertProfile.run({
      id: "me", name: "You", age: 22, photo: avatar("me"),
      bio: "The logged-in user.", location: "Delhi", interests: "[]",
    });
    for (const p of SEED_PROFILES) {
      insertProfile.run({ ...p, photo: avatar(p.name), interests: JSON.stringify(p.interests) });
      if (p.swipedMe) insertSwipe.run(p.id, "me", p.swipedMe);
    }
  })();
}
