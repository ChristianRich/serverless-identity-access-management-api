// TODO Replace with npm type-fest https://github.com/sindresorhus/type-fest/blob/HEAD/source/basic.d.ts
export type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONObject
  | JSONArray;

interface JSONObject {
  [key: string]: JSONValue;
}

type JSONArray = Array<JSONValue>;
