
export function buildWeightFieldSortChecker(field) {
  return (a, b) => {
    if (a.weight != undefined && b.weight != undefined && a.weight != b.weight) {
      return a.weight > b.weight ? 1 : (a.weight == b.weight ? 0 : -1)
    }

    return a[field].localeCompare(b[field])
  }
}
