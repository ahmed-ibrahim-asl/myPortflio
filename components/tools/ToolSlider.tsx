import React from "react";

interface ToolSliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
}

export function ToolSlider({ label, id, ...props }: ToolSliderProps) {
  return (
    <div className="tool-input">
      <label htmlFor={id}>
        {label}
        <input type="range" className="tool-slider" id={id} {...props} />
      </label>
    </div>
  );
}
