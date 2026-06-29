import React from 'react'
import './Checkbox.css'

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    id: string
}
function Checkbox({ id, ...props }: CheckboxProps) {
    return (
        <div className="checkbox-wrapper-10">
            <input onChange={props.onChange} checked={props.checked} type="checkbox" id={id} className="tgl tgl-flip" />
            <label htmlFor={id} data-tg-on="Si" data-tg-off="No" className="tgl-btn"></label>
        </div>
    )
}

export default Checkbox