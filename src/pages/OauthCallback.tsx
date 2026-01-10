import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "@/config/apiConfig";

interface LoginUser {
	user_id: string;
	avatar?: string | null;
	display_name: string;
	email: string;
	username: string;
	roles: string[];
}

interface MicrosoftLoginResponse {
	access_token?: string;
	refresh_token?: string;
	user?: LoginUser;
	message?: string;
	code?: number;
}

interface MicrosoftTokenResponse {
	access_token?: string;
	token_type?: string;
	expires_in?: number;
	scope?: string;
	error?: string;
	error_description?: string;
}

const OauthCallback = () => {
	const navigate = useNavigate();
	const [message, setMessage] = useState("Đang xử lý đăng nhập Microsoft...");

	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const code = urlParams.get("code");
		if (!code) {
			setMessage("Không tìm thấy mã xác thực Microsoft. Vui lòng đăng nhập lại.");
			setTimeout(() => navigate("/"), 2000);
			return;
		}

		const codeVerifier = localStorage.getItem("ms_code_verifier");
		if (!codeVerifier) {
			setMessage("Không tìm thấy code_verifier PKCE. Vui lòng thử đăng nhập lại.");
			setTimeout(() => navigate("/"), 2500);
			return;
		}

		const redirectUri: string = import.meta.env.VITE_MICROSOFT_REDIRECT_URI as string;
		const clientId: string = import.meta.env.VITE_MICROSOFT_CLIENT_ID as string;
		const tenant = "common";

		const loginWithBackend = async () => {
			try {
				// 1) FE đổi code -> access_token với Microsoft (PKCE)
				const tokenBody = new URLSearchParams({
					client_id: clientId,
					grant_type: "authorization_code",
					code,
					redirect_uri: redirectUri,
					code_verifier: codeVerifier,
				});

				const tokenRes = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
					method: "POST",
					headers: { "Content-Type": "application/x-www-form-urlencoded" },
					body: tokenBody,
				});

				const tokenData: MicrosoftTokenResponse = (await tokenRes.json().catch(() => ({}))) as MicrosoftTokenResponse;
				if (!tokenRes.ok || !tokenData.access_token) {
					const errMsg = tokenData.error_description || tokenData.error || "Không lấy được access_token từ Microsoft";
					setMessage(`Lỗi đăng nhập Microsoft: ${errMsg}`);
					setTimeout(() => navigate("/"), 3000);
					return;
				}

				const res = await fetch(`${API_BASE_URL}/oauth/microsoft/callback`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"ngrok-skip-browser-warning": "true",
					},
					body: JSON.stringify({
						access_token: tokenData.access_token,
					}),
				});

				const data: MicrosoftLoginResponse | null = (await res
					.json()
					.catch(() => null)) as MicrosoftLoginResponse | null;

				if (!res.ok || !data || !data.access_token) {
					const beMessage: string = data && data.message ? data.message : "Đăng nhập Microsoft thất bại.";
					setMessage(`Lỗi đăng nhập Microsoft: ${beMessage}`);
					setTimeout(() => navigate("/"), 3000);
					return;
				}

				localStorage.setItem("ptit_access_token", data.access_token);
				if (data.refresh_token) {
					localStorage.setItem("ptit_refresh_token", data.refresh_token);
				}
				if (data.user) {
					localStorage.setItem("ptit_user", JSON.stringify(data.user));
				}

				setMessage("Đăng nhập Microsoft thành công! Đang chuyển hướng...");
				setTimeout(() => navigate("/home"), 1200);
			} catch (err: unknown) {
				let msg = "Đăng nhập Microsoft thất bại.";
				if (err instanceof Error) {
					msg = err.message;
				}
				setMessage(`Lỗi đăng nhập Microsoft: ${msg}`);
				setTimeout(() => navigate("/"), 3000);
			}
		};

		loginWithBackend();
	}, [navigate]);

	return (
		<div className="flex items-center justify-center min-h-screen">
			<div className="text-lg font-semibold">{message}</div>
		</div>
	);
};

export default OauthCallback;


