# db-editor

Database editor using HandsOnTable. Can also edit arrays (but not Objects, which will be joined using `"\n"`).

## Usage

- Settings are in `./src/settings.json` and `./webpack.dev.js`'s proxy settings
- Point the API endpoint to `/api/editor/` on `POST`, `PUT` and `DELETE` methods; and enable CORS on the endpoint.

## Screenshots

![](/screenshots/1.png)
![](/screenshots/2.png)
