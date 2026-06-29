import React from 'react';

interface InputFieldProps {
  id: string;
  name: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

export const InputField = ({ id, name, label, type = 'text', value, onChange, error }: InputFieldProps) => (
  <div>
    <label htmlFor={id} className="block my-2 text-sm font-medium text-gray-900 dark:text-white">
      {label}
    </label>
    <input
      type={type}
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
    />
    {error && <div className="text-red-500">{error}</div>}
  </div>
);
