import React from "react";

interface ToolInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
}

export function ToolInput({ label, id, ...props }: ToolInputProps) {
  return (
    <div className="tool-input">
      <label htmlFor={id}>
        {label}
        <input id={id} {...props} />
      </label>
    </div>
  );
}
