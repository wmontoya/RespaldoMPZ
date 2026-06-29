import React, { ButtonHTMLAttributes } from 'react'
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    direction: ButtonDirection
    tooltipText?: string
}

type ButtonDirection = 'left' | 'right' | 'center'
function Button({ children, direction = 'center', tooltipText = '', onClick, ...props }: ButtonProps) {
    const directionClass = direction === 'right' ? 'hover:translate-x-3' : direction === 'left' ? 'hover:-translate-x-3' : 'hover:-translate-y-1'
    return (
        <div className={`group relative ${props.disabled && "opacity-60"}`}>
            <button
                disabled={props.disabled}
                type={props.type}
                onClick={onClick}
                className={`flex items-center bg-primary-600 text-white gap-1 px-4 py-2  cursor-pointer font-semibold tracking-widest rounded-md hover:bg-primary-500 duration-300 hover:gap-2 ${directionClass}`}
            >
                {children}
            </button>
            {tooltipText !== '' && <div
                className="absolute rounded-lg opacity-0 group-hover:opacity-100 group-hover:-translate-y-[-0%] -translate-y-[-50%] duration-500 group-hover:delay-500 skew-y-[20deg] group-hover:skew-y-0 shadow-md"
            >
                {!props.disabled && <div className="bg-white rounded-lg flex items-center gap-1 p-2">
                    <span>{tooltipText}</span>
                </div>}

            </div>}

        </div>
    )
}

export default Button