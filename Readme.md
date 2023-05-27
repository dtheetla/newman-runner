# Setup
1. install dependencies using - "npm install"
2. setup .env file based on env.template
3. Build the application using "npm build"
4. Run the application - "npm start"


# Usage
1. call the api with tenant and env
   ex: http://localhost:4000/run?tenant=tenant1&env=qa
2. Add the filename of collection and environment files in the .env
   For ex: for the above tenant and env
   tenant1_qa=filename.json
   tenant1_qa_env=env_filename.json
3. update the webhook url, the result summary is posted to the slack channel
