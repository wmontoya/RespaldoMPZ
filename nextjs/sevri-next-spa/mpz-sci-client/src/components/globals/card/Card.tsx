import React from 'react'

function Card({ title, description, icon }: { title: string, description: string, icon?: React.ReactNode }) {
    return (
        <div className="mx-auto max-w-lg rounded-lg border border-stone bg-stone-100 p-4 shadow-lg sm:p-6 lg:p-8">
            <div className="flex gap-2 items-center">
                <h2 className="font-medium sm:text-xl text-emerald-600">{title}</h2>
                {icon}
            </div>
            <p className="mt-4 text-gray-600">
                {description}
            </p>
        </div>

    )
}

export default Card