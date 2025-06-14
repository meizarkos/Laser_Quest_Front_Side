import TokenStore from './tokenStore';
export async function apiCall(route : string, verb: string,body : any):Promise<Response> {
   const options: RequestInit = {
    method: verb,
    headers: {
      'Content-Type': 'application/json',
      'authorization': 'Bearer ' + TokenStore.getToken(),
    },
  };

  if (body !== undefined && body !== null) {
    options.body = JSON.stringify(body);
  }

  return fetch("http://localhost:2999/"+route, options);
}