export const generateId = (characters, length) => {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

export const rgbToRgba = (color, opacity) => {
  const rgb = color.match(/\d+/g);
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${opacity})`;
};

export default {
  generateId,
  rgbToRgba,
};
