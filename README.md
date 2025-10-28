# node-template

Initial NodeJs Project setup which includes:
1. Professional folder structure
2. Nodejs routing
3. MVC structure
4. Authenticaation flow
5. OS Modules
6. FileSystem Modules
7. DB Connection (MySQL)
8. Global API response handling
9. .env file
10. Nodemon for hot reload
11. Bcryptjs for password hashing
12. Typescript support
13. Middlewares
14. CRUD operations template
15. Swagger integration


# Set-up

Easy setup guide, Follow along to run project locally.

### Step-1:
-> Clone the repo using `git clone <url>` or any other option preffred.

### Step-2:
-> Install packages using `npm install` OR `npm i`.

### Step-3:
-> Create .env file in root folder.


  `PORT=8000`
  
  `BASE_URL=v1/api`

### Step-4:
-> Run the project using `npm run dev`.

### Step-5:
-> Server has been started at "http://localhost:8000/v1/api".

### Step-6:
-> Access swagger by visiting at "http://localhost:8000/v1/api/api-docs".


# Bonus Tip:

If you want to add debugger to your project. Here is the file

`{`

`    "version": "0.2.0",`

`    "configurations": [`

`        {`

`            "type": "node",`

`            "request": "launch",`

`            "name": "Launch Program",`

`            "program": "${workspaceFolder}/index.ts",`

`            "restart": true,`

`            "runtimeExecutable": "nodemon",`

`            "console": "integratedTerminal"`

`        }`

`    ]`

`}`

Create '.vscode' folder and inside it create new file with name `launch.json` and add above content.
