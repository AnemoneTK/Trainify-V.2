export function getCookies(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(";").shift();
    return cookieValue || null; // ถ้า cookieValue เป็น undefined จะคืนค่า null
  }
  return null; // ถ้าไม่พบ cookie จะคืนค่า null
}
