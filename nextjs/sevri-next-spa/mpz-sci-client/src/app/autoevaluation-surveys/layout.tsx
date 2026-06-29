'use client'
import Card from "@/components/globals/card/Card";
import { useShared } from "@/hooks/useShared";
import { useSurvey } from "@/hooks/useSurvey";
import { useSurveyState } from "@/store/matureModel/surveyStore";
import Link from "next/link";
import { AiTwotoneFund } from "react-icons/ai";
import { BiArrowBack } from "react-icons/bi";




export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useSurvey()
  useShared()
  const { isAutoEvaluationFinished } = useSurveyState()
 
  if (isAutoEvaluationFinished) return (<div className="block justify-center h-full mt-52">
    <Card icon={<AiTwotoneFund size={30} color="green" />} title="Evaluación completada" description="Ya completaste esta evaluación" />
    <div className="flex justify-center mt-2">
      <Link href={"/menu-Evaluations"} className="px-4 py-2 bg-primary-700 text-white rounded hover:bg-primary-800 transition duration-300"><BiArrowBack /></Link>
    </div>
  </div>)
  return (
    <main className="bg-gray-100">{children}</main>
  );
}
