import React from "react";

interface SectionHeadingProps {
  title: string;
  action?: React.ReactNode;
}

export function SectionHeading({ title, action }: SectionHeadingProps) {
  return (
    <div className="section-heading">
      <div>
        <h2>{title}</h2>
      </div>
      {action}
    </div>
  );
}
