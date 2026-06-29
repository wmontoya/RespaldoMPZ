import React, { useEffect } from 'react';
import { useField, useFormikContext } from 'formik';
import { Autocomplete, AutocompleteItem } from '@nextui-org/autocomplete';
interface CustomAutoCompleteProps<T> {
    label: string;
    name: string;
    options: { value: string; label: string }[];
    className?: string;
    placeholder?: string;
    allowCustomValue?: boolean;
}

const CustomAutoComplete = <T,>({ label, name, options, className, placeholder, allowCustomValue }: CustomAutoCompleteProps<T>) => {
    const { setFieldValue, values } = useFormikContext<Record<string, any>>();
    const [field, meta] = useField(name);
    const onSelectionChange = (key: React.Key | null) => {
        if (key !== null) {
            setFieldValue(name, key.toString());
        }
    };
    const onInputChange = (value: string) => {
        setFieldValue(name, value);
    }
    return (
        <div className={className}>
            <label>{label}</label>
            <Autocomplete
                allowsCustomValue={allowCustomValue}
                placeholder={placeholder}
                value={field.value || ""}
                inputValue={field.value || ""}
                selectedKey={field.value || ""}
                onInputChange={onInputChange}
                onSelectionChange={onSelectionChange}
            >
                {options.map((item) => (
                    <AutocompleteItem key={item?.value} value={item?.value}>
                        {item?.label}
                    </AutocompleteItem>
                ))}
            </Autocomplete>
            {meta.touched && meta.error ? <div className="text-red-500 text-xs mt-1"
            >{meta.error}</div> : null}
        </div>
    );
};

export default CustomAutoComplete;