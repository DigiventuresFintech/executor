function RulesEngine(rules) {
  return !rules
    .map(({ a, comparision, b }) => check(a, b, comparision))
    .includes(false);
}

function check(a, b, comparision) {
  if (a && isNumber(a)) {
    a = parseInt(a);
  }

  if (b && isNumber(b)) {
    b = parseInt(b);
  }

  switch (comparision) {
    case "existsTrue":
      return typeof a != "undefined" && !!a === true;
    case "existsFalse":
      return typeof a != "undefined" && !!a === false;
    case "isUndefined":
      return typeof a == "undefined";
    case "higher":
      if (!a) a = 0;
      return a && a > b;
    case "greaterequal":
      if (!a) a = 0;
      return a && a >= b;
    case "minor":
      if (!a) a = 0;
      return a && a < b;
    case "lessequal":
      if (!a) a = 0;
      return a && a <= b;
    case "equal":
      if (!a) a = 0;
      return a && a == b;
    case "different":
      return a && a != b;
    case "regex":
      if (!a) return false;
      const reg = new RegExp(b, "i");
      const match = a.match(reg);
      if (match) return match.length > 0;
      else return false;
    default:
      return false;
  }
}

function isEmailAddress(str) {
  const pattern = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return pattern.test(str);
}

function isNotEmpty(str) {
  const pattern = /\S+/;
  return pattern.test(str);
}

function isNumber(str) {
  const pattern = /^\d+$/;
  return pattern.test(str);
}

function isSame(str1, str2) {
  return str1 === str2;
}

module.exports = RulesEngine;
