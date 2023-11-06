export function setStyles(data) {
    if (data.style) {
        document.documentElement.style.setProperty(
            '--user-form-page-background',
            data?.style?.pageBackground,
        );
        document.documentElement.style.setProperty(
            '--user-form-background',
            data?.style?.backgroundColor,
        );
        document.documentElement.style.setProperty(
            '--user-form-label-font-color',
            data?.style?.fontColor,
        );
        document.documentElement.style.setProperty(
            '--user-form-border-color',
            data?.style?.borderColor,
        );
        document.documentElement.style.setProperty(
            '--user-form-button-background-color',
            data?.style?.btnBackgroundColor,
        );
        document.documentElement.style.setProperty(
            '--user-form-button-font-color',
            data?.style?.btnFontColor,
        );
        document.documentElement.style.setProperty(
            '--user-form-border-width',
            `${data?.style?.borderWidth}px`,
        );
        document.documentElement.style.setProperty(
            '--user-form-border-radius',
            `${data?.style?.borderRadius}px`,
        );
        document.documentElement.style.setProperty('--user-form-width', `${data?.style?.width}%`);
        document.documentElement
            .querySelector('body')
            ?.style.setProperty('background', 'transparent');
        if (data?.style?.borderWidth > 0) {
            document.documentElement.style.setProperty('--user-form-border-style', 'solid');
        }
    }
}

export const setTitle = (title = 'Dashboard', subTitle) => {
    if (typeof title !== 'string') {
        throw new Error('Title should be an string');
    }
    if (subTitle) {
        if (typeof subTitle !== 'string') {
            throw new Error('Title should be an string');
        }
        document.title = `${title} > ${subTitle}`;
        return;
    }
    document.title = `${title}`;
};
