# Node Graph Editor (Full-Stack TypeScript)

A full-stack, feature-rich interactive Node Graph Editor built with **Next.js + TypeScript** on the frontend, **Express + TypeScript** on the backend, and **MongoDB (Mongoose)** for graph cloud persistence and action logging.

---

## 🌟 Key Features

1. **Interactive Canvas**:
   - Canvas showing rectangular nodes with text header titles and customizable text labels inside.
   - Rectangular glassmorphism nodes with color accent headers (Indigo, Emerald, Amber, Rose, Cyan).

2. **Node Creation & Editing**:
   - **Double-click empty canvas space** to instantly spawn a new node at world coordinates.
   - **Double-click node title or text label** for inline content editing.
   - Click **"+ Add Label"** inside any node to add dynamic label items.

3. **Node Dragging**:
   - Drag node headers or body to smoothly move nodes around the canvas.

4. **Connection Wires & Handles**:
   - Port handle dots on left (Input) and right (Output) edges of nodes.
   - **Drag from an output handle to an input handle** to create curved SVG bezier connections with directional arrow markers (`<marker id="arrow">`).
   - Connections stay smoothly attached to nodes in real-time while panning or dragging nodes.

5. **Selection & Confirmation Deletion**:
   - Single-click any node to select it with a glowing ring outline.
   - Press `Delete` or `Backspace` key on a selected node to bring up a **custom deletion confirmation modal** ("Are you sure you want to delete '[Node Title]'? This will remove 1 node and 2 connected links.").

6. **Cursor-Centered Pan & Zoom**:
   - Pan canvas by dragging empty background.
   - Zoom smoothly with mouse scroll wheel **centered accurately at the cursor position**.

7. **Floating Toolbar & Action Logs**:
   - Zoom In (`+`), Zoom Out (`-`), and Reset View (`1:1`) controls.
   - **Live Node Count** and **Live Connection Wire Count** badges.
   - **Real-Time Activity Log Drawer**: Side panel tracking all graph operations with timestamps (`NODE_CREATED`, `TITLE_EDITED`, `CONNECTION_CREATED`, `NODE_DELETED`, `GRAPH_SAVED`).

8. **Cloud Persistence & User Authentication**:
   - User Registration (`/api/auth/register`) & Login (`/api/auth/login`) with JWT security.
   - Save graphs directly to **MongoDB**.
   - Saved Graphs modal for creating, switching, and deleting multiple graphs stored in cloud database.

---

## 🚀 Getting Started

### 1. Environment Setup

Seed your MongoDB connection URL in the root `.env` file:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/nodegraph_db?retryWrites=true&w=majority
JWT_SECRET=your_production_jwt_secret_key_2026
FRONTEND_URL=http://localhost:3000
```

---

### 2. Start the Backend (Express + TypeScript)

```bash
cd backend
npm install
npm run dev
```

*Backend server runs on `http://localhost:5000`*

---

### 3. Start the Frontend (Next.js + TypeScript)

```bash
cd frontend
npm install
npm run dev
```

*Frontend application runs on `http://localhost:3000`*
