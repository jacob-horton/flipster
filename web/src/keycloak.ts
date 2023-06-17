import getPublicURL from "./getPublicURL";

const keycloak = {
  authority: process.env.NEXT_PUBLIC_AUTH_URL ?? "",
  client_id: process.env.NEXT_PUBLIC_AUTH_CLIENT_ID ?? "",
  client_secret: process.env.NEXT_PUBLIC_AUTH_CLIENT_SECRET ?? "",

  redirect_uri: getPublicURL("/home"),
  onSigninCallback: () => { },
};

export default keycloak;
