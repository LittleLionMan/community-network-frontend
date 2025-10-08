export interface AchievementCreate {
  user_id: number;
  achievement_type: string;
  points?: number;
  reference_type?: string | null;
  reference_id?: number | null;
}

export interface Achievement {
  id: number;
  user_id: number;
  achievement_type: string;
  points: number;
  reference_type: string | null;
  reference_id: number | null;
  awarded_by_user_id: number;
  created_at: string;
}

export interface LeaderboardEntry {
  user_id: number;
  display_name: string;
  profile_image_url: string | null;
  total_points: number;
  achievement_count: number;
}

export interface LeaderboardResponse {
  achievement_type: string;
  total_points_awarded: number;
  total_achievements: number;
  unique_users: number;
  leaderboard: LeaderboardEntry[];
}

export interface UserAchievementStats {
  user_id: number;
  total_points: number;
  achievements_by_type: Record<string, number>;
  total_achievements: number;
}
