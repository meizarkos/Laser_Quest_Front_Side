import TokenStore from './tokenStore';

export async function apiCall(route : string, verb: string,body : any):Promise<Response | null> {
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

  try {
    const response = await fetch("http://145.223.34.159:3010/" + route, options);
    return response;
  } catch (error) {
    console.error("Network error in apiCall:", error);
    return null;
  }
}