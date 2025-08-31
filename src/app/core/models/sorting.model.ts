export type SortDirection = 'asc' | 'desc';

export interface Sort<T> {
  /** The property of T to sort by. */
  property: keyof T;
  /** The direction of the sort. */
  direction: SortDirection;
}
