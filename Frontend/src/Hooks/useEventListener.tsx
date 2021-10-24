import { RefObject, useEffect } from "react";

export default function useEventListener<K extends keyof GlobalEventHandlersEventMap>(
	ref: RefObject<HTMLElement | null>,
	event: K,
	listener: (event: GlobalEventHandlersEventMap[K]) => void,
	options?: boolean | AddEventListenerOptions
) {
	useEffect(() => {
		const listenerWrapper = ((e: GlobalEventHandlersEventMap[K]) => listener(e)) as EventListener;
		ref.current?.addEventListener(event, listenerWrapper, options);
		return () => ref.current?.removeEventListener(event, listenerWrapper);
	}, [ref, event, listener, options]);
}
