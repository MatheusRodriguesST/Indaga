import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { QuizApp } from "@/components/quiz/QuizApp";

export const metadata: Metadata = { title: "Desafio" };

/**
 * /desafio/001, /desafio/evento-x … — cada QR Code pode apontar para uma
 * campanha. Hoje a campanha só é registrada na sessão (para estatística);
 * no futuro pode filtrar a coleção de perguntas.
 */
export default async function CampanhaPage({ params, searchParams }: PageProps<"/desafio/[campanha]">) {
  const { campanha } = await params;
  const sp = await searchParams;
  if (!/^[a-z0-9-]{1,40}$/i.test(campanha)) notFound();
  return <QuizApp campaign={campanha.toLowerCase()} autoAnonymous={sp.anonimo === "1"} />;
}
