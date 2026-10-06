export type SortValue = string | number | null | undefined;
 
export const compareValues = (a: SortValue, b: SortValue): number => {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
 
  if (typeof a === "number" && typeof b === "number") {
    return a - b;
  }
 
  return String(a).localeCompare(String(b), undefined, {
    numeric: true,
    sensitivity: "base",
  });
};
 
export const sortItems = <T,>(
  items: T[],
  getValue: (item: T) => SortValue,
  direction: "ascending" | "descending" = "ascending",
): T[] => {
  const factor = direction === "descending" ? -1 : 1;
 
  return [...items].sort(
    (a, b) => factor * compareValues(getValue(a), getValue(b)),
  );
};
 