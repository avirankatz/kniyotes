export function nanoid(length = 6) {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let id = '';
  for (let i = 0; i < length; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}
