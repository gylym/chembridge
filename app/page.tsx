import type { Metadata } from "next";
import { headers } from "next/headers";
import ChemBridgeApp from "./ChemBridgeApp";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const ogImage = `${protocol}://${host}/og.png`;
  return {
    title: "ChemBridge — Интерактивті химия платформасы",
    description:
      "Химияны зертте, тәжірибе жаса және білімді байланыстыр. Сабақтар, 118 элемент, реакциялар, мини-зертхана және тесттер.",
    openGraph: {
      title: "ChemBridge",
      description: "Химияны зертте. Тәжірибе жаса. Білімді байланыстыр.",
      type: "website",
      locale: "kk_KZ",
      images: [{ url: ogImage, width: 1200, height: 630, alt: "ChemBridge интерактивті химия платформасы" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "ChemBridge",
      description: "Химияны зертте. Тәжірибе жаса. Білімді байланыстыр.",
      images: [ogImage],
    },
  };
}

export default function HomePage() {
  return <ChemBridgeApp />;
}
