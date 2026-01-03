// // Cấu hình endpoint API backend production
// export const API_BASE_URL = "https://f3dbbc1d81cb.ngrok-free.app/ptit-dorm/be";
// export const WEBSOCKET_URL = "wss://f3dbbc1d81cb.ngrok-free.app/ptit-dorm/ws/ws/v1/admin-connect";
// // export const API_BASE_URL = "http://26.45.132.231:8008";
// // export const API_BASE_URL = "http://26.45.132.231:8999";
// // export const API_BASE_URL = "http://172.16.220.172:8999";
// // export const API_BASE_URL = "http://localhost:8999"; 


// Cấu hình endpoint API backend development
// export const API_BASE_URL = "https://festinately-lardiest-cori.ngrok-free.dev/ptit-dorm/be"; 
// export const WEBSOCKET_URL = "wss://festinately-lardiest-cori.ngrok-free.dev/ptit-dorm/ws/ws/v1/admin-connect";
export const API_BASE_URL =import.meta.env.VITE_API_BASE_URL as string;
export const WEBSOCKET_BACKEND_URL = import.meta.env.VITE_WEBSOCKET_BACKEND_URL as string;
export const WEBSOCKET_CHATBOT_URL = import.meta.env.VITE_CHATBOT_WEBSOCKET_URL as string;