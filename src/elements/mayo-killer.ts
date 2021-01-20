import {LitElement, html, css, customElement, property} from "lit-element"

@customElement("mayo-killer")
export default class MayoKillerElement extends LitElement {
	@property()
	symbol: string

	render() {
		return html`${this.symbol}`
	}
}
