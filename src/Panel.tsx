import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import NavBar from "./components/NavBar";
import Neutralize from "./pages/Neutralize";
import Saved from "./pages/Saved";
import Settings from "./pages/Settings";

function Panel() {
	const [page, setPage] = useState("neutralize");

  return (
		<div>
			<div className="bg-slate-950 p-4 top-0 h-dvh">
				{page === "neutralize" && <Neutralize />}
				{page === "saved" && <Saved />}
				{page === "settings" && <Settings />}
			</div>
			<NavBar page={page} setPage={(page: string) => setPage(page)} />
		</div>
  );
}

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <Panel />
  </React.StrictMode>
);
