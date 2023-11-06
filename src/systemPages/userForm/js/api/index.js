import { showToast } from '../helper/toaster.js';
const mainUrl = `https://74c0-45-123-92-83.ngrok-free.app/v1`;

const baseUrl = `${mainUrl}/forms`;

export const getPublicForm = async (id, rId = null, dataToSend = null) => {
    let url = dataToSend ? `${mainUrl}/e/wasabi/tools/forms/tool_id/${id}` : `${baseUrl}/${id}`;
    url = rId === null ? url : `${url}?rid=${rId}`;
    let init = {
        method: dataToSend ? 'POST' : 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    };

    try {
        if (dataToSend) {
            init.body = JSON.stringify(dataToSend);
        }
        const response = await fetch(url, init);
        const { success, data, message } = await response.json();
        if (success) {
            return data;
        } else {
            showToast({
                type: 'error',
                message: message,
            });
            return 'Error:' + message;
        }
    } catch (err) {
        showToast({
            type: 'error',
            message: err?.message || 'Failed to fetch form',
        });
        throw new Error(err);
    }
};

export const publicFileUpload = async (file, fileDetails, formId, onProgressChange) => {
    try {
        let dataToSend = {
            file_type: fileDetails.type,
            file_name: fileDetails.name.replaceAll(' ', '_'),
            file_size: fileDetails.size,
        };
        let data = await getPublicForm(formId, null, dataToSend);
        let config = {
            apiVersion: '2006-03-01',
            accessKeyId: data?.credentials.AccessKeyId,
            secretAccessKey: data?.credentials.SecretAccessKey,
            sessionToken: data?.credentials.SessionToken,
            bucketName: data?.additionalInfo.bucket,
            region: 'us-east-1',
            endpoint: 'https://s3.wasabisys.com',
            ACL: 'private',
        };
        var myBucket = data?.additionalInfo.bucket;
        var myKey = data?.key;

        try {
            AWS.config.update(config);
            let fileUpload = new AWS.S3.ManagedUpload({
                params: {
                    Bucket: myBucket,
                    Key: myKey,
                    Body: new Uint8Array(await file.arrayBuffer()),
                },
            });

            return new Promise((resolve, reject) => {
                fileUpload.send(async (err, resfile) => {
                    if (err) {
                        reject({ status: 'Failed', error: err });
                    } else {
                        resolve({
                            status: 'Success',
                            key: myKey,
                            bucket: resfile.Bucket,
                        });
                    }
                });
                fileUpload.on('httpUploadProgress', progressEvent => {
                    onProgressChange(progressEvent, fileDetails.id);
                });
            });
        } catch (err) {
            return { status: 'Failed', error: err };
        }
    } catch (err) {
        return { status: 'Failed', error: err };
    }
};
