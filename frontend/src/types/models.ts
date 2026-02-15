/** Player profile */
export interface Profile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  gender: string;
  dob: string;
  centerName: string;
  createdAt: string;
}

/** Training session */
export interface TrainingSession {
  id: string;
  playerId: string;
  trainerName: string;
  startTime: string;
  endTime: string;
  numberOfBalls: number;
  bestStreak: number;
  numberOfGoals: number;
  score: number;
  avgSpeedOfPlay: number;
  numberOfExercises: number;
}

/** Appointment */
export interface Appointment {
  id: string;
  playerId: string;
  trainerName: string;
  startTime: string;
  endTime: string;
}

/** Single entry in the player leaderboard */
export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  firstName: string;
  lastName: string;
  centerName: string;
  totalSessions: number;
  avgScore: number;
  totalGoals: number;
  bestStreak: number;
  totalBalls: number;
  avgSpeedOfPlay: number;
}

/** Time slot for scheduling */
export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

/** A trainer's schedule for a specific date */
export interface TrainerSchedule {
  trainerName: string;
  date: string;
  slots: TimeSlot[];
}

/** Player dashboard summary */
export interface PlayerSummary {
  totalSessions: number;
  avgScore: number;
  bestStreakRecord: number;
  lastSession: {
    id: string;
    date: string;
    score: number;
    trainerName: string;
  } | null;
  last30Days: {
    totalSessions: number;
    totalBalls: number;
    avgScore: number;
    totalGoals: number;
  };
}
