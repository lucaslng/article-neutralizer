export default function NavBar(props: {page: string, setPage: (page: string) => void}) {
	return (
		<div className="fixed bg-slate-900 p-4 bottom-0 w-full h-26">
			<ul className="flex flex-row gap-8 justify-center">
				<li>
					<button className="basis-1/3 text-center" onClick={() => props.setPage("neutralize")}>Neutralize</button>
				</li>
				<li>
					<button className="basis-1/3 text-center" onClick={() => props.setPage("saved")}>Saved</button>
				</li>
				<li>
					<button className="basis-1/3 text-center" onClick={() => props.setPage("settings")}>Settings</button>
				</li>
			</ul>
		</div>
	);
}