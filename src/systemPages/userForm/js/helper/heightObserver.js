export function heightObserver(fieldsData) {
    const iframeId = new URLSearchParams(window.location.search).get('iframe_id');
    const fontFamily = new URLSearchParams(window.location.search).get('fontFamily');
    const fontWeight = new URLSearchParams(window.location.search).get('fontWeight');
    const funnelId = new URLSearchParams(window.location.search).get('funnel_id');
    let resizeObserver = null;
    let styleObserver = null;

    let resizeTimeout;

    function handlePostChangeInHeight(formHeight) {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            window.parent.postMessage(
                {
                    source: 'form',
                    height: formHeight,
                    id: window.frameElement?.id || iframeId,
                },
                `*`,
            );
        }, 100);
    }

    function createObserver(target, callback) {
        const observer = new MutationObserver(callback);
        observer.observe(target, {
            childList: true,
            subtree: true,
        });
        return observer;
    }

    function updateFontStyles(fontFamily, fontWeight) {
        const root = document.querySelector('.FormPresenterDialog');
        if (root) {
            root.style.fontFamily = fontFamily;
            root.style.fontWeight = fontWeight;
        }
    }

    function messageHandler(event) {
        if (event?.data?.type === 'global styles') {
            const { fontFamily, fontWeight } = event.data.styles;
            updateFontStyles(fontFamily, fontWeight);
        }
    }

    function observeElementForResize(target, callback) {
        const resizeObserver = new ResizeObserver(callback);
        resizeObserver.observe(target);
        return resizeObserver;
    }

    const container = document.querySelector(`.DCFBVew.${iframeId}`);
    const formWrapper = funnelId ? document.querySelector('.DCFBInner') : null;

    let observer = createObserver(container, mutationsList => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                getHeightOfElement();
            }
        }
    });

    function getHeightOfElement() {
        if (container) {
            const elementHeight = container.clientHeight;
            handlePostChangeInHeight(elementHeight);
        }
    }

    if (container) {
        if (container.children.length > 0) {
            if (fieldsData) {
                const dropdowns = container.querySelectorAll('.choices__list--dropdown');
                if (dropdowns.length) {
                    dropdowns.forEach(el => {
                        styleObserver = createObserver(el, mutations => {
                            const elementTop = el.getBoundingClientRect().top;
                            const containerHeight = container.getBoundingClientRect().height;
                            mutations.forEach(() => {
                                if (
                                    window.getComputedStyle(el).display !== 'none' &&
                                    elementTop + 250 > containerHeight
                                ) {
                                    observer.disconnect();
                                    resizeObserver = observeElementForResize(el, entries => {
                                        for (const entry of entries) {
                                            if (
                                                entry.target.classList.contains(
                                                    'choices__list--dropdown',
                                                )
                                            ) {
                                                const mainHeight =
                                                    container.getBoundingClientRect().height;
                                                const height = entry.contentRect?.height;
                                                handlePostChangeInHeight(mainHeight + height);
                                            }
                                        }
                                    });
                                } else {
                                    styleObserver?.disconnect();
                                    resizeObserver?.disconnect();
                                    observer.observe(container, {
                                        childList: true,
                                        subtree: true,
                                    });
                                }
                            });
                        });
                    });
                }
            }
        }
    }

    if (fontFamily) {
        updateFontStyles(fontFamily, fontWeight);
    }

    let iframeDisplayStatusObserver = new IntersectionObserver(entries => {
        for (const entry of entries) {
            if (entry.target?.classList.contains('DCFBVew')) {
                const height = entry.boundingClientRect?.height;
                handlePostChangeInHeight(height);
            }
        }
    });
    iframeDisplayStatusObserver.observe(container);

    window.addEventListener('message', messageHandler, false);

    window.onbeforeunload = function () {
        styleObserver?.disconnect();
        resizeObserver?.disconnect();
        observer.disconnect();
        iframeDisplayStatusObserver.disconnect();
    };

    if (funnelId && formWrapper) {
        formWrapper.style.padding = 0;
    }
}
