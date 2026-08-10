import React from "react";
import Accordion from "./Accordion";
import { HelpIcon, CellIcon, KeyboardIcon, EraserIcon } from "./icons";
import "./HowToPlay.css";

const STEPS = [
  { icon: <CellIcon />, title: "Select a cell", detail: "Use mouse or arrow keys" },
  { icon: <KeyboardIcon />, title: "Type a number", detail: "1–9 on your keyboard" },
  { icon: <EraserIcon />, title: "Erase", detail: "Backspace or Delete" },
];

const HowToPlay: React.FC = () => (
  <Accordion title="How to play" icon={<HelpIcon />} defaultOpen>
    <p className="how-to-play__intro">
      Fill the grid so that every row, column, and 3×3 box contains the numbers 1–9.
    </p>
    <ul className="how-to-play__steps">
      {STEPS.map(({ icon, title, detail }) => (
        <li key={title} className="how-to-play__step">
          <span className="how-to-play__icon" aria-hidden="true">
            {icon}
          </span>
          <span>
            <span className="how-to-play__step-title">{title}</span>
            <span className="how-to-play__step-detail">{detail}</span>
          </span>
        </li>
      ))}
    </ul>
  </Accordion>
);

export default HowToPlay;
