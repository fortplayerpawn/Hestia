export default async function authenticate(
  headers: Headers,
  signature: string
): Promise<any> {
  if (
    !headers.get("Authorization") ||
    !headers.get("Authorization")?.includes("Epic-Signed") ||
    !headers.get("Authorization")?.includes("mms-player")
  )
    return new Response("Unauthorized request", { status: 401 });

  const authorization = headers.get("Authorization");
}
