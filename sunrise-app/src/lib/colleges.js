// src/app/lib/colleges.js
export async function getColleges() {
  // Example: fetch from backend API or return static array
  const res = await fetch("http://localhost:3000/colleges");
  const data = await res.json();
  return data;
}
