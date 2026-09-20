export function avatarColor(str: string) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 360
  return `radial-gradient(circle at 30% 25%, hsl(${h} 80% 68%), hsl(${(h + 40) % 360} 70% 42%))`
}
