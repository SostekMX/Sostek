import React from 'react';

interface Props {
  id?: string;
  label: string;
  className?: string;
  children: React.ReactNode;
}

const Field: React.FC<Props> = ({ id, label, className, children }) => (
  <div className={`field${className ? ` ${className}` : ''}`}>
    {id ? <label className='field__label' htmlFor={id}>{label}</label> : <span className='field__label'>{label}</span>}
    {children}
  </div>
);

export default Field;
