import { useState, useEffect } from "react";

export default function Saved() {
	const [articles, setArticles] = useState([]);

	useEffect(() => {
		const listener = () => {
			chrome.storage.local.get(["savedArticles"], (r) => {
			setArticles(r.savedArticles || []);
			});
		};
		chrome.storage.onChanged.addListener(listener);
		listener();
		return () => chrome.storage.onChanged.removeListener(listener);
		}, []);


	return (
		<div>
			<ul>
				{articles.map((article, index) => (
					<li key={index}>{article}</li>
				))};
			</ul>
		</div>
	);
}