import React from 'react';

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  required?: boolean;
  icon?: React.ReactNode;
  labelClassName?: string;
}

const AuthInput = ({ label, id, required = true, icon, className = '', labelClassName = '', name, ...props }: AuthInputProps) => {
  const isDisabled = Boolean(props.disabled || props.readOnly);

  return (
    <div>
      <label className={`block text-sm font-semibold text-dark mb-2 ${labelClassName}`} htmlFor={id}>
        {label} {required && <span className="text-danger">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <span className={`pointer-events-none absolute left-5 top-1/2 flex -translate-y-1/2 ${isDisabled ? 'text-muted/55' : 'text-muted'}`}>
            {icon}
          </span>
        )}
        <input
          id={id}
          name={name ?? id}
          className={`w-full py-4 ${icon ? 'pl-14 pr-5' : 'px-5'} bg-surface shadow-sm rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body disabled:cursor-not-allowed disabled:bg-line/35 disabled:text-muted disabled:opacity-100 ${className}`}
          {...props}
        />
      </div>
    </div>
  );
};

export default AuthInput;
