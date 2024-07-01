# WebScraping-API

This project involves developing, implementing, and maintaining a web scraping solution along with a RESTful API. The project includes orchestrating ETL processes and ensuring smooth operation on AWS. The solution is designed to scrape data from the [Public Register](https://members.collegeofopticians.ca/Public-Register) directory and expose it through a RESTful API.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Setup Instructions](#setup-instructions)
   - [Local Setup](#local-setup)
3. [Usage](#usage)
4. [API Endpoints](#api-endpoints)
5. [EC2 Setup](#ec2-setup)[
6. [CI/CD Pipeline](#cicd-pipeline)
7. [Scheduler Setup](#scheduler-setup)
8. [Logging and Monitoring](#logging-and-monitoring)

## Prerequisites

- Node.js (version 18.x or later)
- npm (Node Package Manager)
- AWS Account
- AWS CLI configured with necessary permissions
- IAM role with appropriate permissions for AWS Lambda and EC2
- GitHub account

## Setup Instructions

### Local Setup

1. **Clone the repository:**

   ```sh
   git clone https://github.com/your-username/webscraper.git
   cd webscraper

2. **Install dependencies:**

npm install


3. **Set up environment variables:**

Create a `.env` file in the root directory of the project and add the following variables:

USERNAME_API=your-username

PASSWORD_API=your-password

JWT_SECRET=your-secret

4. **Run the application:**

npm start

## Usage

### Running the Web Scraper

You can trigger the web scraper by making a POST request to the `/scrape` endpoint. Make sure you have obtained a valid token by logging in.

### Example Request

1. **Login to get a token:**

curl -X POST http://localhost:3000/login -H "Content-Type: application/json" -d '{"username": "your-username", "password": "your-password"}'

Copy the token from the response.

2. **Trigger the scraper:**

curl -X GET http://localhost:3000/scrape -H "Authorization: Bearer your-token"

## API Endpoints

**POST /login**
- Description: Authenticates the user and returns a JWT token.
- Request Body: `{ "username": "your-username", "password": "your-password" }`
- Response: `{ "token": "your-jwt-token" }`

**GET /scrape**
- Description: Triggers the web scraper and returns the scraped data.
- Headers: `{ "Authorization": "Bearer your-token" }`
- Response: JSON data with the scraped information.

## EC2 Setup

The application is deployed on an EC2 instance. Nginx is used to handle incoming requests and redirect them from port 80 to port 3000 where the Node.js application is running.

- **Nginx Configuration:**
- Nginx is installed and configured to handle incoming requests on port 80.
- The default configuration recommended by PM2 is used to redirect requests from port 80 to port 3000.

Example Nginx configuration:
```nginx
upstream my_nodejs_upstream {
 server 127.0.0.1:3000;
 keepalive 64;
}

server {
 listen 80 default_server;
 listen [::]:80 default_server;

 server_name _;

 location / {
     proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
     proxy_set_header X-Real-IP $remote_addr;
     proxy_set_header Host $http_host;

     proxy_http_version 1.1;
     proxy_set_header Upgrade $http_upgrade;
     proxy_set_header Connection "upgrade";

     proxy_pass http://my_nodejs_upstream/;
     proxy_redirect off;
     proxy_read_timeout 240s;
 }
}
```
## CI/CD Pipeline

The CI/CD pipeline is configured using GitHub Actions to automate the deployment process.

1. **GitHub Actions Workflow:**
- The workflow is triggered on commits to the `main` branch.
- It includes steps for installing dependencies, running tests, and deploying to EC2.

2. **Environment Variables:**
- Store sensitive information such as API credentials and secrets in GitHub Secrets.

3. **Deployment Steps:**
- Checkout code
- Set up Node.js
- Install dependencies
- Run tests
- Deploy to EC2
- Create .env file on EC2
- Restart the application using PM2


## Scheduler Setup

The scraping process is automated using AWS Lambda and CloudWatch Events.


1 - **AWS Lambda Function:**
- A Lambda function is set up to authenticate and trigger the scraper.
- The Lambda function has the necessary IAM role and permissions.

2 - **CloudWatch Event Rule:**
- A CloudWatch Event rule is created to trigger the Lambda function at the desired schedule (e.g., once a day).


## Logging and Monitoring

- **PM2 Logs:**
- Access logs using `pm2 logs`.
- **CloudWatch Logs:**
- Monitor Lambda function logs in AWS CloudWatch.

