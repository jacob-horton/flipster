// TODO: query params?
export async function getRequest(path: string, id_token: string) {
  return await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    method: "GET",
    headers: {
      Authorization: "Bearer " + id_token,
      "Content-Type": "application/json",
    },
  });
}

export async function postRequest(
  path: string,
  id_token: string,
  payload: string
) {
  return await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + id_token,
      "Content-Type": "application/json",
    },
    body: payload,
  });
}
