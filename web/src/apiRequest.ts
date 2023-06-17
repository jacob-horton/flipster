// TODO: query params?
interface RequestData {
  path: string;
  id_token: string;
  payload?: string;
}

export async function getRequest(data: RequestData) {
  return await fetch(`${process.env.NEXT_PUBLIC_API_URL}${data.path}`, {
    method: "GET",
    headers: {
      Authorization: "Bearer " + data.id_token,
      "Content-Type": "application/json",
    },
    body: data.payload,
  });
}

export async function postRequest(data: RequestData) {
  return await fetch(`${process.env.NEXT_PUBLIC_API_URL}${data.path}`, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + data.id_token,
      "Content-Type": "application/json",
    },
    body: data.payload,
  });
}
