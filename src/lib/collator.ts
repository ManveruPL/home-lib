// Polish collation also orders English correctly and puts "Ł" after "L" rather than after "Z".
const collator = new Intl.Collator(['pl', 'en'], { sensitivity: 'base', numeric: true });

export function compareText(a: string, b: string): number {
  return collator.compare(a, b);
}
