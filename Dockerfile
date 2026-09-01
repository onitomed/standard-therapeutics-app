# ---- Base image ----
# Debian-based slim image so apt-get / qpdf are available.
FROM node:20-bookworm-slim

# ---- System dependencies ----
# qpdf is invoked directly by backend/controllers/patientDataController.js and
# checked for on startup in backend/server.js, so it must exist as a real
# system binary on PATH (not an npm package).
RUN apt-get update \
    && apt-get install -y --no-install-recommends qpdf \
    && rm -rf /var/lib/apt/lists/*

# ---- App setup ----
WORKDIR /app

# Copy manifest + lockfile first so `npm ci` is cached unless dependencies change
COPY package.json package-lock.json ./

# npm ci: this repo has a committed package-lock.json, so use it for a fully
# reproducible install. --omit=dev skips mocha/chai/nodemon (test-only deps,
# not needed to run the server).
RUN npm ci --omit=dev

# Copy the rest of the application source
COPY . .

# Render assigns a port at runtime via the PORT env var; backend/server.js
# already reads process.env.PORT (falling back to 5000), so no code change
# is needed. This ENV is just a sane default for local `docker run` testing.
ENV PORT=5000
EXPOSE 5000

# Matches "scripts.start": "node backend/server.js" in package.json
CMD ["npm", "start"]
