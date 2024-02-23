import {redirectTo} from "./redirectTo";

// const ServiceUrl = 'http://localhost:5000/';
const ServiceUrl = '/';
const debouncedFetch = createDebouncedFetch(100); // Debounce with a 500ms delay
const debouncedFunctions = {};
let userInfo = {}
export const graphqlPost = async (gqlString, debounced = true) => {
    if(!debounced){
        return fetchFunction(gqlString)
    }
    if(debouncedFunctions[gqlString] && debouncedFunctions[gqlString].data){
        return debouncedFunctions[gqlString].data
    }
    gqlString = gqlString.trim();
    gqlString = gqlString.replaceAll('\n', ' ')
    return debouncedFetch(gqlString)
}

function createDebouncedFetch(delay) {

    function debounceFetch(gqlString) {
        let timeoutId;

        return new Promise((resolve, reject) => {
            const context = this;

            // Create a unique debounced function for each searchTerm
            if (!debouncedFunctions[gqlString]) {
                debouncedFunctions[gqlString] = {}
                debouncedFunctions[gqlString].function = function () {
                    return new Promise(async (innerResolve, innerReject) => {
                        try {
                            const data = await fetchFunction(gqlString);
                            innerResolve(data);
                        } catch (error) {
                            innerReject(error);
                        }
                    });
                };
            }else {
                    clearTimeout( debouncedFunctions[gqlString].timeoutId)
            }
            debouncedFunctions[gqlString].timeoutId = setTimeout(async function () {
                try {
                    const data = await debouncedFunctions[gqlString].function();
                    debouncedFunctions[gqlString].data = data
                    resolve(data);
                } catch (error) {
                    reject(error);
                }
            }, delay);
        });
    }

    return debounceFetch;
}

// Example usage:


const fetchFunction = (gqlString)=> {
    return fetch(`${ServiceUrl}api`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'token': window.localStorage.getItem('rndString')
        },
        body: JSON.stringify({query: gqlString})
    }).then(r => r.json())
        .catch((e)=> {
            throw e
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

    if(!Object.keys(userInfo || {}).length){
        const data = await graphqlPost(gql);
        userInfo = data.data.userInfo;
    }
    if(userInfo.email === 'info@siodelivery.ge') window.localStorage.setItem('isEmployee', 'true');
    else window.localStorage.removeItem('isEmployee')
    if (!redirect) return userInfo.status
    // window.location.pathname !== '/login'
    let redirectUrl;
    switch (userInfo.status) {
        case 'client':
            redirectUrl = ('/client')
            break;
        case 'delivery':
            redirectUrl = ('/delivery')
            break;
        case 'admin':
            redirectUrl = ('/panel')
            break;
        default:
            redirectUrl = ('/companyDetails')
            break
    }
    if(redirectUrl !== window.location.pathname){
        setTimeout(()=> redirectTo(redirectUrl), 200)

    }
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
