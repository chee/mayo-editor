import {controller} from "@github/catalyst"
import elements from "./elements"

for (let element of elements) {
	controller(element)
}
