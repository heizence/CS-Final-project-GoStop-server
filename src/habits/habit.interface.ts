interface Habit {
  verifiedId: string;
  title: string;
  description: string;
  difficulty: number;
  alarm?: string;
  coin?: number;
  point?: number;
  health?: number;
  positive: boolean;
  completed: boolean;
}

export default Habit;
