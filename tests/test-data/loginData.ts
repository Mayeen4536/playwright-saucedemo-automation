export type LoginCredentials = {
  username: string;
  password: string;
};

export const standardUser: LoginCredentials = {
  username: 'standard_user',
  password: 'secret_sauce',
};

export const lockedOutUser: LoginCredentials = {
  username: 'locked_out_user',
  password: 'secret_sauce',
};

export type InvalidLoginScenario = {
  name: string;
  username: string;
  password: string;
  expectedError: string;
};

export const invalidLoginScenarios: InvalidLoginScenario[] = [
  {
    name: 'invalid username and password',
    username: 'invalid_user',
    password: 'wrong_password',
    expectedError: 'Username and password do not match any user in this service',
  },
  {
    name: 'locked out user',
    username: lockedOutUser.username,
    password: lockedOutUser.password,
    expectedError: 'Sorry, this user has been locked out',
  },
  {
    name: 'empty username',
    username: '',
    password: standardUser.password,
    expectedError: 'Username is required',
  },
  {
    name: 'empty password',
    username: standardUser.username,
    password: '',
    expectedError: 'Password is required',
  },
  {
    name: 'empty credentials',
    username: '',
    password: '',
    // SauceDemo reports the first missing field only.
    expectedError: 'Username is required',
  },
];
