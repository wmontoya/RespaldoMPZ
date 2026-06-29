import React from 'react'

function Card({ title, description, onClick }: { title: string, description: string, onClick: () => void }) {
    return (
        <div onClick={onClick} className={`bg-white cursor-pointer hover:bg-slate-200 h-40 place-content-center rounded-md  hover:scale-105 ease-in-out duration-100  text-balance text-primary-800 font-semibold shadow-sm shadow-dark_primary-900 border-b-8 border-primary-400 hover:border-primary-800`}
        >
            <div className="flex flex-row justify-between items-center px-5 ">
                <div className="flex flex-col">
                    <div className='flex justify-between'>
                        <h1 className="text-2xl cursor-pointer">{title}</h1>
                    </div>
                    <p className='text-xs italic text-primary-600 overflow-hidden line-clamp-5 cursor-pointer'>
                        {description}</p>
                </div>
            </div>
        </div>
    )
}

export default Card