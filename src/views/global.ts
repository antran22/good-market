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

function _createHandler(divisor, noun, restOfString) {
  return function (diff) {
    const n = Math.floor(diff / divisor);
    const pluralizedNoun = noun + (n > 1 ? "s" : "");
    return "" + n + " " + pluralizedNoun + " " + restOfString;
  };
}

const _formatters = [
  {
    threshold: -31535999,
    handler: _createHandler(-31536000, "year", "from now"),
  },
  {
    threshold: -2591999,
    handler: _createHandler(-2592000, "month", "from now"),
  },
  {
    threshold: -604799,
    handler: _createHandler(-604800, "week", "from now"),
  },
  {
    threshold: -172799,
    handler: _createHandler(-86400, "day", "from now"),
  },
  {
    threshold: -86399,
    handler: () => "tomorrow",
  },
  {
    threshold: -3599,
    handler: _createHandler(-3600, "hour", "from now"),
  },
  {threshold: -59, handler: _createHandler(-60, "minute", "from now")},
  {
    threshold: -0.9999,
    handler: _createHandler(-1, "second", "from now"),
  },
  {
    threshold: 1,
    handler: () => "now",
  },
  {threshold: 60, handler: _createHandler(1, "second", "ago")},
  {threshold: 3600, handler: _createHandler(60, "minute", "ago")},
  {threshold: 86400, handler: _createHandler(3600, "hour", "ago")},
  {
    threshold: 172800,
    handler: () => "yesterday",
  },
  {threshold: 604800, handler: _createHandler(86400, "day", "ago")},
  {threshold: 2592000, handler: _createHandler(604800, "week", "ago")},
  {
    threshold: 31536000,
    handler: _createHandler(2592000, "month", "ago"),
  },
  {
    threshold: Infinity,
    handler: _createHandler(31536000, "year", "ago"),
  },
];

export function prettyDate(date) {
  const diff = (new Date().getTime() - new Date(date).getTime()) / 1000;
  for (let i = 0; i < _formatters.length; i++) {
    if (diff < _formatters[i].threshold) {
      return _formatters[i].handler(diff);
    }
  }
  throw new Error("exhausted all formatter options, none found"); //should never be reached
}
