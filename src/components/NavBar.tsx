function NavBarItem(props: {page: string, label: string, setPage: (page: string) => void}) {
	return (
		<li className="grow basis-1/3 text-center">
			<button onClick={() => props.setPage(props.page)}>
				<div className="flex flex-col gap-4">
					<h6>{props.label}</h6>
				</div>
			</button>
		</li>
	);
}

export default function NavBar(props: {page: string, setPage: (page: string) => void}) {
	return (
		<div className="fixed bg-slate-900 py-4 bottom-0 w-full h-26">
			<ul className="flex flex-row gap-8 justify-center">
				<NavBarItem page="neutralize" label="Neutralize" setPage={props.setPage}></NavBarItem>
				<NavBarItem page="saved" label="Saved" setPage={props.setPage}></NavBarItem>
				<NavBarItem page="settings" label="Settings" setPage={props.setPage}></NavBarItem>
			</ul>
		</div>
	);
}