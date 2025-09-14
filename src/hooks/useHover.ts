import { useState } from "react";

export const useHover = (
  length: number
): [boolean[], (index: number, isHovered: boolean) => void] => {
  const [hoverStates, setHoverStates] = useState<boolean[]>(
    Array(length).fill(false)
  );

  const setHoverState = (index: number, isHovered: boolean) => {
    setHoverStates((prev) => {
      const newStates = [...prev];
      newStates[index] = isHovered;
      return newStates;
    });
  };

  return [hoverStates, setHoverState];
};
