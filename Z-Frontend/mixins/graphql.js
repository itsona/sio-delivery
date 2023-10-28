// const ServiceUrl = 'http://192.168.1.8:5000/';
// const ServiceUrl = 'http://94.43.110.189:5000/';
import {redirectTo} from "./redirectTo";

// const ServiceUrl = 'http://localhost:5000/';
const ServiceUrl = '/';

export const graphqlPost = (gqlString) => {
    return fetch(`${ServiceUrl}api`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'token': window.localStorage.getItem('rndString')
        },
        body: JSON.stringify({query: gqlString})
    }).then(r => r.json())
        .catch(()=> {
            throw 'error'
        })
}


export const handleRequest = async (redirect) => {
    const gql = `
        {
            userInfo{
                status
                email
            }
        }`
    const data = await graphqlPost(gql);
    const userInfo = data.data.userInfo;
    if(userInfo.email === 'info@siodelivery.ge') window.localStorage.setItem('isEmployee', 'true');
    else window.localStorage.removeItem('isEmployee')
    if (!redirect) return userInfo.status
    if (userInfo.status === 'client') redirectTo('/client');
    if (userInfo.status === 'delivery') redirectTo('/delivery');
    if (userInfo.status === 'admin') redirectTo('/panel');
    if (!userInfo.status) redirectTo('/companyDetails')
    return userInfo.status
}

// export function getImages(imageNames) {
//     let promises= [];
//     imageNames.map((name) => {
//         promises.push(requestImage(name));
//     })
//     Promise.all(promises).then((res)=> {
//         console.log(res);
//     })
// }
//
// function requestImage(name){
//     return fetch(`http://localhost:5000/image/${name}`, {
//         method: 'GET',
//         headers: {
//             'Content-Type': 'application/json',
//             'Accept': 'application/json',
//         }
//     }).then()
// }
