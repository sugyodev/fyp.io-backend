/**
 * Base64 / binary data / utf8 strings utilities
 *
 * Based on code from https://stackoverflow.com/a/43271130
 *
 * @author Chris Ashurst
 */

import { TextDecoder, TextEncoder } from "util";
import { BufferLike } from "../../Types";

/** Approximation of window.atob (convert ascii to bytes) */
const atob = (value: string) => Buffer.from(value, "base64").toString("binary");

/** Convert unicode 'ascii' to bytes */
const u_atob = (ascii: string) =>
	Uint8Array.from(atob(ascii), (char) => char.charCodeAt(0));

/** Approximation of window.btoa (convert bytes to ascii) */
const btoa = (value: BufferLike) =>
	(
		(value instanceof Buffer && value) ||
		Buffer.from(value.toString(), "binary")
	).toString("base64");

/** Convert bytes to unicode 'ascii' */
const u_btoa = (buffer: Buffer | Uint8Array) =>
	btoa(String.fromCharCode(...buffer));

const encodeStr = (value: string) => new TextEncoder().encode(value);
const decodeStr = (value: ArrayBuffer | NodeJS.ArrayBufferView) =>
	new TextDecoder().decode(value);

/** Encodes a string (ascii or utf8) to an ascii base64 string */
export const base64Encode = (value: string) => u_btoa(encodeStr(value));

/** Decodes an ascii base64 string to a string (ascii or utf8) */
export const base64Decode = (value: string) => decodeStr(u_atob(value));

const padHex = (value: string) =>
	`${(value.length % 2 === 1 && "0") || ""}${value}`;
const encodeInt = (value: string | number) => {
	if (typeof value === "string") value = parseInt(value);

	return Buffer.from(padHex(value.toString(16)), "hex");
};

const decodeInt = (value: string | Uint8Array | Buffer) =>
	parseInt(Buffer.from(value).toString("hex"), 16);

/** Encodes a number to an ascii base64 string */
export const base64EncodeInt = (value: string | number) => u_btoa(encodeInt(value));

/** Decodes an ascii base64 string to a number */
export const base64DecodeInt = (value: string) => decodeInt(u_atob(value));
