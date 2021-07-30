export function brief(string, length) {
  const stringNormSpace = string.replace(/\s+/, " ");
  if (stringNormSpace.length < length) {
    return stringNormSpace;
  } else {
    return stringNormSpace.slice(0, length) + "...";
  }
}

export const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});
