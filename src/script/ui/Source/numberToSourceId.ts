import type { sourceId } from "./SourceTypes";

const sourceIdValues = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];

const radix = sourceIdValues.length;
export const numberToSourceId = (
  n: number | { toNumber(): number }
): sourceId => {
  if (typeof n === "number") {
    const sb = new Array<string>();

    while (n > 0) {
      const r = n % radix;
      n = Math.floor(n / radix);
      sb.push(sourceIdValues[r]!);
    }

    return sb.reverse().join("");
  } else {
    return numberToSourceId(n.toNumber());
  }
};
