export function useCategories() {
  return {
    categories: ["Food", "Transport", "Entertainment", "Utilities", "Other"],
    getCategory: (name: string) => name,
  };
}
