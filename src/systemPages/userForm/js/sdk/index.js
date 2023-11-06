import { getPublicForm } from '../api/index.js';

export async function handleForm(id, rId, urlDetailsObj) {
    const response = await getPublicForm(id, rId);
    if (typeof response === 'object' && response?.length > 0) {
        const info = response[0];
        const allData = {
            type: info.type,
            form_name: info.form_name,
            id: info.id,
            formId: info.form_secret_id,
            pixelId: info.fbPixelId,
            pageViewOption: info.page_view_option,
            onSubmitOption: info.on_submit_option,
            style: info.style,
            message: info.thank_you_message,
            redirect: info.redirectUrl,
            form_type: info.form_type,
            iscampaignConnected: info.iscampaignConnected,
            ...urlDetailsObj,
        };
        return { formInfo: allData, fieldsData: info.forms };
    } else {
        return response;
    }
}
