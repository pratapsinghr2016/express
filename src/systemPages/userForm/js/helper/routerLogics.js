export const getParams = () => {
    let paramsObj = {};
    let params = new URLSearchParams(location.search);
    for (let key of params.keys()) {
        paramsObj[key] = params.get(key);
    }
    return paramsObj;
};
