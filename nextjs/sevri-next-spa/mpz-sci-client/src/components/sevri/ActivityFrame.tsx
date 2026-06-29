import { Activity } from '@/types/sevri'
import Link from 'next/link'
import React from 'react'

function ActivityFrame({ activity, link }: { activity: Activity, link: string }) {
    return (
        <Link
            href={link}
            className={`bg-white hover:bg-slate-200 flex items-center p-4 mb-4 rounded-md hover:scale-105 ease-in-out duration-100 text-balance text-primary-800 font-semibold shadow-sm shadow-dark_primary-900 border-b-8 border-primary-400 hover:border-primary-800`}
        >
            <div className="flex flex-row justify-between items-center w-full">
                <div className="flex flex-col">
                    <h1 className="text-xl">{activity.title}</h1>
                    <p className='text-xs italic text-primary-600'>{activity.subtitle}</p>
                </div>
            </div>
        </Link>
    )
}

export default ActivityFrame
