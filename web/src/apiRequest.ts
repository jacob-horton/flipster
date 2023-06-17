interface PostRequestData {
  path: string;
  id_token: string;
  payload?: string;
}

interface GetRequestData {
  path: string;
  id_token: string;
  queryParams?: { [key: string]: any };
}

export async function getRequest(data: GetRequestData) {
  const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}${data.path}`);

  if (data.queryParams !== undefined) {
    for (const key of Object.keys(data.queryParams)) {
      url.searchParams.append(key, data.queryParams[key].toString());
    }
  }

  console.log(url);

  return await fetch(url, {
    method: "GET",
    headers: {
      Authorization: "Bearer " + data.id_token,
      "Content-Type": "application/json",
    },
  });
}

export async function postRequest(data: PostRequestData) {
  return await fetch(`${process.env.NEXT_PUBLIC_API_URL}${data.path}`, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + data.id_token,
      "Content-Type": "application/json",
    },
    body: data.payload,
  });
}
