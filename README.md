# RelApp

## Getting started

Install project dependencies

`npm install`

Run in separate terminal to start the app

`npm run dev`

(Optional) Run in separate terminal for auto reload browser proxy

`npm run ui`

Open http://localhost:8081 in your browser (if the last command have not opened or you accidentaly closed) if you using the auto reload
otherwise open http://localhost:8080

## Templates

This project uses PugJS template engine, the main template placed into `views/layaut.pug` file and that defines the `layout-content` block. All other page template should extend that layout (see index.pug first two lines) to fill up the content block defined by the layout template.

## Pages

Pages served by ExpessJS, you can add new pages in the `index.js` as express route (look for `// Routes Definitions`)

## Static content

All static content should be placed to the `public` folder and referred with relative path to it (e.g. on the filesystem `public/style.css` but in the HTML template referred as `/style.css`)

## Tech info

- NodeJS https://nodejs.org/
- Express https://expressjs.com/
- Pug https://pugjs.org/

Tutorial for nodejs+express+pug:
https://auth0.com/blog/create-a-simple-and-stylish-node-express-app/