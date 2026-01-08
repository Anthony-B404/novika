# ===========================================
# Stage 1: Dependencies
# ===========================================
FROM node:20-alpine AS deps

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install ffmpeg (includes ffprobe) for audio processing in development
RUN apk add --no-cache ffmpeg

# Set ffmpeg/ffprobe paths for the application
ENV FFMPEG_PATH=/usr/bin/ffmpeg
ENV FFPROBE_PATH=/usr/bin/ffprobe

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (including devDependencies for build)
RUN pnpm install --frozen-lockfile

# ===========================================
# Stage 2: Build
# ===========================================
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the AdonisJS application
RUN node ace build

# ===========================================
# Stage 3: Production
# ===========================================
FROM node:20-alpine AS production

# Install pnpm for production dependencies
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install ffmpeg (includes ffprobe) for audio processing and su-exec for entrypoint
RUN apk add --no-cache ffmpeg su-exec

# Set ffmpeg/ffprobe paths for the application
ENV FFMPEG_PATH=/usr/bin/ffmpeg
ENV FFPROBE_PATH=/usr/bin/ffprobe

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S adonisjs -u 1001

WORKDIR /app

# Copy package files for production install
COPY package.json pnpm-lock.yaml ./

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built application from builder stage
COPY --from=builder /app/build ./

# Copy entrypoint script
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Create storage and tmp directories for file uploads and audio processing
RUN mkdir -p /app/storage/uploads /app/tmp && chown -R adonisjs:nodejs /app/storage /app/tmp

# Set ownership
RUN chown -R adonisjs:nodejs /app

# Note: Not switching to non-root user here - entrypoint handles this via su-exec
# This allows entrypoint to create directories with correct ownership at runtime

# Expose port
EXPOSE 3333

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3333/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))" || exit 1

# Entrypoint creates dirs and drops to adonisjs user
ENTRYPOINT ["/app/entrypoint.sh"]

# Default command (can be overridden for workers)
CMD ["node", "bin/server.js"]
