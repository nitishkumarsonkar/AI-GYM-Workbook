// Polyfill: Patch CSSStyleDeclaration for react-native-web + react-dom 19 compatibility
// react-native-web passes numeric-indexed style properties that react-dom 19 rejects.
// This polyfill makes CSSStyleDeclaration.prototype silently accept numeric index sets.
if (typeof window !== 'undefined') {
    const origDefineProperty = Object.defineProperty;

    // Patch CSSStyleDeclaration to allow numeric-indexed property sets
    try {
        const style = document.createElement('div').style;
        const StyleProto = Object.getPrototypeOf(style);

        if (StyleProto) {
            const originalSet = StyleProto.__lookupSetter__ && StyleProto.__lookupSetter__('cssText');

            // Use a Proxy on CSSStyleDeclaration instances via a patched createElement
            const origCreateElement = document.createElement.bind(document);
            const patchedElements = new WeakSet();

            // Override the style property descriptor for all HTML elements
            const HTMLElementProto = HTMLElement.prototype;
            const styleDescriptor = Object.getOwnPropertyDescriptor(HTMLElementProto, 'style') ||
                Object.getOwnPropertyDescriptor(Element.prototype, 'style');

            if (styleDescriptor && styleDescriptor.get) {
                const originalStyleGetter = styleDescriptor.get;

                Object.defineProperty(HTMLElementProto, 'style', {
                    get() {
                        const style = originalStyleGetter.call(this);
                        if (!patchedElements.has(this)) {
                            patchedElements.add(this);
                            return new Proxy(style, {
                                set(target, prop, value) {
                                    // Skip numeric indexed properties — they come from react-native-web
                                    if (typeof prop === 'string' && /^\d+$/.test(prop)) {
                                        return true;
                                    }
                                    try {
                                        target[prop] = value;
                                    } catch (e) {
                                        // Silently ignore unsupported style properties
                                    }
                                    return true;
                                },
                                get(target, prop) {
                                    const val = target[prop];
                                    if (typeof val === 'function') {
                                        return val.bind(target);
                                    }
                                    return val;
                                },
                            });
                        }
                        // Already patched — return proxy again
                        return new Proxy(style, {
                            set(target, prop, value) {
                                if (typeof prop === 'string' && /^\d+$/.test(prop)) {
                                    return true;
                                }
                                try {
                                    target[prop] = value;
                                } catch (e) { }
                                return true;
                            },
                            get(target, prop) {
                                const val = target[prop];
                                if (typeof val === 'function') {
                                    return val.bind(target);
                                }
                                return val;
                            },
                        });
                    },
                    configurable: true,
                });
            }
        }
    } catch (e) {
        // If patching fails, continue without — this only affects web
        console.warn('CSSStyleDeclaration polyfill failed:', e);
    }
}

import "expo-router/entry";
