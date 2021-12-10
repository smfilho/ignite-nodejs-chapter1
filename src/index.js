const { request, response } = require('express');
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

// Middleware
function verifyIfAccountExistsSSN(request, response, next) {
  const { ssn } = request.headers;

  const customer = customers.find(customer => customer.ssn === ssn);

  if (!customer) {
    return response.status(400).json({ error: 'Customer not found' });
  }

  request.customer = customer;

  return next();
}

// app.use(verifyIfAccountExistsSSN);
// only use this declaration if all the routes below are going to use this middleware

function getBalance(statement) {
  const balance = statement.reduce((acc, operation) => {
    if (operation.type === 'credit') {
      return acc + operation.amount;
    } else {
      return acc - operation.amount;
    }
  }, 0);

  return balance;
}

app.get('/statement', verifyIfAccountExistsSSN, (request, response) => {
  const { customer } = request;
  return response.json(customer.statement);
});

app.get('/statement/date', verifyIfAccountExistsSSN, (request, response) => {
  const { customer } = request;
  const { date } = request.query;

  const dateFormat = new Date(date + " 00:00"); 
  
  const statement = customer.statement.filter(
    (statement) => statement.created_at.toDateString() === dateFormat.toDateString())

  return response.json(statement);
});

app.get('/balance', verifyIfAccountExistsSSN, (request, response) => {
  const { customer } = request;
  const balance = getBalance(customer.statement);
  return response.json(balance);
});

app.post('/deposit', verifyIfAccountExistsSSN, (request, response) => {
  const { description, amount } = request.body;

  const { customer } = request;

  const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type: 'credit',
  };

  customer.statement.push(statementOperation);

  return response.status(201).send();
});

app.post('/withdraw', verifyIfAccountExistsSSN, (request, response) => {
  const { description, amount } = request.body;

  const { customer } = request;

  const balance = getBalance(customer.statement);

  if (balance < amount) {
    return response.status(400).json({ error: 'Insuficient funds' });
  }

  const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type: 'debit',
  };

  customer.statement.push(statementOperation);
  return response.status(201).send();
});

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

app.put('/account', verifyIfAccountExistsSSN, (request, response) => {
  const { name } = request.body;
  const { customer } = request;

  customer.name = name;

  return response.status(201).send();
})

app.get('/account', verifyIfAccountExistsSSN, (request, response) => {
  const { customer } = request;

  return response.json(customer)
})

app.delete('/account', verifyIfAccountExistsSSN, (request, response) => {
  const { customer } = request;

  //using splice
  customers.splice(customer, 1)

  return response.status(200).json(customers)
})

app.listen(3333);
