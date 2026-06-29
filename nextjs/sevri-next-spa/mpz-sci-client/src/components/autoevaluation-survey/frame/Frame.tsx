import { useGlobalState } from '@/store/globalState'
import { Axie } from '@/types/autoevaluationSurvey'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

function Frame({ axie, link }: { axie: Axie, link: string }) {
    const { department_id } = useGlobalState()
    const progressByAxie = axie.sections.reduce((acc, section) => {
        const progressBySection = section.questions.reduce((acc, question) => {
            const answer = question.answers.find(answer => answer.department_id === department_id && answer.axie_id === axie.id)
            if (answer) {
                return acc + 1
            }
            return acc
        }, 0)
        return acc + ((progressBySection / section.questions.length) * 100)
    }, 0) / axie.sections.length
    return (
        <Link
            href={link}
            className={`bg-white hover:bg-slate-200 h-40 place-content-center rounded-md  hover:scale-105 ease-in-out duration-100  text-balance text-primary-800 font-semibold shadow-sm shadow-dark_primary-900 border-b-8 border-primary-400 hover:border-primary-800`}
        >
            <div className="flex flex-row justify-between items-center px-5">
                <div className="flex flex-col">
                    <h1 className="text-2xl">{axie.title}</h1>
                    <p className='text-xs italic text-primary-600'>{axie.description}</p>
                </div>
                <div className='flex flex-col items-center justify-center'>
                    <Image
                        src={`${progressByAxie === 100 ? "/icons/survey-green.svg" : progressByAxie === 0 ? "/icons/survey-blue.svg" : "/icons/survey-yellow.svg"}`}
                        alt="/icons/survey-blue.svg"
                        height={50}
                        width={50}
                    />
                    <p className='text-sm'>{progressByAxie.toFixed(2)}%</p>
                </div>
            </div>
        </Link>
    )
}

export default Frame