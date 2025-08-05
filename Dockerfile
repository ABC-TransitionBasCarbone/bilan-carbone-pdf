# Use the official Playwright image which includes Node.js and browser dependencies
FROM mcr.microsoft.com/playwright:v1.54.0-noble

# Set the working directory
WORKDIR /app

# Create a non-root user for security
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Copy package.json and yarn.lock first for better Docker layer caching
COPY package.json yarn.lock ./

# Install dependencies
# Use --frozen-lockfile to ensure reproducible builds
# Use --production=false to install dev dependencies needed for build
RUN yarn install --frozen-lockfile --production=false

# Copy source code
COPY . .

# Build the TypeScript code
RUN yarn build

# Remove dev dependencies to reduce image size
RUN yarn install --frozen-lockfile --production=true && yarn cache clean

# Change ownership of the app directory to the non-root user
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose the port the app runs on
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Start the application
CMD ["node", "dist/index.js"]