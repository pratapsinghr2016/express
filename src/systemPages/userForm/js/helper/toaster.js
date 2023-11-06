// Function to create a toast container
function createToastContainer(position) {
    const container = document.createElement('div');
    container.className = `notification-container toast-container-${position || 'bottom-left'}`;
    document.body.appendChild(container);
    return container;
}

// Error Icon
const errorOutlineIcon = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path d="M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
        </svg>`;

// Warning Icon
const warningIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 462">
        <g transform="translate(0.122 0.1)">
            <g transform="translate(0 0)">
                <g>
                    <path d="M503.79,371.06L307.96,31.74c-16.65-28.83-53.52-38.7-82.35-22.04     c-9.15,5.29-16.75,12.89-22.04,22.04l-196,339.32c-16.63,28.84-6.74,65.7,22.1,82.34c9.16,5.28,19.54,8.06,30.11,8.06h391.83     c33.29-0.01,60.28-27,60.27-60.29c0-10.57-2.78-20.95-8.06-30.11H503.79z M477.8,416.33c-5.35,9.41-15.37,15.19-26.19,15.13     H59.75c-16.7,0.01-30.24-13.53-30.25-30.23c0-5.32,1.4-10.54,4.06-15.14L229.49,46.75c8.35-14.46,26.84-19.42,41.31-11.08     c4.6,2.66,8.42,6.48,11.08,11.08L477.8,386.09C483.26,395.43,483.26,406.99,477.8,416.33z" />
                </g>
            </g>
            <g transform="translate(9.774 6.071)">
                <g>
                    <rect x="230.9" y="145.39" width="30.02" height="150.16" />
                </g>
            </g>
            <g transform="translate(9.571 13.37)">
                <g transform="translate(0 0)">
                    <path d="M246.11,318.27c-11.06,0-20.02,8.96-20.02,20.02c0,11.06,8.96,20.02,20.02,20.02     c11.06,0,20.02-8.96,20.02-20.02C266.11,327.24,257.16,318.28,246.11,318.27z" />
                </g>
            </g>
        </g>
    </svg>`;

// Add more icons as needed

// Info Icon
const infoIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 111.577 111.577">
        <path d="M78.962,99.536l-1.559,6.373c-4.677,1.846-8.413,3.251-11.195,4.217c-2.785,0.969-6.021,1.451-9.708,1.451   c-5.662,0-10.066-1.387-13.207-4.142c-3.141-2.766-4.712-6.271-4.712-10.523c0-1.646,0.114-3.339,0.351-5.064   c0.239-1.727,0.619-3.672,1.139-5.846l5.845-20.688c0.52-1.981,0.962-3.858,1.316-5.633c0.359-1.764,0.532-3.387,0.532-4.848   c0-2.642-0.547-4.49-1.636-5.529c-1.089-1.036-3.167-1.562-6.252-1.562c-1.511,0-3.064,0.242-4.647,0.71   c-1.59,0.47-2.949,0.924-4.09,1.346l1.563-6.378c3.829-1.559,7.489-2.894,10.99-4.002c3.501-1.111,6.809-1.667,9.938-1.667   c5.623,0,9.962,1.359,13.009,4.077c3.047,2.72,4.57,6.246,4.57,10.591c0,0.899-0.1,2.483-0.315,4.747   c-0.21,2.269-0.601,4.348-1.171,6.239l-5.82,20.605c-0.477,1.655-0.906,3.547-1.279,5.676c-0.385,2.115-0.569,3.731-0.569,4.815   c0,2.736,0.61,4.604,1.833,5.597c1.232,0.993,3.354,1.487,6.368,1.487c1.415,0,3.025-0.251,4.814-0.744   C76.854,100.348,78.155,99.915,78.962,99.536z M80.438,13.03c0,3.59-1.353,6.656-4.072,9.177c-2.712,2.53-5.98,3.796-9.803,3.796   c-3.835,0-7.111-1.266-9.854-3.796c-2.738-2.522-4.11-5.587-4.11-9.177c0-3.583,1.372-6.654,4.11-9.207   C59.447,1.274,62.729,0,66.563,0c3.822,0,7.091,1.277,9.803,3.823C79.087,6.376,80.438,9.448,80.438,13.03z" />
    </svg>
    `;

// Success Icon
const successIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path d="M20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4C12.76,4 13.5,4.11 14.2, 4.31L15.77,2.74C14.61,2.26 13.34,2 12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0, 0 22,12M7.91,10.08L6.5,11.5L11,16L21,6L19.59,4.58L11,13.17L7.91,10.08Z" />
    </svg>`;

// Close Icon
const crossClose = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <path d="M310.4,256.5L495.1,71.8c10.5-10.6,10.5-27.6,0-38.2l-16.2-16.2c-10.6-10.5-27.7-10.5-38.2,0    L256,202.1L71.3,17.4c-10.6-10.5-27.6-10.5-38.2,0L16.9,33.6c-10.5,10.6-10.5,27.7,0,38.2l184.7,184.7L16.9,441.2    c-10.5,10.6-10.5,27.7,0,38.2l16.2,16.2c10.6,10.5,27.6,10.5,38.2,0L256,310.9l184.7,184.7c5.1,5.1,11.9,7.9,19.1,7.9l0,0    c7.2,0,14.1-2.8,19.1-7.9l16.2-16.2c10.5-10.6,10.5-27.6,0-38.2L310.4,256.5z"/>
    </svg>`;

// Function to create a toast element
function createToast(toast) {
    const toastElement = document.createElement('div');
    toastElement.className = `DCToast notification toast ${toast.position || 'bottom-left'} ${
        toast.type
    } ${toast.removed ? 'removed' : ''}`;

    const iconElement = document.createElement('div');
    iconElement.className = 'notification-icon';
    iconElement.appendChild(getIcon(toast.type));

    const messageElement = document.createElement('div');
    messageElement.className = 'notification-message';
    messageElement.textContent = toast.message;

    const removeButton = document.createElement('button');
    removeButton.className = 'notification-remove';
    removeButton.addEventListener('click', () => {
        removeToast(toastElement, toast);
    });
    removeButton.appendChild(getIcon('close'));

    toastElement.appendChild(iconElement);
    toastElement.appendChild(messageElement);
    toastElement.appendChild(removeButton);

    return toastElement;
}

// Function to get an icon element based on the type
function getIcon(type) {
    const iconElement = document.createElement('div');
    // Implement the logic to set the icon based on the type
    switch (type) {
        case 'error':
            // Create an error icon
            iconElement.innerHTML = errorOutlineIcon; // Replace with actual error icon code
            break;
        case 'warning':
            // Create a warning icon
            iconElement.innerHTML = warningIcon; // Replace with actual warning icon code
            break;
        case 'info':
            // Create an info icon
            iconElement.innerHTML = infoIcon; // Replace with actual info icon code
            break;
        case 'success':
            // Create a success icon
            iconElement.innerHTML = successIcon; // Replace with actual success icon code
            break;
        case 'close':
            // Create a success icon
            iconElement.innerHTML = crossClose; // Replace with actual success icon code
            break;
        default:
            // Create a default icon
            iconElement.innerHTML = successIcon; // Replace with actual default icon code
    }
    return iconElement;
}

// Function to remove a toast element
function removeToast(toastElement) {
    // Remove the toast element from the container
    const container = document.querySelector('.notification-container');
    if (container && toastElement.parentNode === container) {
        container.removeChild(toastElement);
    }
}

// Function to show a toast
export function showToast(toastData) {
    // Create a toast container if it doesn't exist
    if (!document.querySelector('.notification-container')) {
        createToastContainer(toastData.position);
    }
    const container = document.querySelector('.notification-container');
    // Create a toast element
    const toastElement = createToast(toastData);
    if (window.location.ancestorOrigins?.[0]?.includes('preview.urlme.app')) {
        // Append the toast element to the container by passing in post message
        window.parent.postMessage({ type: 'showToast', data: toastElement.outerHTML }, '*');
    } else {
        container.appendChild(toastElement);
        // // Automatically remove the toast after a specified duration (toastData.duration)
        const duration = toastData.duration || 5000;
        setTimeout(() => {
            removeToast(toastElement, toastData);
        }, duration);
    }
}
