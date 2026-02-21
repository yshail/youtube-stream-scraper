FROM mcr.microsoft.com/playwright:v1.58.1-jammy

# Set the working directory directly in the container
WORKDIR /usr/src/app

# Copy dependency files first to utilize Docker's layer caching algorithm and reinstall packages fast
COPY package*.json ./

# Install standard dependencies and TypeScript plugins
RUN npm install

# Copy all the remaining project source code 
COPY . .

# Expose the server port that Express is internally listening on
EXPOSE 3000

# Defines the command that keeps the application running persistently
CMD [ "npm", "start" ]
