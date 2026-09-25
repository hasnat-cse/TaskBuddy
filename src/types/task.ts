export type Task = {
  id: string;
  title: string;
  completed: boolean;
  date: string;
  carriedForwardFrom?: string;
  carryForwardDisabled?: boolean;
};
