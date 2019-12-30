// for test : user, alarm, date => dataType string
interface Todo {
  verifiedId: string;
  title: string;
  description: string;
  difficulty: number;
  dateStart: string;
  dateEnd: string;
  alarm?: string;
  coin?: number;
  point?: number;
  health?: number;
  gallery?: [string];
  completed: boolean;
}

export default Todo;
