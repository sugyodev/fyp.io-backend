/**
 * Returns the number of seconds since the epoch
 * @return {number} Seconds since the epoch
 */
const toTimestamp = (): number => Math.floor(Date.now() / 1000);

/**
 * Returns a new `Date` instance for the timestamp
 * @param {number} timestamp - Seconds since the epoch
 * @return {Date}
 */
const fromTimestamp = (timestamp: number): Date => new Date(timestamp * 1000);

export default { toTimestamp, fromTimestamp };
