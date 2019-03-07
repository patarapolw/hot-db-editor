# db-editor

Database editor using HandsOnTable. Can also edit arrays, which will be joined using `"\n"` (but not Objects).

## Usage

- Settings are in `./src/settings.json` and `./webpack.dev.js`'s proxy settings
- Point the API endpoint to `/api/editor/` on `POST`, `PUT` and `DELETE` methods; and enable CORS on the endpoint. For example, see <https://github.com/patarapolw/zhlevel-ts/blob/master/src/server/routes/api/editor.ts>.
- Clone the repo, edit the settings, `yarn install` and `yarn start`.

## Screenshots

![](https://raw.githubusercontent.com/patarapolw/db-editor/master/screenshots/1.png)
![](https://raw.githubusercontent.com/patarapolw/db-editor/master/screenshots/2.png)
