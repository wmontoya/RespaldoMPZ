import React from 'react';

interface ContactInfoProps {
    formData: { email: string; phone: string; isTermsAccepted: boolean };
    errors: any;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    inputRefs: {
        email: React.RefObject<HTMLInputElement>;
        phone: React.RefObject<HTMLInputElement>;
    };
}

export const ContactInfoForm: React.FC<ContactInfoProps> = ({ formData, errors, handleInputChange,inputRefs }) => (
    <div>
        <div className="grid grid-cols-1 md:grid-cols-8 md:gap-4">
            <div className='col-span-5'>
                <label
                    htmlFor="email"
                    className="min-w-full block my-2 text-sm font-medium font-bolder text-gray-900 dark:text-white"
                >
                    Correo electrónico
                </label>
                <input
                    ref={inputRefs.email}
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    placeholder="correo@mail.com"
                />
                {errors.email && <div className="text-red-500">{errors.email}</div>}
            </div>

            <div className='col-span-3'>
                <label
                    htmlFor="phone"
                    className="min-w-full block my-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                    Teléfono
                </label>
                <input
                ref={inputRefs.phone}
                    type="text"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    placeholder="88889999"
                />
                {errors.phone && <div className="text-red-500">{errors.phone}</div>}
            </div>
        </div>
    </div>
);
