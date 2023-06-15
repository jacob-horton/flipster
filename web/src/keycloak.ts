const keycloak = {
  authority: process.env.NEXT_PUBLIC_AUTH_URL,
  client_id: process.env.NEXT_PUBLIC_AUTH_CLIENT_ID,
};

export default keycloak;
