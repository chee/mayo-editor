import {controller, target} from "@github/catalyst"
import type {
	MayoDocumentElement,
	MayoSidebarElement,
	MayoSidebarTreeElement,
} from "."
import {promises as fs} from "fs"
import path from "path"

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

@controller
export default class MayoAppElement extends HTMLElement {
	@target sidebar: MayoSidebarElement
	@target document: MayoDocumentElement
	currentFilePath: string
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
		this.document.setAttribute("contents", contents)
	}

	async saveFile(): Promise<void> {
		let contents = this.document.contents
		if (this.currentFilePath) {
			await fs.writeFile(this.currentFilePath, contents)
			this.document.removeAttribute("dirty")
		} else {
			// TODO save as
		}
	}

	async connectedCallback(): Promise<void> {
		this.document.contents = `# hello \`this\` and _that_ (and \`others\`)

this is an _ordinary **\`document\` about** ordinary_ things, there's **nothing _going_ on**
here of _interest to you_, or me, or anybody else.


## a list

- one
- two
- three

1. first thing
2. second
3. the aeroplane

## the other thing

- one

images like ![dog in hat](https://i.pinimg.com/originals/c1/40/6f/c1406f93f49e896ff7c54c26bbfda047.jpg) and so on

> help
> this is why i need help

\`\`\`cpp filename="hello"
auto sum(std::vector<int> nums) {
	auto result = 0;
	for (auto num : nums) {
		result += num;
	}
	return result;
}
\`\`\`
`
		let cwd = "/home/chee/docfiles/"
		this.sidebar.setAttribute("cwd", cwd)
	}
}
