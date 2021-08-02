const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(express.json());

const customers = [];

/* 
SSN - string
name - string
id - uuid
statement - []
*/

// TESTING CHANGES! LETS COMMIT!
// OK, second test!
// third

// app.get('/', (request, response) => {
//   return response.json('Esse é o início, próxima rota está em /courses');
// });

app.post('/account', (request, response) => {
  const { ssn, name } = request.body;

  const customerAlreadyExists = customers.some(
    customer => customer.ssn === ssn
  );

  if (customerAlreadyExists) {
    return response.status(400).json({ error: 'Customer already exists' });
  }

  //const id = uuidv4();

  customers.push({
    ssn,
    name,
    id: uuidv4(),
    statement: [],
  });

  return response.status(201).send();
});

// app.put('/courses/:id', (request, response) => {
//   const { id } = request.params;
//   console.log(id);
//   return response.json(['Class999', 'Class2', 'Class3', 'Class4']);
// });

// app.patch('/courses/:id', (request, response) => {
//   return response.json(['Class999', 'Class888', 'Class3', 'Class4']);
// });

// app.delete('/courses/:id', (request, response) => {
//   return response.json(['Class999', 'Class888', 'Class4']);
// });

app.listen(3333);
