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
        className="cursor-pointer flex flex-col w-full items-center gap-1"
      >
        <div className={`w-14 h-8 rounded-full ${props.pageId == props.currentPageId ? "hover:bg-ctp-surface2" : "hover:bg-ctp-surface0"} transition-colors duration-300 flex items-center justify-center`}>
          {props.icon}
        </div>
        <h6 className={`w-full text-sm text-center transition-color duration-300 ${props.pageId == props.currentPageId ? "font-semibold text-ctp-subtext1" : "font-normal text-ctp-subtext0"}`}>
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
  const [indicatorPos, setIndicatorPos] = useState([0, 0]);

  useEffect(() => {
    const updateIndicatorPosition = () => {
      const currentButton = buttonRefs.current[props.pageId];
      if (currentButton) {
        const buttonRect = currentButton.getBoundingClientRect();
        const containerRect = currentButton.closest('div')?.getBoundingClientRect();
        if (containerRect) {
          const relativeLeft = buttonRect.left - containerRect.left;
          const centerLeft = relativeLeft + buttonRect.width / 2 - 28; // span width * 2
          setIndicatorPos([centerLeft, buttonRect.top - containerRect.top]);
        }
      }
    };

    updateIndicatorPosition();
    window.addEventListener('resize', updateIndicatorPosition);
    return () => window.removeEventListener('resize', updateIndicatorPosition);
  }, [props.pageId]);

  return (
    <div className="fixed bottom-0 w-full h-max bg-ctp-base py-2">
      <span
        className="absolute z-0 w-14 h-8 bg-ctp-surface1 rounded-full transition-all duration-300"
        style={{ left: `${indicatorPos[0]}px`, top: `${indicatorPos[1]}px` }}
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