export interface UserSchema {
  bal: number;
  cards: number[];
  inventory: string[];
  dateDrawn?: number;
  streak: number;
}

export enum BalanceMutationType {
  ADD = "add",
  SUBTRACT = "subtract",
  SET = "set",
}
