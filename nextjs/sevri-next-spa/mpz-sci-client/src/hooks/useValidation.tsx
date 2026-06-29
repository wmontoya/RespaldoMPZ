import { useState, useRef, useEffect } from "react";
import * as Yup from "yup";

export function useValidation<T>(validationSchema: Yup.ObjectSchema<any>) {
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const errorContainerRef = useRef<HTMLDivElement>(null);

    const validate = async (values: T): Promise<boolean> => {
        try {
            await validationSchema.validate(values, { abortEarly: false, disableStackTrace: true });
            setValidationErrors([]);
            return true;
        } catch (errors) {
            if (errors instanceof Yup.ValidationError) {
                const errorMessages = errors.inner.map((err) => err.message);
                setValidationErrors(errorMessages);
            }
            return false;
        }
    };

    useEffect(() => {
        if (validationErrors.length > 0 && errorContainerRef.current) {
            errorContainerRef.current.scrollIntoView({ behavior: "smooth" });
        }
        setTimeout(() => {
            setValidationErrors([]);
        }, 3000);
    }, [validationErrors]);

    return {
        validationErrors,
        validate,
        errorContainerRef,
    };
}