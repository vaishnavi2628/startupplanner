# StartupPlanner

AI-powered business plan generator. Describe an idea, budget, location, category and target customers, and get a full analysis: target market, competitors, pricing, investment, revenue and profit, marketing, risks, growth ideas, a feasibility score and recommendations. Save plans, compare them, download PDFs, and chat with an AI assistant about each plan.

**Stack:** React + Vite + Tailwind CSS, Node.js + Express, MongoDB (Mongoose), JWT + bcrypt, Gemini or OpenAI, PDFKit.

## Quick start

Requirements: Node 18+, and MongoDB running locally or a free MongoDB Atlas cluster.

```bash
npm run install:all

cp server/.env.example server/.env     # then edit it (see below)

# terminal 1
npm run server      # API on http://localhost:5000
# terminal 2
npm run client      # app on http://localhost:5173
```

### server/.env

| Variable | Notes |
| --- | --- |
| `MONGO_URI` | `mongodb://127.0.0.1:27017/startupplanner` or your Atlas URI |
| `JWT_SECRET` | any long random string |
| `AI_PROVIDER` | `gemini`, `openai`, or `mock` |
| `GEMINI_API_KEY` / `GEMINI_MODEL` | key from https://aistudio.google.com/apikey |
| `OPENAI_API_KEY` / `OPENAI_MODEL` | key from https://platform.openai.com |
| `CLIENT_URL` | allowed CORS origin(s), comma separated |

Set `AI_PROVIDER=mock` to try the whole app with sample data and no API key.
Model names change over time. If your provider rejects the default, put a current model name in `GEMINI_MODEL` or `OPENAI_MODEL`.

## How it works

1. **Generate**: `POST /api/plans/generate` sends your inputs to the AI with a strict JSON schema. The server validates and normalizes the result (clamps scores, recomputes profit) so a slightly malformed response cannot break the UI. Nothing is saved yet.
2. **Save**: `POST /api/plans` stores the inputs and analysis against your account.
3. **Chat**: `POST /api/plans/:id/chat` answers questions with your idea and analysis as context. The last 10 messages are sent, and the conversation is saved on the plan.
4. **PDF**: `GET /api/plans/:id/pdf` streams a formatted PDF built with PDFKit.

## API

| Method | Route | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | no | Create account, returns JWT |
| POST | `/api/auth/login` | no | Log in, returns JWT |
| GET | `/api/auth/me` | yes | Current user |
| POST | `/api/plans/generate` | yes | Generate analysis (not saved) |
| POST | `/api/plans` | yes | Save a plan |
| GET | `/api/plans` | yes | List your plans |
| GET | `/api/plans/:id` | yes | One plan with chat history |
| DELETE | `/api/plans/:id` | yes | Delete a plan |
| GET | `/api/plans/:id/pdf` | yes | Download PDF |
| POST | `/api/plans/:id/chat` | yes | Ask the assistant |
| DELETE | `/api/plans/:id/chat` | yes | Clear chat |

## Project structure

```
server/
  server.js            app entry, security middleware, routes
  config/db.js         MongoDB connection
  models/              User, Plan (with embedded chat)
  controllers/         auth, plans, chat
  services/aiService.js   Gemini / OpenAI / mock + prompts + normalization
  services/pdfService.js  PDF layout
  middleware/          JWT auth, error handling
client/src/
  pages/               Home, Login/Register, Dashboard, NewPlan, PlanDetail, Compare
  components/          AnalysisView, ScoreRing, ChatPanel, Navbar, ...
  context/AuthContext  login state
```

## Production notes

- Build the client with `npm run build` and serve `client/dist` from any static host. Set `VITE_API_URL` to your API URL at build time, and `CLIENT_URL` on the server to your site's origin.
- Passwords are hashed with `bcryptjs` (12 rounds), a pure-JS implementation with the same API as `bcrypt` and no native build step. To use native `bcrypt`, swap the import in `server/models/User.js`.
- Auth routes and AI routes are rate limited. Tune the limits in `server/server.js` and `server/routes/planRoutes.js`.
- The JWT is kept in `localStorage` for simplicity. For stricter security, move it to an httpOnly cookie.
- AI figures are estimates. The PDF carries a disclaimer, and users should validate numbers with local research.

## Ideas for next steps

Password reset by email, editable plans with re-analysis, a shareable read-only plan link, charts for year-one projections, and a Dockerfile plus docker-compose with MongoDB.
