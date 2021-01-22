import removePosition from "unist-util-remove-position"
import fromMarkdown from "mdast-util-from-markdown"
import {Root} from "mdast"

export default function parse(string: string): Root {
	return removePosition(fromMarkdown(string), true) as Root
}
