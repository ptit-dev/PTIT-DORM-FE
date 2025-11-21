
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";




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
		const fetchTokenAndProfile = async () => {
			try {
				const clientId = "75dc578e-179c-4375-8408-807e01f8153c"; // Thay bằng clientId thực tế
				const tenant = "common"; // hoặc tenantId
				const redirectUri = "http://localhost:3000/oauth-callback"; // Thay bằng redirectUri thực tế
				const codeVerifier = localStorage.getItem("ms_code_verifier");
				if (!codeVerifier) throw new Error("Không tìm thấy code_verifier PKCE");

				const body = new URLSearchParams({
					client_id: clientId,
					grant_type: "authorization_code",
					code: code,
					redirect_uri: redirectUri,
					code_verifier: codeVerifier,
				});
				const resToken = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
					method: "POST",
					headers: { "Content-Type": "application/x-www-form-urlencoded" },
					body,
				});
				const tokenData = await resToken.json();
				if (!tokenData.access_token) throw new Error("Không lấy được access_token từ Microsoft");

				const resProfile = await fetch("https://graph.microsoft.com/v1.0/me", {
					headers: { Authorization: `Bearer ${tokenData.access_token}` }
				});
				if (!resProfile.ok) {
					const errText = await resProfile.text();
					throw new Error(`Graph API error: ${resProfile.status} - ${errText}`);
				}
				const user = await resProfile.json();
				localStorage.setItem("ptit_access_token", tokenData.access_token);
				localStorage.setItem("ptit_user", JSON.stringify({
					display_name: user.displayName,
					email: user.mail || user.userPrincipalName,
					user_id: user.id,
					ms_raw: user,
					roles: ["guest"],
				}));
				setMessage("Đăng nhập Microsoft thành công! Đang chuyển hướng...");
				setTimeout(() => navigate("/home"), 1200);
			} catch (err) {
				setMessage("Lỗi đăng nhập Microsoft: " + (err?.message || err));
				setTimeout(() => navigate("/"), 2500);
			}
		};
		fetchTokenAndProfile();
	}, [navigate]);

	return (
		<div className="flex items-center justify-center min-h-screen">
			<div className="text-lg font-semibold">{message}</div>
		</div>
	);
};

export default OauthCallback;


