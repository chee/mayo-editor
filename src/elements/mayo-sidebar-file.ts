import {
	LitElement,
	html,
	css,
	customElement,
	property,
	CSSResult,
} from "lit-element"
import {TemplateResult} from "lit-html"
import type {OpenFileEvent} from "./mayo-app"

@customElement("mayo-sidebar-file")
class MayoSidebarFileElement extends LitElement {
	@property()
	name: string
	@property()
	cwd: string
	static get styles(): CSSResult {
		return css`
			.link {
				text-decoration: none;
				color: #000;
				font-family: ibm plex mono, monospace;
				display: flex;
			}
			.link:hover {
				text-decoration: underline;
			}
			.link .name {
				font-weight: bold;
			}
			.link .name::after {
				font-weight: 300;
				content: ".md";
			}
			.ext {
				font-weight: 300;
				display: flex;
			}
			.ext:before {
				content: ".";
				display: inline;
			}
		`
	}

	choose(event: Event): void {
		event.preventDefault()
		let chooseEvent: OpenFileEvent = new CustomEvent("open-file", {
			detail: {
				name: this.name,
				cwd: this.cwd,
			},
			bubbles: true,
			composed: true,
		})
		this.dispatchEvent(chooseEvent)
	}

	render(): TemplateResult {
		let [name, ext] = this.name!.split(".")

		if (ext == "md") {
			return html`<a href=${this.name!} @click=${this.choose} class="link">
				<span class="name">${name}</span></a
			>`
		} else {
			return html`<span class="non-md name">${this.name}</span>`
		}
	}
}

export default MayoSidebarFileElement
