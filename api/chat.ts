import { handleChatRequest } from '../server/chat/handler.js';

// POST /api/chat: the portfolio chatbot. The logic lives in server/chat so the Vite dev
// server can run the same handler locally.
export const config = {
  maxDuration: 60,
};

export default {
  fetch: handleChatRequest,
};
