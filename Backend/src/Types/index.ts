export type Poll = {
  id: string;
  question: string;
  options: PollOption[];
  createdAt: Date;
};

export type PollOption = {
  id: string;
  text: string;
  votes: number;
};
