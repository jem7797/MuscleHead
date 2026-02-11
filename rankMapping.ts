export const RANK_NAMES: Record<number, string> = {
   1: "Motivated",
   2: "Active",
   3: "Consistent",
   4: "Dedicated",
   5: "Trained",
   6: "Athletic",
   7: "Plate Pusher",
   8: "Metal Head",
   9: "Steel Stacker",
   10: "Chalked",
   11: "Powerhouse",
   12: "Advanced",
   13: "Elite",
   14: "Juggernaut",
   15: "Titan",
   16: "Ironborn",
   17: "Gym Rat",
   18: "Olympian",
   19: "Herculean",
};

export const getNameForRank = (level: number) =>
  RANK_NAMES[level] ?? `Level ${level}`;