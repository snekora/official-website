import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import loginBgImage from "../../../assets/login/image.png";
import snekoraLogo from "../../../assets/logo/snekora_logo.png";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { googleLogin } from "../redux/authSlice";

const GoogleLogo = () => (
  <svg className="w-5 h-5" viewBox="0 0 48 48">
    <path
      fill="#FFC107"
      d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.239 36 24 36c-6.627 0-12-5.373-12-12S17.373 12 24 12c3.059 0 5.842 1.154 7.959 3.041l5.657-5.657C34.053 6.053 29.27 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
    />
    <path
      fill="#FF3D00"
      d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.959 3.041l5.657-5.657C34.053 6.053 29.27 4 24 4c-7.682 0-14.347 4.337-17.694 10.691z"
    />
    <path
      fill="#4CAF50"
      d="M24 44c5.167 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.146 35.091 26.692 36 24 36c-5.218 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.51 39.556 16.227 44 24 44z"
    />
    <path
      fill="#1976D2"
      d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.084 5.57l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
    />
  </svg>
);

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading } = useSelector((state) => state.auth);

  const login = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async (codeResponse) => {
      try {
        const result = await dispatch(googleLogin(codeResponse.code));

        if (googleLogin.fulfilled.match(result)) {
          toast.success("Signed in successfully!");
          navigate("/");
        } else {
          toast.error(result.payload || "Login failed");
        }
      } catch (err) {
        toast.error("Login failed");
      }
    },
    onError: () => {
      toast.error("Google Sign-In failed. Please try again.");
    },
  });

  return (
    <div className="h-dvh flex flex-col lg:flex-row bg-[#0b0b0c] text-[#F5F5F0] font-sans overflow-hidden">
      {/* Left */}
      <div className="relative w-full lg:w-1/2 flex-1 lg:flex-none lg:h-dvh bg-black overflow-hidden">
        <img
          src={loginBgImage}
          alt="Sneaker lifestyle shot"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />

        <div className="absolute inset-0 bg-linear-to-t from-[#0b0b0c] via-transparent lg:bg-linear-to-r lg:from-transparent lg:to-[#0b0b0c]" />

        <div className="absolute top-8 left-8 lg:top-12 lg:left-12 z-10">
          <img
            src={snekoraLogo}
            alt="Snekora Logo"
            className="h-6 md:h-8 object-contain"
          />
        </div>
      </div>

      {/* Right */}
      <div className="relative w-full lg:w-1/2 shrink-0 flex items-center justify-center p-6 pb-10 lg:p-16 z-10">
        <div className="w-full max-w-sm">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-2">
            BACK IN
            <br />
            ROTATION
          </h1>

          <p className="text-zinc-400 text-sm mb-8">
            Sign in to manage your kicks, drops & trades.
          </p>

          {/* Custom Google Login Button */}
          <button
            onClick={() => login()}
            disabled={loading}
            type="button"
            className="w-full bg-white text-black font-semibold text-sm py-3.5 px-6 rounded-xl flex items-center justify-center gap-3 hover:bg-zinc-200 transition-colors group disabled:opacity-60"
          >
            <GoogleLogo />

            <span>{loading ? "Signing in..." : "Continue with Google"}</span>

            <ArrowRight
              size={18}
              className="text-black/50 group-hover:translate-x-1 transition-transform"
            />
          </button>

          <p className="text-center text-xs text-zinc-500 mt-5">
            By continuing, you agree to our{" "}
            <Link
              to="/terms"
              className="text-zinc-400 underline hover:text-white"
            >
              Terms
            </Link>{" "}
            &{" "}
            <Link
              to="/privacy"
              className="text-zinc-400 underline hover:text-white"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
