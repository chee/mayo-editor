import {Dirent, promises as fs} from "fs"
import {
	LitElement,
	html,
	css,
	customElement,
	property,
	CSSResult,
} from "lit-element"
import type {GetFilesEvent} from "./mayo-app"
import path from "path"

@customElement("mayo-sidebar-tree")
export default class MayoSidebarTreeElement extends LitElement {
	@property({type: Boolean})
	open: boolean
	@property({attribute: false})
	directory: Array<Dirent>
	@property()
	cwd: string
	@property()
	name: string

	static get styles(): CSSResult {
		return css`
			ul {
				list-style: none;
				padding: 0;
				margin: 0;
				margin-left: 1em;
			}

			.tree-name * {
				cursor: default;
			}

			.arrow {
				color: black;
			}

			mayo-sidebar-file {
				font-size: 0.8em;
			}
		`
	}

	attributeChangedCallback(
		name: string,
		oldval: string,
		newval: string
	): void {
		super.attributeChangedCallback(name, oldval, newval)

		if (name == "open") {
			if (oldval == null && newval == "") {
				let event: GetFilesEvent = new CustomEvent("get-files", {
					detail: {target: this},
					composed: true,
					bubbles: true,
				})
				this.dispatchEvent(event)
			}
		}
	}

	toggle() {
		if (this.hasAttribute("open")) {
			this.removeAttribute("open")
		} else {
			this.setAttribute("open", "")
		}
	}

	render() {
		if (this.open) {
			return html`<span @click=${
				this.toggle
			} class="tree-name"><span class="arrow"
				>⮛ </span><strong class="name">${this.name}</strong></span> ${
				this.directory && this.directory.length
					? html`
							<ul>
								${this.directory.map(
									file => html`<li>
										${file.isDirectory()
											? html`<mayo-sidebar-tree
													name=${file.name}
													cwd=${path.resolve(this.cwd, file.name)}
													>${file.name}</mayo-sidebar-tree
											  >`
											: html`<mayo-sidebar-file
													name=${file.name}
													cwd=${this.cwd}
													>${file.name}</mayo-sidebar-file
											  >`}
									</li>`
								)}
							</ul>
					  `
					: ""
			}</span
			>`
		} else {
			return html`<span @click=${this.toggle} class="tree-name"
					><span class="arrow">⮚ </span>
					<strong class="name">${this.name}</strong></span
				></span></span>`
		}
	}
}
