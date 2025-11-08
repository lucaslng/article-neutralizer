import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import NavBar from "./components/NavBar";
import Neutralize from "./pages/Neutralize";
import Saved from "./pages/Saved";
import Settings from "./pages/Settings";

function Panel() {
	const [pageId, setPageId] = useState(0);

	return (
		<div className="min-h-screen bg-slate-950">
			<div className="p-4 pb-32">
				{pageId === 0 && <Neutralize />}
				{pageId === 1 && <Saved />}
				{pageId === 2 && <Settings />}
			</div>
			<NavBar pageId={pageId} setPageId={(pageId: number) => setPageId(pageId)} />
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