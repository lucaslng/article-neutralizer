function NavBarItem(props: {
  pageId: number;
  label: string;
  setPage: (pageId: number) => void;
  currentPageId: number;
}) {
  // const isSelected = () => props.pageId === props.currentPageId;

  return (
    <li className="grow basis-1/3">
      <button
        onClick={() => props.setPage(props.pageId)}
        className="flex w-full items-center py-1 border-white border"
      >
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
  return (
    <div className="fixed bottom-0 w-full h-max bg-slate-900 py-4">
      <span
        className="absolute bottom-2 w-10 h-8 bg-slate-700 rounded-full transition-all duration-300"
        style={{ left: `${props.pageId * 80 + 20}px` }}
      ></span>

      <ul className="flex flex-row gap-8 px-8 justify-center relative z-10">
        <NavBarItem
          pageId={0}
          label="Neutralize"
          currentPageId={props.pageId}
          setPage={props.setPageId}
        />
        <NavBarItem
          pageId={1}
          label="Saved"
          currentPageId={props.pageId}
          setPage={props.setPageId}
        />
        <NavBarItem
          pageId={2}
          label="Settings"
          currentPageId={props.pageId}
          setPage={props.setPageId}
        />
      </ul>
    </div>
  );
}
