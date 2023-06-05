const keycloak = {
  authority: import.meta.env.VITE_AUTH_SERVER_URL,
  client_id: import.meta.env.VITE_AUTH_CLIENT_ID,
};

export default keycloak;
