export default function useUtilityHook() {
	const isMouseEventLeftClick = (event) => {
		if (event.touches) return true;
		if ('buttons' in event) return event.buttons === 1;
		if ('button' in event) return event.button === 1;
		if ('which' in event) return event.which === 1;
	};

	return {
		isMouseEventLeftClick,
	};
}
