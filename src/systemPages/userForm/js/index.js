import { publicFileUpload } from './api/index.js';
import { heightObserver } from './helper/heightObserver.js';
import { getParams } from './helper/routerLogics.js';
import { setStyles, setTitle } from './helper/setters.js';
import { showToast } from './helper/toaster.js';
import { handleForm } from './sdk/index.js';
async function createForm() {
    let formInfo;
    const {
        rid,
        rqid: rqId,
        funnel_id: funnelId,
        step_id: stepId,
        button_action: buttonAction,
        button_target: buttonTarget,
        button_link: buttonLink,
    } = getParams();
    const mimeTypes = {
        csv: 'text/csv',
    };
    const iframeId = new URLSearchParams(window.location.search).get('iframe_id');
    if (iframeId) {
        document.getElementById('dcFormBuilderView').classList.add(`${iframeId || ''}`);
    }
    var tmpFormValue;

    function isLocalStorageAvailable() {
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            return true;
        } catch (e) {
            return false;
        }
    }

    // Function to hide the loader
    function hideLoader() {
        const loader = document.querySelector('.ripple-loader');
        if (loader) {
            loader.style.display = 'none';
        }
    }

    // Get the current date and time
    const currentDate = new Date();

    // Format the date (example: YYYY-MM-DD HH:mm:ss)
    const formattedDate = `${currentDate.getFullYear()}-${String(
        currentDate.getMonth() + 1,
    ).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')} ${String(
        currentDate.getHours(),
    ).padStart(2, '0')}:${String(currentDate.getMinutes()).padStart(2, '0')}:${String(
        currentDate.getSeconds(),
    ).padStart(2, '0')}`;

    function loadScript(scriptURL) {
        const script = document.createElement('script');
        script.src = scriptURL;
        script.async = true;
        document.body.appendChild(script);
        return new Promise((resolve, reject) => {
            script.onload = () => {
                document.body.removeChild(script);
                resolve();
            };
            script.onerror = () => {
                document.body.removeChild(script);
                reject();
            };
        });
    }

    function dataURLtoFile(dataurl, filename) {
        var arr = dataurl?.split(','),
            _mime = arr[0]?.match(/:(.*?);/)[1],
            bstr = atob(arr[1]),
            n = bstr.length,
            u8arr = new Uint8Array(n);

        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }

        return new File([u8arr], filename, { type: _mime });
    }

    function pageRedirect(url) {
        const targetUrl = url.indexOf('http') === -1 ? `http://${url}` : url;
        if (window.parent) {
            window.parent.location.href = targetUrl;
        } else {
            window.location.href = targetUrl;
        }
    }

    function getLocalStorageData(n) {
        switch (n) {
            case 0: {
                let data = JSON.parse(localStorage.getItem('form-data') || '{}');
                return data;
            }
            case 1: {
                let formkey = '';
                if (window.location.href.includes('userform')) {
                    formkey = window.location.href.split('userform/')[1];
                } else {
                    let urlPart = window.location.href.split('/');
                    formkey = urlPart[urlPart?.length - 1];
                }
                return formkey;
            }
        }
    }

    async function handleFiles(submission) {
        for (const item in submission?.data) {
            if (
                (item.includes('file') || item.includes('image') || item.includes('signature')) &&
                submission.data[item].length
            ) {
                let file = '';
                if (item.match(/^signature.*$/)) {
                    file = dataURLtoFile(submission.data[item], `${item}.jpg`);
                } else {
                    file = dataURLtoFile(
                        submission.data[item][0]?.url,
                        submission.data[item][0]?.originalName,
                    );
                }
                let realType = file.type;
                if (file.name.split('.').pop() === 'csv') {
                    realType = mimeTypes['csv'];
                }
                const response = await publicFileUpload(
                    file,
                    {
                        type: realType,
                        name: file.name,
                        size: file.size,
                    },
                    formInfo?.id,
                );

                if (response.status === 'Success') {
                    submission.data[item] = [{ key: response.key, size: file.size }];
                } else {
                    return { response: 'failed' };
                }
            }
        }
        return { response: 'success', data: submission };
    }
    let submitting = false;
    async function handleFormSubmit(submission) {
        const modifiedData = await handleFiles({
            ...submission,
            step_id: formInfo?.stepId,
            funnel_id: formInfo?.funnelId,
        });
        if (formInfo?.funnelId) {
            const body = {
                event: 'form_submitted',
                ...submission,
            };
            window.parent.postMessage(body, '*');
        }
        if (modifiedData.response === 'success') {
            let data = {
                data: modifiedData.data,
                form_type:
                    formInfo?.form_type && formInfo?.iscampaignConnected
                        ? formInfo?.form_type
                        : null,
                rid: formInfo?.rid,
                rqid: formInfo?.rqId,
            };

            const jsonData = JSON.stringify(data);

            const headers = {
                'Content-Type': 'application/json',
            };

            fetch(
                `https://74c0-45-123-92-83.ngrok-free.app/v1/forms/${formInfo?.formId}/userresponse`,
                {
                    method: 'POST',
                    headers: headers,
                    body: jsonData,
                },
            )
                .then(response => {
                    submitting = false;
                    if (response.ok) {
                        return response.json();
                    } else {
                        throw new Error('Failed to fetch data');
                    }
                })
                .then(val => {
                    if (isLocalStorageAvailable()) {
                        let _formData = getLocalStorageData(0);
                        let formkey = getLocalStorageData(1);
                        delete _formData[formkey];
                        localStorage.setItem('form-data', JSON.stringify({ ..._formData }));
                    }

                    const body = {
                        form_id: val?.data?.form_id,
                        contact_id: val?.data?.contact_id,
                        response_id: val?.data?.id,
                        iframeId: iframeId,
                    };
                    const stats_body = {
                        event: 'new_form_submission',
                        ...body,
                        event_type: 'new_form_submission',
                    };
                    window.parent.postMessage(stats_body, '*');

                    setTimeout(() => {
                        if (formInfo?.message) {
                            document.querySelector('.DCFormBuilder').innerHTML = `
                                <div class="FPDThanks">
                                    <div class="FPDTInner">
                                        <div class="FPDTTitle">
                                            <center>${formInfo?.message}</center>
                                        </div>
                                    </div>
                                </div>`;
                        }
                        if (!funnelId && formInfo.redirect) {
                            pageRedirect(formInfo.redirect);
                        }
                    }, 2000);
                })
                .catch(error => {
                    console.error('Error:', error);
                    showToast({
                        type: 'error',
                        message: 'Failed to submit form',
                    });
                });
        } else {
            submitting = false;
            showToast({
                type: 'error',
                message: 'Failed to upload Files',
            });
        }
    }

    const urlDetailsObj = {
        rid,
        rqId,
        funnelId,
        stepId,
        buttonLink,
        buttonTarget,
        buttonAction,
    };

    function handleAutoSave() {
        setTimeout(() => {
            var _formData = getLocalStorageData(0);
            var formval = getLocalStorageData(1);
            if (tmpFormValue && tmpFormValue.data && Object.keys(tmpFormValue.data).length) {
                localStorage.setItem(
                    'form-data',
                    JSON.stringify(
                        Object.assign({}, _formData, {
                            [formval]: {
                                data: Object.assign({}, tmpFormValue.data),
                                last_updated: formattedDate,
                            },
                        }),
                    ),
                );
            }
        }, 2000);
    }

    function handleRedirectForms(buttonLink, buttonTarget, buttonAction, funnelId) {
        if (buttonAction === 'nothing_happens') {
            return;
        }
        if (buttonAction === 'go_to_next_step' || buttonAction === 'go_to_particular_step') {
            const link = window.location.ancestorOrigins?.[0]?.includes('preview.urlme.app')
                ? `https://preview.urlme.app/${funnelId}${buttonLink}`
                : `${window.location.ancestorOrigins?.[0]}${buttonLink}`;
            window.open(link, buttonTarget);
            return;
        }
        if (buttonAction === 'go_to') {
            window.open(buttonLink, buttonTarget);
            return;
        }
    }

    window.addEventListener('message', data => {
        if (data?.data?.event_type === 'new_form_submission' && data?.data?.iframeId === iframeId) {
            const { buttonLink, buttonTarget, buttonAction, funnelId } = formInfo || {};
            handleRedirectForms(buttonLink, buttonTarget, buttonAction, funnelId);
        }
    });

    try {
        let url = window.location.href;
        const match = url?.match(/\/([^/?]+)(\?|$)/);
        let formkeyID = null;
        if (match) {
            formkeyID = match[1];
        }
        const response = await handleForm(formkeyID, rid, urlDetailsObj);
        if (typeof response === 'string' && response.includes('Error')) {
            const errorParts = response.split(':');
            const errorValue = errorParts[1];
            if (errorValue === 'ALREADY_SUBMITTED' || errorValue === 'REQUEST_CANCELLED') {
                const titleText =
                    errorValue === 'ALREADY_SUBMITTED'
                        ? 'Already Submitted'
                        : 'This form is no longer available';
                const subTitleText =
                    errorValue === 'ALREADY_SUBMITTED'
                        ? 'Response for this form has been already submitted'
                        : 'Response for this form is no longer accepted';
                return (document.querySelector('.DCFormBuilder').innerHTML = `
                <div class="FormPresenterDialog FPDUserInfo">
                    <div class="FPDThanks">
                        <div class="FPDTInner">
                            <div class="FPDTIcon">
                                <svg viewBox="0 0 512 512">
                                    <g> <rect width="512" height="512" fill="#fff" /> <g> <ellipse cx="141.638" cy="26.148" rx="141.638" ry="26.148" transform="translate(116.662 411.193)" fill="#f5f5f5" /> <g transform="translate(64.365 49.473)" fill="#fff" stroke="#405d63" strokeWidth="2" > <circle cx="192.845" cy="192.845" r="192.845" stroke="none" /> <circle cx="192.845" cy="192.845" r="191.845" fill="none" /> </g> <g transform="translate(140.631 158.425)" fill="#fff"> <path d="M 118.5990524291992 273.8668212890625 C 117.5153045654297 273.8668212890625 116.4145889282227 273.8579406738281 115.3274459838867 273.8403930664063 C 98.04155731201172 273.5618591308594 81.29605102539063 271.4033813476563 65.55609130859375 267.4249877929688 C 52.96641159057617 264.2428588867188 40.98666381835938 259.8955078125 29.9495906829834 254.5036468505859 C 20.12701988220215 249.705078125 12.88419723510742 244.9498596191406 8.537912368774414 241.8056793212891 C 5.185268402099609 239.3803405761719 2.993826627731323 237.5149078369141 2.000019073486328 236.6323852539063 L 2.000019073486328 8.716142654418945 C 2.000019073486328 5.012856960296631 5.012876033782959 1.99999988079071 8.716161727905273 1.99999988079071 L 226.6202392578125 1.99999988079071 C 230.3235473632813 1.99999988079071 233.3364105224609 5.012856960296631 233.3364105224609 8.716142654418945 L 233.0035858154297 234.0866546630859 C 231.9666748046875 235.0347442626953 229.5972137451172 237.1201171875 225.9853820800781 239.8382873535156 C 221.3972015380859 243.2912139892578 213.8078460693359 248.5010681152344 203.7078704833984 253.7121734619141 C 192.3644866943359 259.5647888183594 180.2282409667969 264.2274780273438 167.6362762451172 267.5707397460938 C 151.9013366699219 271.7485046386719 135.4028472900391 273.8668212890625 118.5990524291992 273.8668212890625 Z" stroke="none" /> <path d="M 8.716156005859375 4 C 6.11566162109375 4 4 6.11566162109375 4 8.716156005859375 L 4 235.7241973876953 C 7.088851928710938 238.3721466064453 15.99017333984375 245.4370422363281 30.65542602539063 252.6224365234375 C 41.57820129394531 257.9742126464844 53.44192504882813 262.2910766601563 65.91703796386719 265.4532775878906 C 81.54554748535156 269.4148254394531 98.18046569824219 271.5638122558594 115.359733581543 271.8406677246094 C 116.4351196289063 271.8579711914063 117.5249633789063 271.8667907714844 118.5990829467773 271.8667907714844 C 135.1906585693359 271.8667907714844 151.4798126220703 269.7807312011719 167.0140075683594 265.6666259765625 C 179.4493560791016 262.3731994628906 191.43603515625 257.7791137695313 202.6410827636719 252.0119781494141 C 212.6255798339844 246.8730163574219 220.1300048828125 241.7335815429688 224.6672668457031 238.3270874023438 C 227.6581420898438 236.0815734863281 229.788330078125 234.2732849121094 231.0048980712891 233.1947021484375 L 231.3363800048828 8.71234130859375 C 231.3343200683594 6.11358642578125 229.2194671630859 4 226.6202392578125 4 L 8.716156005859375 4 M 8.716156005859375 0 L 226.6202392578125 0 C 231.4340515136719 0 235.3363952636719 3.90234375 235.3363952636719 8.716156005859375 L 235.0023193359375 234.9556274414063 C 235.0023193359375 234.9556274414063 193.2013244628906 275.8667907714844 118.5990829467773 275.8667907714844 C 117.5040969848633 275.8667907714844 116.4043273925781 275.8580017089844 115.2952346801758 275.8401184082031 C 38.62289428710938 274.6046142578125 0 237.5154418945313 0 237.5154418945313 L 0 8.716156005859375 C 0 3.90234375 3.902359008789063 0 8.716156005859375 0 Z" stroke="none" fill="#405d63" /> </g> <g transform="translate(452.234 127.918)" fill="#fff" stroke="#e3e3e4" strokeWidth="2" > <circle cx="21.79" cy="21.79" r="21.79" stroke="none" /> <circle cx="21.79" cy="21.79" r="20.79" fill="none" /> </g> <g transform="translate(86.155 62.547)" fill="#fff" stroke="#e3e3e4" strokeWidth="2" > <circle cx="15.253" cy="15.253" r="15.253" stroke="none" /> <circle cx="15.253" cy="15.253" r="14.253" fill="none" /> </g> <g transform="translate(38.216 334.927)" fill="#fff" stroke="#e3e3e4" strokeWidth="2" > <circle cx="16.343" cy="16.343" r="16.343" stroke="none" /> <circle cx="16.343" cy="16.343" r="15.343" fill="none" /> </g> <path d="M41.444,18.69H27.629a.813.813,0,0,1-.813-.813V4.063a4.063,4.063,0,0,0-8.126,0V17.878a.813.813,0,0,1-.813.813H4.063a4.063,4.063,0,0,0,0,8.126H17.878a.813.813,0,0,1,.813.813V41.444a4.063,4.063,0,0,0,8.126,0V27.629a.813.813,0,0,1,.813-.813H41.444a4.063,4.063,0,0,0,0-8.126Zm0,0" transform="translate(425.544 48.51)" fill="#c3c5c4" /> <path d="M20.064,9.048H13.376a.393.393,0,0,1-.393-.393V1.967a1.967,1.967,0,1,0-3.934,0V8.655a.393.393,0,0,1-.393.393H1.967a1.967,1.967,0,1,0,0,3.934H8.655a.393.393,0,0,1,.393.393v6.688a1.967,1.967,0,0,0,3.934,0V13.376a.393.393,0,0,1,.393-.393h6.688a1.967,1.967,0,0,0,0-3.934Zm0,0" transform="translate(16.185 383.976)" fill="#c3c5c4" /> <g transform="translate(192.928 297.883)" fill="none" stroke="#405d63" strokeWidth="4" > <rect width="126.384" height="15.253" stroke="none" /> <rect x="2" y="2" width="122.384" height="11.253" fill="none" /> </g> <g transform="translate(192.928 328.39)" fill="none" stroke="#405d63" strokeWidth="4" > <rect width="126.384" height="15.253" stroke="none" /> <rect x="2" y="2" width="122.384" height="11.253" fill="none" /> </g> <g transform="translate(223.435 358.897)" fill="none" stroke="#405d63" strokeWidth="4" > <rect width="65.371" height="15.253" stroke="none" /> <rect x="2" y="2" width="61.371" height="11.253" fill="none" /> </g> <line x2="63.192" y2="63.192" transform="translate(222.345 200.916)" fill="none" stroke="#405c63" strokeLinecap="round" strokeWidth="4" /> <line x1="63.192" y2="63.192" transform="translate(222.345 200.916)" fill="none" stroke="#405c63" strokeLinecap="round" strokeWidth="4" /> <g transform="translate(64.365 49.473)" fill="none" stroke="#405d63" strokeWidth="4" > <circle cx="192.845" cy="192.845" r="192.845" stroke="none" /> <circle cx="192.845" cy="192.845" r="190.845" fill="none" /> </g> </g> </g>
                                </svg>
                            </div>
                            <div class="FPDTTitle">
                                ${titleText}
                            </div>
                            <div class="FPDTSTitle">
                                ${subTitleText}
                            </div>
                        </div>
                    </div>
                </div>`);
            }
        }
        loadScript(
            `${'https://assets.mydashmetrics.com/dev.formio.full.min.js'}?v=${Math.floor(
                Math.random() * 10000,
            )}`,
        )
            .then(() => {
                setTitle(response?.formInfo?.form_name);
                setStyles(response?.formInfo);
                if (typeof funnelId !== 'undefined' && funnelId.length > 0) {
                    heightObserver(response.fieldsData);
                }
                let formData = response.fieldsData;
                formInfo = response.formInfo;
                let submissionData = {};
                let submitDisableData = formData.components;
                Formio.createForm(
                    document.getElementById('dcFormBuilderView'),
                    {
                        ...formData,
                        components: submitDisableData,
                    },
                    {
                        buttonSettings: {
                            showCancel: false,
                            showPrevious: true,
                            showNext: true,
                            showSubmit: true,
                        },
                        saveDraft: true,
                    },
                ).then(form => {
                    if (submissionData) form.submission = { data: submissionData };
                    if (isLocalStorageAvailable()) {
                        if (
                            JSON.parse(localStorage.getItem('form-data')) &&
                            Object.keys(JSON.parse(localStorage.getItem('form-data')))?.length
                        ) {
                            let datas = JSON.parse(localStorage.getItem('form-data') || '{}');
                            let url = window.location.href.split('/');
                            let formkey = url[url.length - 1];
                            if (datas[formkey]?.data) {
                                form.submission = { data: datas[formkey]?.data };
                            }
                        }
                    }
                    form.on('change', e => {
                        let res = { ...tmpFormValue };
                        tmpFormValue = { ...res, ...e };
                    });
                    let typingTimer;
                    let doneTypingInterval = 2000;
                    form.element.addEventListener('keyup', () => {
                        clearTimeout(typingTimer);
                        typingTimer = setTimeout(() => {
                            handleAutoSave(true);
                        }, doneTypingInterval);
                    });
                    form.element.addEventListener('keydown', () => {
                        clearTimeout(typingTimer);
                    });

                    form.on('submit', submission => {
                        if (!submitting) {
                            submitting = true;
                            handleFormSubmit(submission);
                        }
                    });
                    hideLoader();
                });
            })
            .catch(err => {
                showToast({
                    type: 'error',
                    message: err?.message || 'Something went wrong',
                });
            });
    } catch (err) {
        showToast({
            type: 'error',
            message: err?.message || 'Something went wrong',
        });
    } finally {
        hideLoader();
    }
}

await createForm();
