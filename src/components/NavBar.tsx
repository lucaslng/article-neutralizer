import Home from "@mui/icons-material/Home";
import Bookmark from "@mui/icons-material/Bookmark";
import Settings from "@mui/icons-material/Settings";
import { useRef, useEffect, useState } from "react";
import type { JSX } from "react";

function NavBarItem(props: {
  pageId: number;
  label: string;
  setPage: (pageId: number) => void;
  currentPageId: number;
  icon: JSX.Element;
  buttonRef: (el: HTMLButtonElement | null) => void;
}) {
  return (
    <li className="grow basis-1/3">
      <button
        ref={props.buttonRef}
        onClick={() => props.setPage(props.pageId)}
        className="cursor-pointer flex flex-col w-full items-center gap-2"
      >
        {props.icon}
        <h6 className="w-full text-sm text-center transition-all duration-300">
          {props.label}
        </h6>
      </button>
    </li>
  );
}

export default function NavBar(props: {
  pageId: number;
  setPageId: (pageId: number) => void;
}) {
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [indicatorLeft, setIndicatorLeft] = useState(0);

  useEffect(() => {
    const updateIndicatorPosition = () => {
      const currentButton = buttonRefs.current[props.pageId];
      if (currentButton) {
        const buttonRect = currentButton.getBoundingClientRect();
        const containerRect = currentButton.closest('div')?.getBoundingClientRect();
        if (containerRect) {
          const relativeLeft = buttonRect.left - containerRect.left;
          const centerPosition = relativeLeft + buttonRect.width / 2 - 28; // 20 is half of span width (w-10)
          setIndicatorLeft(centerPosition);
        }
      }
    };

    updateIndicatorPosition();
    window.addEventListener('resize', updateIndicatorPosition);
    return () => window.removeEventListener('resize', updateIndicatorPosition);
  }, [props.pageId]);

  return (
    <div className="fixed bottom-0 w-full h-max bg-ctp-crust py-2">
      <span
        className="absolute top-1.25 w-14 h-8 bg-ctp-surface0 rounded-full transition-all duration-300"
        style={{ left: `${indicatorLeft}px` }}
      ></span>

      <ul className="flex flex-row gap-8 px-8 justify-center relative z-10">
        <NavBarItem
          pageId={0}
          label="Neutralize"
          currentPageId={props.pageId}
          setPage={props.setPageId}
          icon={<Home />}
          buttonRef={(el) => (buttonRefs.current[0] = el)}
        />
        <NavBarItem
          pageId={1}
          label="Saved"
          currentPageId={props.pageId}
          setPage={props.setPageId}
          icon={<Bookmark />}
          buttonRef={(el) => (buttonRefs.current[1] = el)}
        />
        <NavBarItem
          pageId={2}
          label="Settings"
          currentPageId={props.pageId}
          setPage={props.setPageId}
          icon={<Settings />}
          buttonRef={(el) => (buttonRefs.current[2] = el)}
        />
      </ul>
    </div>
  );
}