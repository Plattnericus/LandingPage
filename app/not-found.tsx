import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found">
      <p>404</p>
      <h1>This page is not deployed.</h1>
      <Link href="/">Back to Nexor</Link>
    </main>
  );
}
