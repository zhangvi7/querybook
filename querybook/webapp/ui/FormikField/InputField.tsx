import { useField } from 'formik';
import React from 'react';

import {
    DebouncedInput,
    IDebouncedInputProps,
} from 'ui/DebouncedInput/DebouncedInput';
import { DebouncedPasswordInput } from 'ui/DebouncedInput/DebouncedPasswordInput';

export interface IInputFieldProps extends Partial<IDebouncedInputProps> {
    name: string;
    inputType?: 'text' | 'password';
    placeholder?: string;
}

export const InputField: React.FC<IInputFieldProps> = ({
    name,
    inputType = 'text',
    placeholder,
    ...debouncedInputProps
}) => {
    const [_, meta, helpers] = useField(name);

    const { value } = meta;
    const { setValue } = helpers;

    const InputComponent =
        inputType === 'text' ? DebouncedInput : DebouncedPasswordInput;

    return (
        <InputComponent
            {...debouncedInputProps}
            value={debouncedInputProps.value ?? value}
            onChange={debouncedInputProps.onChange ?? setValue}
            inputProps={{
                className: 'input',
                onBlur: () => helpers.setTouched(true),
                placeholder,
                ...debouncedInputProps.inputProps,
            }}
            flex={debouncedInputProps.flex ?? true}
        />
    );
};
