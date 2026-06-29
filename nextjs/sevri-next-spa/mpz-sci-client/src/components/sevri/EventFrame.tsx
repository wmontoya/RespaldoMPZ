import { Event } from '@/types/sevri'
import Link from 'next/link'
import React from 'react'

function EventFrame({ event, link, index, onClick }: { event: Event, link?: string, index: number, onClick?: () => void, handleDelete?: () => void }) {
    return (
        <Link
            onClick={onClick}
            href={link ?? ""}
            className={`bg-white hover:bg-slate-200 h-40 place-content-center rounded-md  hover:scale-105 ease-in-out duration-100  text-balance text-primary-800 font-semibold shadow-sm shadow-dark_primary-900 border-b-8 border-primary-400 hover:border-primary-800`}
        >
            <div className="flex flex-row justify-between items-center px-5 ">
                <div className="flex flex-col">
                    <div className='flex justify-between'>
                        <h1 className="text-2xl">{`Evento ${index + 1}`}</h1>
                    </div>
                    <p className='text-xs italic text-primary-600 overflow-hidden line-clamp-5'>
                        {event.description}</p>
                </div>
            </div>
        </Link>
    )
}

export default EventFrame