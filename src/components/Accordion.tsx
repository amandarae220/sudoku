import React from "react";
import { ChevronIcon } from "./icons";
import "./Accordion.css";

interface AccordionProps {
  title: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

// Native <details>/<summary> collapsible: keyboard, Esc, and open/close
// state come for free, and the chevron reflects [open] via CSS.
const Accordion: React.FC<AccordionProps> = ({ title, icon, defaultOpen = false, children }) => (
  <details className="accordion" open={defaultOpen}>
    <summary className="accordion__summary">
      <span className="accordion__icon" aria-hidden="true">
        {icon}
      </span>
      <span className="accordion__title">{title}</span>
      <ChevronIcon className="accordion__chevron" />
    </summary>
    <div className="accordion__body">{children}</div>
  </details>
);

export default Accordion;
