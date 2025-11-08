import { useState } from "react";

export default function Neutralize() {

	const [article, setArticle] = useState("Extracted text will appear here");

	async function getArticle() {
		setArticle("Extracting article...")
		const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

		function sendExtractRequest(tabId: number) {
  		return new Promise<any>((resolve, reject) => {
    		chrome.tabs.sendMessage(tabId, { action: "extractArticle" }, (response) => {
      		const err = chrome.runtime.lastError;
      		if (err) reject(new Error(err.message));
      		else resolve(response);
    		});
  		});
		}

		async function extract() {
    	const response = await sendExtractRequest(tab.id!);
    	setArticle(response?.text || "No readable content found.");
  	}

		try {
    await extract();
  } catch (error) {
    console.warn("Content script missing, injecting...", error);
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id! },
        files: ["contentScript.js"],
      });
      await extract();
    } catch (injectError) {
      console.error("Extraction failed:", injectError);
      setArticle("Couldn't read from this page.");
    }
  }
	}

	return (
		<div>
			<h1>Article Neutralizer</h1>
			<button className="border rounded-sm border-white p-1" onClick={() => getArticle()}>Extract</button>
			<p>{article}</p>
		</div>
	);
}