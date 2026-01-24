// src/utils.js
export const toSlug = (str) => {
  if (!str) return '';
  str = str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
  str = str.replace(/[đĐ]/g, 'd').replace(/([^0-9a-z-\s])/g, '').replace(/(\s+)/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
  return str;
};