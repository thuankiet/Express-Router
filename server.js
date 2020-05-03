// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const shortId = require('shortid');

const adapter = new FileSync('db.json');
const db = low(adapter);

db.defaults({
  books: [],
  users: []
}).write();

app.set('view engine', 'pug');
app.set('views', './views');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.use(express.static("public"));

app.get('/', (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

// send the default array of dreams to the webpage
app.get('/books', (request, response) => {
  response.render('books.pug', {
    books: db.get('books').value()
  })
});

app.get('/books/edit-form/:id', (request, response) => {
  var id = request.params.id;
  db.get('books').value().filter(book => {
    if(book.id === id) {
      response.render('edit.books.pug', {
        book: book
      })
    }
  })
});

app.get('/books/:id/delete', (request, response) => {
  var id = request.params.id;
  db.get('books')
    .remove({ id: id })
    .write();
  response.redirect('/books');
});

app.post('/books/edit/:id', (request, response) => {
  var id = request.params.id;
  db.get('books')
    .find({ id: id })
    .assign(request.body)
    .write()
  response.redirect('/books');
});

app.post('/books', (request, response) => {
  request.body.id = shortId.generate();
  db.get('books').push(request.body).write();
  response.redirect('/books');
});

app.get('/users', (request, response) => {
  response.render('./users/users.pug', {
    users: db.get('users').value(),
    books: db.get('books').value()
  });
});

app.post('/users',(request, response) => {
  db.get('users')
    .find({name:"Kiệt"})
    .get('bookName')
    .push({id: shortId.generate(), book: request.body.bookName})
    .write();
  response.redirect('/users');
});

app.get('/users/edit-form/:bookId', (request, response) => {
  var bookId = request.params.bookId;
  db.get('users').find({name:"Kiệt"}).get('bookName').value().filter(book => {
    if(bookId === book.id) {   
      response.render('./users/editBook.user.pug', {
        book: book,
        books: db.get('books').value()
      })   
    }
  })
});

app.post('/users/edit/:bookId', (request, response) => {
  var bookId = request.params.bookId;
  var newBook = request.body.book;
  db.get('users')
    .find({name:'Kiệt'})
    .get('bookName')
    .find({id:bookId})
    .assign({book:newBook})
    .write();
  response.redirect('/users');
});

app.get('/users/delete/:bookId', (request, response) => {
  var bookId = request.params.bookId;
  db.get('users')
    .find({name:'Kiệt'})
    .get('bookName')
    .remove({id: bookId})
    .write();
  response.redirect('/users');
})

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
