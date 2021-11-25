/* 起服务：将打包后的代码运行在服务之上 */
let express = require('express');
/* process是全局变量无需引入 */
let port = 80;

let app = express();

/* Express框架：提供了static中间件来设置静态文件的资源 */
app.use(express.static('./app/build'));

/* 起端口 */
module.exports = app.listen(port, function (err) {
  if (err) {
    console.log(err);
    return;
  }
  console.log('Listening at http://localhost:' + port + '\n');
});
