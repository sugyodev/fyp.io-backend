/**
 * String/Number encoding/decoding utilities
 *
 * The goal is for inputs to return values that are equivalent
 * to their python counterparts in `itsdangerous`
 */

import {
	base64Decode,
	base64DecodeInt,
	base64Encode,
	base64EncodeInt,
} from "./internal/Base64";

// import { BadData } from './error'

const BASE64_LETTERS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const BASE64_NUMBERS = "0123456789";
const BASE64_SYMBOLS = "-_=";

const BASE64_ALPHABET = [
	...BASE64_LETTERS,
	...BASE64_NUMBERS,
	...BASE64_SYMBOLS,
].join("");

const BASE64_SYMBOL_REPLACEMENTS: { [chr: string]: string } = {
	"+": "-",
	"/": "_",
	"-": "+",
	_: "/",
	"=": "",
};
const BASE64_TO_URL_SAFE_RE = /[+/=]/g;
const BASE64_FROM_URL_SAFE_RE = /[-_]/g;

const replaceSymbol = (symbol: string) => BASE64_SYMBOL_REPLACEMENTS[symbol];
const replaceSymbols = (regex: RegExp) => (value: string) =>
	value.replace(regex, replaceSymbol);

const makeURLSafe = replaceSymbols(BASE64_TO_URL_SAFE_RE);
const makeURLUnsafe = replaceSymbols(BASE64_FROM_URL_SAFE_RE);

/**
 * Encodes a string (ascii or utf8) to a URL-safe ascii base64 string
 * @param {string} value
 * @return {string}
 */
export const URLSafeBase64Encode = (value: string): string =>
	makeURLSafe(base64Encode(value));

/**
 * Decodes a URL-safe ascii base64 string to a string (ascii or utf8)
 * @param {string} value
 * @return {string}
 */
export const URLSafeBase64Decode = (value: string): string =>
	base64Decode(makeURLUnsafe(value));

/**
 * Encodes a number to a URL-safe ascii base64 string
 * @param {number} value
 * @return {string}
 */
export const URLSafeBase64EncodeInt = (value: number): string =>
	makeURLSafe(base64EncodeInt(value));

/**
 * Decodes a URL-safe ascii base64 string to a number
 * @param {string} value
 * @return {number}
 */
export const URLSafeBase64DecodeInt = (value: string): number =>
	base64DecodeInt(makeURLUnsafe(value));

/**
 * Checks if `byte` is present within the standard ascii-encoded base64 'alphabet'
 * @param {string} byte
 * @return {boolean}
 */
export const base64AlphabetIncludes = (byte: string): boolean =>
	BASE64_ALPHABET.includes(byte);
