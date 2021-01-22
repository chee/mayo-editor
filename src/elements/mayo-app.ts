import type {
	MayoDocumentElement,
	MayoSidebarElement,
	MayoSidebarTreeElement,
} from "."
import {promises as fs} from "fs"
import path from "path"
import {
	LitElement,
	property,
	customElement,
	query,
	css,
	CSSResult,
} from "lit-element"
import {html, TemplateResult} from "lit-html"
import defaultDoc from "../default-doc"
export interface GetFilesEvent extends CustomEvent {
	detail: {
		target: MayoSidebarTreeElement
	}
}

export interface OpenFileEvent extends CustomEvent {
	detail: {
		cwd: string
		name: string
	}
}

@customElement("mayo-app")
export default class MayoAppElement extends LitElement {
	@query("mayo-document")
	editor: MayoDocumentElement
	@query("mayo-sidebar")
	sidebar: MayoSidebarElement
	@property()
	currentFilePath: string
	@property()
	currentFileContents: string = defaultDoc

	static get styles(): CSSResult {
		return css`
			mayo-sidebar {
				height: 100vh;
				overflow: hidden;
			}

			mayo-document {
				flex: 1;
				border-left: 20px solid white;
				width: 100%;
				padding-bottom: 5em;
				height: 100%;
				overflow: auto;
			}

			mayo-document[dirty] {
				border-left: 20px solid #ff2a50;
			}
			* {
				box-sizing: border-box;
			}

			body {
				margin: 0;
				padding: 0;
			}

			mayo-app {
				display: flex;
				height: 100vh;
			}

			mayo-sidebar {
				height: 100vh;
				overflow: hidden;
			}

			mayo-document {
				flex: 1;
				border-left: 20px solid white;
				width: 100%;
				padding-bottom: 5em;
				height: 100vh;
				overflow: auto;
			}

			mayo-document[dirty] {
				border-left: 20px solid #ff2a50;
			}

			mayo-document {
				overflow: auto;
				height: 100%;
			}

			mayo-document article > * + * {
				margin-top: 1em;
			}

			mayo-document article {
				width: 100%;
				height: 100%;
				font-size: 1.4em;
				font-family: avenir next, sans-serif;
				padding: 1em;
				color: #000;
				line-height: 1.2;
				max-width: 80ex;
				margin: auto;
				margin-bottom: 2em;
			}

			mayo-document article:focus {
				outline: none;
			}

			mayo-heading {
				display: block;
				font-weight: bolder;
			}

			h1 {
				font-size: 2em;
			}

			h2 {
				font-size: 1.6em;
			}

			h3 {
				font-size: 1.4em;
			}

			h4 {
				font-size: 1.25em;
			}

			h5 {
				font-size: 1.15em;
			}

			h6 {
				font-size: 1em;
			}

			h1::before,
			h2::before,
			h3::before,
			h4::before,
			h5::before,
			h6::before {
				font-family: ibm plex mono, monospace;
				font-style: italic;
				display: inline-block;
				font-size: 0.8em;
				color: #77c;
				margin-right: 0.5em;
			}

			h1::before {
				content: "# ";
			}

			h2::before {
				content: "## ";
			}

			h3::before {
				content: "### ";
			}

			h4::before {
				content: "#### ";
			}

			h5::before {
				content: "##### ";
			}

			h6::before {
				content: "###### ";
			}

			mayo-break {
				display: block;
			}

			mayo-paragraph {
				display: block;
			}

			mayo-paragraph + mayo-paragraph {
				margin-top: 1em;
			}

			mayo-list {
				list-style-type: disc;
				padding-left: 1em;
				display: block;
			}

			mayo-list[ordered="true"] {
				list-style-type: decimal;
				padding-left: 1em;
			}

			mayo-list-item {
				display: list-item;
			}

			[ordered="false"] > mayo-list-item::-moz-list-bullet {
				color: #af2af0;
			}

			[ordered="true"] > mayo-list-item::-moz-list-bullet {
				font-weight: 500;
			}

			mayo-code {
				display: block;
				white-space: pre;
				font-family: IBM Plex Mono, monospace;
				background: #ffe9ed;
				color: #c36;
				padding: 1em;
				font-size: 0.9em;
				margin-bottom: 1em;
				overflow-x: scroll;
			}

			[type="text"] {
				white-space: pre-wrap;
			}

			[type="inlineCode"] {
				font-family: IBM Plex Mono, monospace;
				background: #ffe9ed;
			}

			mayo-emphasis {
				font-style: oblique;
			}

			mayo-strong {
				font-weight: bolder;
			}

			li > [type="paragraph"] > p {
				margin: 0;
			}
			blockquote {
				display: flex;
				border-left: 5px solid #3399ff;
				padding-left: 5px;
			}
		`
	}

	async getFiles(event: GetFilesEvent): Promise<void> {
		event.detail.target.directory = (
			await fs.readdir(path.resolve(event.detail.target.cwd), {
				withFileTypes: true,
			})
		).sort((a, b) =>
			a.isDirectory() && !b.isDirectory()
				? -1
				: !a.isDirectory() && b.isDirectory()
				? 1
				: 0
		)
	}

	async openFile(event: OpenFileEvent): Promise<void> {
		this.currentFilePath = path.resolve(event.detail.cwd, event.detail.name)
		let contents = await fs.readFile(this.currentFilePath, {encoding: "utf-8"})
		this.currentFileContents = contents
		this.editor.setAttribute("contents", contents)
	}

	async saveFile(): Promise<void> {
		let contents = this.editor.contents
		if (this.currentFilePath) {
			await fs.writeFile(this.currentFilePath, contents)
			this.editor.removeAttribute("dirty")
		} else {
			// TODO save as
		}
	}

	render(): TemplateResult {
		return html`
			<mayo-sidebar
				role="navigation"
				cwd="/home/chee/docfiles/"
				@get-files=${this.getFiles}
				@open-file=${this.openFile}
			></mayo-sidebar>
			<mayo-document
				role="main"
				@save=${this.saveFile}
				contents=${this.currentFileContents}
				contenteditable
			></mayo-document>
		`
	}
}
