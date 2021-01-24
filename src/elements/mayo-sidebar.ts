import {
	LitElement,
	html,
	css,
	customElement,
	property,
	CSSResult,
} from "lit-element"
import {TemplateResult} from "lit-html"
import {basename} from "path"
import "./mayo-sidebar-file"
import "./mayo-sidebar-tree"

@customElement("mayo-sidebar")
class MayoSidebarElement extends LitElement {
	@property()
	cwd: string

	static get styles(): CSSResult {
		return css`
			* {
				box-sizing: border-box;
			}

			nav {
				overflow: hidden;
				width: 200px;
				background: #ffe9ed;
				color: #c36;
				height: 100%;
				padding: 1em;
				font-size: 1.4em;
				resize: horizontal;
				font-family: avenir next, -apple-system, BlinkMacSystemFont, "Segoe UI",
					Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue",
					sans-serif;
			}

			ul {
				list-style: none;
				padding: 0;
			}
		`
	}

	render(): TemplateResult {
		return html`
			<nav>
				<mayo-sidebar-tree
					?root=${true}
					?open=${false}
					cwd=${this.cwd}
					name=${this.cwd ? basename(this.cwd) : ""}
				></mayo-sidebar-tree>
			</nav>
		`
	}
}

export default MayoSidebarElement
