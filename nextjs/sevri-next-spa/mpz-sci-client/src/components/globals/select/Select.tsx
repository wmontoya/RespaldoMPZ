import { useField } from 'formik';
import React, { SelectHTMLAttributes } from 'react'
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
}
function Select({ label, ...selectProps }: SelectProps) {
    const [field, meta] = useField<string>(selectProps.name || "");
    return (
        <div className="flex">
            <div className='block w-full'>
                <label htmlFor={field.name} >
                    {label}
                </label>
                <select {...field} {...selectProps} className={`p-2 w-full bg-gray-100 shadow-md hover:bg-gray-300 transition-all cursor-pointer`} />
            </div>
            {meta.touched && meta.error && <div className="border-red-600 text-red-500">*</div>}
        </div>
    )
}

export default Select