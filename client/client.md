#WAH client
## Setup
This project requires you to have node.js and angular CLI installed.
To install the angular CLI simply type `npm i -g @angular/cli` in the terminal/CMD.
When that is done, run `npm i` in the client directory to install all the packages.

## Updating Angular
To update angular, simply type `ng update` into the terminal while in the client directory.
Then just paste all the available updates into the terminal.

#### Building and running the development server
While you are developing on the project, use the following command to serve the web application:
```
ng serve
```

In order to run the tests you do:
```
ng test --sm=false --code-coverage
```

For building the project for production do:
```
ng build --prod
```