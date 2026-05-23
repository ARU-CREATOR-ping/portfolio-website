const SUPERHEROES_DB = [
  {
    id: "spiderman",
    name: "Spider-Man",
    realName: "Peter Parker",
    publisher: "Marvel",
    alignment: "good",
    avatar: "https://images.unsplash.com/photo-1604200213928-ba3cf4fc8436?q=80&w=400",
    stats: {
      intelligence: 90,
      strength: 55,
      speed: 67,
      durability: 75,
      power: 74,
      combat: 85
    },
    biography: {
      firstAppearance: "Amazing Fantasy #15 (1962)",
      placeOfBirth: "Queens, New York",
      occupation: "Freelance Photographer, Scientist, Teacher",
      alterEgos: "None"
    },
    connections: {
      groupAffiliation: "Avengers, Spider-Society, Future Foundation",
      relatives: "Richard Parker (father, deceased), Mary Parker (mother, deceased), Benjamin Parker (uncle, deceased), May Parker (aunt)"
    }
  },
  {
    id: "batman",
    name: "Batman",
    realName: "Bruce Wayne",
    publisher: "DC",
    alignment: "good",
    avatar: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=400",
    stats: {
      intelligence: 100,
      strength: 20,
      speed: 30,
      durability: 35,
      power: 40,
      combat: 100
    },
    biography: {
      firstAppearance: "Detective Comics #27 (1939)",
      placeOfBirth: "Gotham City",
      occupation: "CEO of Wayne Enterprises, Vigilante",
      alterEgos: "No alter egos"
    },
    connections: {
      groupAffiliation: "Justice League, Batman Family, Outsiders",
      relatives: "Thomas Wayne (father, deceased), Martha Wayne (mother, deceased), Alfred Pennyworth (butler/father figure), Damian Wayne (son)"
    }
  },
  {
    id: "ironman",
    name: "Iron Man",
    realName: "Tony Stark",
    publisher: "Marvel",
    alignment: "good",
    avatar: "https://images.unsplash.com/photo-1608889175123-8ec330b86f84?q=80&w=400",
    stats: {
      intelligence: 98,
      strength: 85,
      speed: 58,
      durability: 85,
      power: 100,
      combat: 64
    },
    biography: {
      firstAppearance: "Tales of Suspense #39 (1963)",
      placeOfBirth: "Long Island, New York",
      occupation: "CEO of Stark Industries, Inventor, Avenger",
      alterEgos: "None"
    },
    connections: {
      groupAffiliation: "Avengers, Stark Industries, Illuminati",
      relatives: "Howard Stark (father, deceased), Maria Stark (mother, deceased), Pepper Potts (wife), Morgan Stark (daughter)"
    }
  },
  {
    id: "superman",
    name: "Superman",
    realName: "Clark Kent (Kal-El)",
    publisher: "DC",
    alignment: "good",
    avatar: "https://images.unsplash.com/photo-1569003339405-ea396a5a8a90?q=80&w=400",
    stats: {
      intelligence: 94,
      strength: 100,
      speed: 100,
      durability: 100,
      power: 100,
      combat: 85
    },
    biography: {
      firstAppearance: "Action Comics #1 (1938)",
      placeOfBirth: "Krypton",
      occupation: "Journalist for the Daily Planet, Superhero",
      alterEgos: "None"
    },
    connections: {
      groupAffiliation: "Justice League, Legion of Super-Heroes",
      relatives: "Jor-El (biological father, deceased), Lara Lor-Van (biological mother, deceased), Jonathan Kent (adoptive father), Martha Kent (adoptive mother)"
    }
  },
  {
    id: "wonderwoman",
    name: "Wonder Woman",
    realName: "Diana Prince",
    publisher: "DC",
    alignment: "good",
    avatar: "https://images.unsplash.com/photo-1594744803329-e58b31de215f?q=80&w=400",
    stats: {
      intelligence: 88,
      strength: 100,
      speed: 83,
      durability: 100,
      power: 100,
      combat: 100
    },
    biography: {
      firstAppearance: "All Star Comics #8 (1941)",
      placeOfBirth: "Themyscira",
      occupation: "Amazon Princess, Ambassador, Warrior",
      alterEgos: "None"
    },
    connections: {
      groupAffiliation: "Justice League, Amazons of Themyscira",
      relatives: "Queen Hippolyta (mother), Zeus (father)"
    }
  },
  {
    id: "wolverine",
    name: "Wolverine",
    realName: "Logan (James Howlett)",
    publisher: "Marvel",
    alignment: "good",
    avatar: "https://images.unsplash.com/photo-1620336655055-088d06e36bf0?q=80&w=400",
    stats: {
      intelligence: 63,
      strength: 32,
      speed: 50,
      durability: 100,
      power: 89,
      combat: 100
    },
    biography: {
      firstAppearance: "Incredible Hulk #180 (1974)",
      placeOfBirth: "Alberta, Canada",
      occupation: "Vigilante, Soldier, X-Man",
      alterEgos: "Weapon X"
    },
    connections: {
      groupAffiliation: "X-Men, Avengers, Weapon X, Alpha Flight",
      relatives: "John Howlett Sr. (father, deceased), Elizabeth Howlett (mother, deceased), Laura Kinney / X-23 (clone/daughter)"
    }
  },
  {
    id: "joker",
    name: "Joker",
    realName: "Unknown",
    publisher: "DC",
    alignment: "evil",
    avatar: "https://images.unsplash.com/photo-1601513525393-8393e5518b31?q=80&w=400",
    stats: {
      intelligence: 90,
      strength: 10,
      speed: 25,
      durability: 60,
      power: 45,
      combat: 70
    },
    biography: {
      firstAppearance: "Batman #1 (1940)",
      placeOfBirth: "Gotham City",
      occupation: "Professional Criminal, Agent of Chaos",
      alterEgos: "No alter egos"
    },
    connections: {
      groupAffiliation: "Injustice League, Joker League",
      relatives: "Unknown"
    }
  },
  {
    id: "deadpool",
    name: "Deadpool",
    realName: "Wade Wilson",
    publisher: "Marvel",
    alignment: "neutral",
    avatar: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=400",
    stats: {
      intelligence: 69,
      strength: 35,
      speed: 47,
      durability: 100,
      power: 100,
      combat: 100
    },
    biography: {
      firstAppearance: "New Mutants #98 (1991)",
      placeOfBirth: "Canada",
      occupation: "Mercenary, Assassin",
      alterEgos: "None"
    },
    connections: {
      groupAffiliation: "X-Force, Weapon X, Mercs for Money",
      relatives: "Thomas Wilson (father, deceased), Hailey Wilson (mother, deceased)"
    }
  },
  {
    id: "thanos",
    name: "Thanos",
    realName: "Thanos of Titan",
    publisher: "Marvel",
    alignment: "evil",
    avatar: "https://images.unsplash.com/photo-1501159599894-155982264a55?q=80&w=400",
    stats: {
      intelligence: 100,
      strength: 100,
      speed: 33,
      durability: 100,
      power: 100,
      combat: 80
    },
    biography: {
      firstAppearance: "Iron Man #55 (1973)",
      placeOfBirth: "Titan (Moon of Saturn)",
      occupation: "Conqueror, Nihilist",
      alterEgos: "None"
    },
    connections: {
      groupAffiliation: "Black Order, Titanian Eternals",
      relatives: "A'Lars (father), Sui-San (mother, deceased), Eros (brother), Gamora (adoptive daughter), Nebula (adoptive daughter)"
    }
  },
  {
    id: "thor",
    name: "Thor",
    realName: "Thor Odinson",
    publisher: "Marvel",
    alignment: "good",
    avatar: "https://images.unsplash.com/photo-1559156521-12563f68d6f5?q=80&w=400",
    stats: {
      intelligence: 69,
      strength: 100,
      speed: 83,
      durability: 100,
      power: 100,
      combat: 100
    },
    biography: {
      firstAppearance: "Journey into Mystery #83 (1962)",
      placeOfBirth: "Asgard",
      occupation: "Prince of Asgard, God of Thunder, Avenger",
      alterEgos: "Donald Blake"
    },
    connections: {
      groupAffiliation: "Avengers, Gods of Asgard",
      relatives: "Odin (father, deceased), Gaea (mother), Frigga (adoptive mother), Loki (adoptive brother), Hela (sister)"
    }
  },
  {
    id: "hulk",
    name: "Hulk",
    realName: "Bruce Banner",
    publisher: "Marvel",
    alignment: "good",
    avatar: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=400",
    stats: {
      intelligence: 88,
      strength: 100,
      speed: 63,
      durability: 100,
      power: 98,
      combat: 85
    },
    biography: {
      firstAppearance: "Incredible Hulk #1 (1962)",
      placeOfBirth: "Dayton, Ohio",
      occupation: "Nuclear Physicist, Avenger",
      alterEgos: "Bruce Banner"
    },
    connections: {
      groupAffiliation: "Avengers, Defenders, Pantheon",
      relatives: "Brian Banner (father, deceased), Rebecca Banner (mother, deceased), Betty Ross (wife)"
    }
  },
  {
    id: "captainamerica",
    name: "Captain America",
    realName: "Steve Rogers",
    publisher: "Marvel",
    alignment: "good",
    avatar: "https://images.unsplash.com/photo-1624561172888-ac93c696e10c?q=80&w=400",
    stats: {
      intelligence: 78,
      strength: 30,
      speed: 38,
      durability: 55,
      power: 60,
      combat: 100
    },
    biography: {
      firstAppearance: "Captain America Comics #1 (1941)",
      placeOfBirth: "Brooklyn, New York",
      occupation: "Soldier, Patriot, Avenger",
      alterEgos: "None"
    },
    connections: {
      groupAffiliation: "Avengers, Invaders, S.H.I.E.L.D.",
      relatives: "Joseph Rogers (father, deceased), Sarah Rogers (mother, deceased)"
    }
  },
  {
    id: "doctorstrange",
    name: "Doctor Strange",
    realName: "Stephen Strange",
    publisher: "Marvel",
    alignment: "good",
    avatar: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=400",
    stats: {
      intelligence: 100,
      strength: 10,
      speed: 30,
      durability: 60,
      power: 100,
      combat: 60
    },
    biography: {
      firstAppearance: "Strange Tales #110 (1963)",
      placeOfBirth: "Philadelphia, Pennsylvania",
      occupation: "Sorcerer Supreme, Neurosurgeon (formerly)",
      alterEgos: "None"
    },
    connections: {
      groupAffiliation: "Defenders, Avengers, Midnight Sons, Illuminati",
      relatives: "Eugene Strange (father, deceased), Beverly Strange (mother, deceased), Clea (wife)"
    }
  },
  {
    id: "flash",
    name: "The Flash",
    realName: "Barry Allen",
    publisher: "DC",
    alignment: "good",
    avatar: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=400",
    stats: {
      intelligence: 88,
      strength: 50,
      speed: 100,
      durability: 60,
      power: 100,
      combat: 70
    },
    biography: {
      firstAppearance: "Showcase #4 (1956)",
      placeOfBirth: "Fallville, Iowa",
      occupation: "Forensic Scientist, Crimefighter",
      alterEgos: "None"
    },
    connections: {
      groupAffiliation: "Justice League, Flash Family",
      relatives: "Henry Allen (father, deceased), Nora Allen (mother, deceased), Iris West (wife)"
    }
  },
  {
    id: "lexluthor",
    name: "Lex Luthor",
    realName: "Lex Luthor",
    publisher: "DC",
    alignment: "evil",
    avatar: "https://images.unsplash.com/photo-1589254065878-42c9da997008?q=80&w=400",
    stats: {
      intelligence: 100,
      strength: 15,
      speed: 12,
      durability: 30,
      power: 10,
      combat: 65
    },
    biography: {
      firstAppearance: "Action Comics #23 (1940)",
      placeOfBirth: "Metropolis",
      occupation: "CEO of LexCorp, Scientist, Philanthropist (publicly)",
      alterEgos: "No alter egos"
    },
    connections: {
      groupAffiliation: "Injustice League, LexCorp, Legion of Doom",
      relatives: "Lionel Luthor (father, deceased), Letitia Luthor (mother, deceased)"
    }
  },
  {
    id: "harleyquinn",
    name: "Harley Quinn",
    realName: "Harleen Quinzel",
    publisher: "DC",
    alignment: "neutral",
    avatar: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=400",
    stats: {
      intelligence: 85,
      strength: 20,
      speed: 40,
      durability: 65,
      power: 40,
      combat: 80
    },
    biography: {
      firstAppearance: "Batman: The Animated Series (1992)",
      placeOfBirth: "Brooklyn, New York",
      occupation: "Psychiatrist (formerly), Criminal, Vigilante",
      alterEgos: "Harleen Quinzel"
    },
    connections: {
      groupAffiliation: "Suicide Squad, Gotham City Sirens",
      relatives: "Nick Quinzel (father), Sharon Quinzel (mother)"
    }
  },
  {
    id: "venom",
    name: "Venom",
    realName: "Eddie Brock",
    publisher: "Marvel",
    alignment: "neutral",
    avatar: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=400",
    stats: {
      intelligence: 75,
      strength: 70,
      speed: 55,
      durability: 85,
      power: 85,
      combat: 85
    },
    biography: {
      firstAppearance: "Amazing Spider-Man #299 (1988)",
      placeOfBirth: "San Francisco, California",
      occupation: "Vigilante, Journalist",
      alterEgos: "None"
    },
    connections: {
      groupAffiliation: "Savage Avengers, Lethal Protectors",
      relatives: "Carl Brock (father), Janine Brock (mother, deceased)"
    }
  }
];
