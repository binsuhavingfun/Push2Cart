import Link from "next/link";

export default function NotFound() {
  return (
    <div className="pixel-border pixel-panel mx-auto max-w-2xl p-8 text-center">
      <p className="pixel-heading text-sm text-white">Level Not Found</p>
      <p className="mt-4 text-white/70">
        The page you are looking for slipped behind the arcade cabinet.
      </p>
      <Link href="/" className="pixel-border mt-6 inline-flex px-4 py-3 text-xs">
        Return Home
      </Link>
    </div>
  );
}
