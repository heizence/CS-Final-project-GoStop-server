interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  level: number;
  coin: number;
  point: number;
  health: number;
  status: boolean;
  userCode: number;
  refreshToken: string;
}

export default User;
