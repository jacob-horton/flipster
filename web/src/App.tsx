import { GoogleLogin } from "@react-oauth/google";

const App = () => {
  return (
    <div>
      <h1 className="text-center text-2xl p-10">Flipster</h1>
      <GoogleLogin
        onSuccess={(resp) => console.log(resp)}
        onError={() => console.log("Login failed")}
        theme="filled_blue"
        shape="circle"
        useOneTap
      />
    </div>
  );
};

export default App;
