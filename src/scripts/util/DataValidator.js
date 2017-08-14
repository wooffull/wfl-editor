"use strict";

/**
 * Converts string to number (integer).
 *
 * If number is valid, return that number;
 * Otherwise if not a number, return default value.
 */
function stringToIntegerOrDefault(string, defaultValue) {
  let num = parseInt(string);
  return (isNaN(num) ? defaultValue : num);
}

/**
 * Converts string to number.
 *
 * If number is valid, return that number;
 * Otherwise if not a number, return default value.
 */
function stringToNumberOrDefault(string, defaultValue) {
  let num = parseFloat(string);
  return (isNaN(num) ? defaultValue : num);
}

/**
 * Converts string to number.
 *
 * If number is in the given range, return that number;
 * Otherwise clamp it to one of the ends (min or max) and return that number; 
 * Otherwise if not a number, return default value.
 */
function stringToClampedNumberRangeOrDefault(string, min, max, defaultValue) {
  let num = parseFloat(string);
  return (isNaN(num)
          ? defaultValue
          : Math.min(max, Math.max(min, num)));
}

/**
 * Converts string to number.
 *
 * If number is in the given range, return that number;
 * Otherwise if out of range or not a number, return default value.
 */
function stringToMatchedNumberRangeOrDefault(string, min, max, defaultValue) {
  let num = parseFloat(string);
  return (isNaN(num) || num < min || num > max
          ? defaultValue
          : Math.min(max, Math.max(min, num)));
}

/**
 * Allows all keys that can create integers to pass through, and special 
 * functional keys that aren't letters or spacebar (like arrow keys, enter, 
 * delete, backspace, etc.) 
 *
 * Note: For use with ui/InputText.js
 */
function keyValidatorForIntegers(initialText, keyPressed) {
  return keyPressed.length > 1 ||
         /^-?(\d+)?-?$/.test(initialText + keyPressed);
}

/**
 * Allows all keys that can create positive integers to pass through, and 
 * special that aren't letters or spacebar (like arrow keys, enter, delete, 
 * backspace, etc.) 
 *
 * Note: For use with ui/InputText.js
 */
function keyValidatorForPositiveIntegers(initialText, keyPressed) {
  return keyPressed.length > 1 ||
         /^(\d+)?$/.test(initialText + keyPressed);
}


/**
 * Allows all keys that can create a number to pass through, and special 
 * functional keys that aren't letters or spacebar (like arrow keys, enter, 
 * delete, backspace, etc.) 
 *
 * Note: For use with ui/InputText.js
 */
function keyValidatorForNumbers(initialText, keyPressed) {
  return keyPressed.length > 1 ||
         /^-?(\d+)?\.?(\d+)?-?$/.test(initialText + keyPressed);
}

/**
 * Allows all keys that can create a positive number to pass through, and 
 * special functional keys that aren't letters or spacebar (like arrow keys, 
 * enter, delete, backspace, etc.) 
 *
 * Note: For use with ui/InputText.js
 */
function keyValidatorForPositiveNumbers(initialText, keyPressed) {
  return keyPressed.length > 1 ||
         /^(\d+)?\.?(\d+)?$/.test(initialText + keyPressed);
}

module.exports = {
  stringToIntegerOrDefault: stringToIntegerOrDefault,
  stringToNumberOrDefault: stringToNumberOrDefault,
  stringToClampedNumberRangeOrDefault: stringToClampedNumberRangeOrDefault,
  stringToMatchedNumberRangeOrDefault: stringToMatchedNumberRangeOrDefault,
  
  keyValidatorForIntegers: keyValidatorForIntegers,
  keyValidatorForPositiveIntegers: keyValidatorForPositiveIntegers,
  keyValidatorForNumbers: keyValidatorForNumbers,
  keyValidatorForPositiveNumbers: keyValidatorForPositiveNumbers,
};