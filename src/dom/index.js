import { ATTR_KEY } from '../constants';
import { toLowerCase, empty, falsey, isFunction } from '../util';
import { optionsHook } from '../hooks';


export function ensureNodeData(node, data) {
	return node[ATTR_KEY] || (node[ATTR_KEY] = (data || {}));
}


export function getNodeType(node) {
	if (node instanceof Text) return 3;
	if (node instanceof Element) return 1;
	return 0;
}


/** Append multiple children to a Node.
 *	Uses a Document Fragment to batch when appending 2 or more children
 *	@private
 */


/** Removes a given DOM Node from its parent. */
export function removeNode(node) {
	let p = node.parentNode;
	if (p) p.removeChild(node);
}


/** Set a named attribute on the given Node, with special behavior for some names and event handlers.
 *	If `value` is `null`, the attribute/handler will be removed.
 *	@param {Element} node	An element to mutate
 *	@param {string} name	The name/key to set, such as an event or attribute name
 *	@param {any} value		An attribute value, such as a function to be used as an event handler
 *	@param {any} previousValue	The last value that was set for this name/node pair
 *	@private
 */
export function setAccessor(node, name, value) {
	ensureNodeData(node)[name] = value;

	if (name==='key' || name==='children') return;

	if (name==='class') {
		node.className = value || '';
	}
	else if (name==='style') {
		node.style.cssText = value || '';
	}
	else if (name==='dangerouslySetInnerHTML') {
		if (value && value.__html) node.innerHTML = value.__html;
	}
	else if (name!=='type' && name in node) {
		setProperty(node, name, empty(value) ? '' : value);
		if (falsey(value)) node.removeAttribute(name);
	}
	else if (name[0]==='o' && name[1]==='n') {
		let l = node._listeners || (node._listeners = {});
		name = toLowerCase(name.substring(2));
		if (!l[name]) node.addEventListener(name, eventProxy);
		else if (!value) node.removeEventListener(name, eventProxy);
		l[name] = value;
	}
	else if (falsey(value)) {
		node.removeAttribute(name);
	}
	else if (typeof value!=='object' && !isFunction(value)) {
		node.setAttribute(name, value);
	}
}


/** Attempt to set a DOM property to the given value.
 *	IE & FF throw for certain property-value combinations.
 */
function setProperty(node, name, value) {
	try {
		node[name] = value;
	} catch (e) { }
}


/** Proxy an event to hooked event handlers
 *	@private
 */
function eventProxy(e) {
	return this._listeners[toLowerCase(e.type)](optionsHook('event', e) || e);
}


/** Get a node's attributes as a hashmap.
 *	@private
 */
export function getRawNodeAttributes(node) {
	let attrs = {};
	for (let i=node.attributes.length; i--; ) {
		attrs[node.attributes[i].name] = node.attributes[i].value;
	}
	return attrs;
}
