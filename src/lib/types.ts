/** Shape of a tracked person as sent over the API. */
export interface Person {
  id: number;
  name: string;
  repsLeft: number;
  plus3: number;
  minus3: number;
  createdAt: string;
}
