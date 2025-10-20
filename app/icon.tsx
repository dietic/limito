export const runtime = "edge";

export default function Icon() {
  // Redirect to static icon.svg for app icon requests
  return new Response(null, {
    status: 302,
    headers: { Location: "/icon.svg" },
  });
}
