# Base image
FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install dependencies strictly from package-lock
RUN npm ci

# Bundle app source
COPY . .

# Build the TypeScript code
RUN npm run build

# Expose port (must match PORT in env)
EXPOSE 5000

# Start command
CMD [ "npm", "start" ]
