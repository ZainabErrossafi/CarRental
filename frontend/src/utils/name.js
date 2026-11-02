// Support names in any language, including accents and common separators.
export const sanitizeName = (value) => value.replace(/[^\p{L}\p{M} '’-]/gu, "");

export const sanitizeUsername = (value) => value.replace(/[^\p{L}\p{M}0-9_.-]/gu, "");
