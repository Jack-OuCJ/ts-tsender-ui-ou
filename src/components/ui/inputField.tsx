import React from 'react';

interface InputFieldProps {
  label: string;
  placeholder?: string;
  value: string;
  type?: 'text' | 'email' | 'password' | 'number';
  large?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  placeholder,
  value,
  type = 'text',
  large = false,
  onChange,
}) => {
  const inputClasses = `border rounded-md p-2 ${
    large ? 'h-32' : 'h-10'
  } border-gray-300 focus:outline-none focus:ring focus:ring-blue-500 w-full`;

  return (
    <div className="flex justify-center">
      <div className="w-7/10">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
          {large ? (
            <textarea
              className={inputClasses}
              placeholder={placeholder}
              value={value}
              onChange={onChange}
            />
          ) : (
            <input
              type={type}
              className={inputClasses}
              placeholder={placeholder}
              value={value}
              onChange={onChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default InputField;