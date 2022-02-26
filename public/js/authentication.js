
/* Elements */

const createAccountButton = document.querySelector('#create-account-button');
const signInButton = document.querySelector('#sign-in-button');
const resetPasswordButton = document.querySelector('#reset-password-button');
const signOutButton = document.querySelector('#sign-out-button');

/* Events */

createAccountButton.addEventListener('click', async (event) => {
  event.preventDefault();

  const email = document.querySelector('#create-account-email').value;
  const password = document.querySelector('#create-account-password').value;

  try {
    const endpoint = '/authentication/create-account';
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    }

    const response = await fetch(endpoint, options);

    const data = await response.json();

    console.log('[DATA]:', data);
  } catch (error) {
    console.log(error);
  }
});

signInButton.addEventListener('click', async (event) => {
  event.preventDefault();

  const email = document.querySelector('#sign-in-email').value;
  const password = document.querySelector('#sign-in-password').value;

  try {
    const endpoint = '/authentication/sign-in';
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    }

    const response = await fetch(endpoint, options);

    const data = await response.json();

    console.log('[DATA]:', data);
  } catch (error) {
    console.log(error);
  }
});

resetPasswordButton.addEventListener('click', async (event) => {
  event.preventDefault();

  const email = document.querySelector('#reset-password-email').value;
  const password = document.querySelector('#reset-password-new-password').value;

  try {
    const endpoint = '/authentication/reset-password';
    const options = {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    }

    const response = await fetch(endpoint, options);

    const data = await response.json();

    console.log('[DATA]:', data);
  } catch (error) {
    console.log(error);
  }
});

signOutButton.addEventListener('click', async (event) => {
  event.preventDefault();

  try {
    const endpoint = '/authentication/sign-out';
    const options = {
      method: 'DELETE',
      credentials: 'include',
    }

    const response = await fetch(endpoint, options);

    const data = await response.json();

    console.log('[DATA]:', data);
  } catch (error) {
    console.log(error);
  }
});