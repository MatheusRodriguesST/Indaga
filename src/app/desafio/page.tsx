import type { Metadata } from "next";
import { QuizApp } from "@/components/quiz/QuizApp";

export const metadata: Metadata = { title: "Desafio" };

export default async function DesafioPage({ searchParams }: PageProps<"/desafio">) {
  const sp = await searchParams;
  return <QuizApp campaign={null} autoAnonymous={sp.anonimo === "1"} />;
}
