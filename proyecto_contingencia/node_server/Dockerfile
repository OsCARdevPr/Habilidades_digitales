# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock) to leverage Docker cache
COPY package*.json ./

# Remove package-lock.json and install project dependencies
RUN rm -f package-lock.json && npm install

# Copy the rest of the application code into the container
COPY . .

# Make port 3000 available to the world outside this container
EXPOSE 3000

# Define environment variable (can be overridden at runtime)
ENV NODE_ENV development

# Run the app when the container launches
CMD ["npm", "start"]
