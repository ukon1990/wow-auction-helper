#WAH client
This project requires you to have a blizzard API key.
Your api key is stored in ``src/app/service/keys.ts`` (you need to create this file)

The file should look like this (soon to be depricated):
```
export class Keys {
    public static blizzard = 'a string with your api key';
}

```

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