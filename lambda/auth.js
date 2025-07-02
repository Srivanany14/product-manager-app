const AWS = require('aws-sdk');
const cognito = new AWS.CognitoIdentityServiceProvider();

const USER_POOL_ID = process.env.USER_POOL_ID;
const CLIENT_ID = process.env.CLIENT_ID;

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

exports.handler = async (event) => {
  const { httpMethod, body } = event;

  try {
    if (httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'OK' }),
      };
    }

    if (httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method Not Allowed' }),
      };
    }

    const { action, ...params } = JSON.parse(body);

    switch (action) {
      case 'signup':
        return await signUp(params);
      
      case 'signin':
        return await signIn(params);
      
      case 'confirm':
        return await confirmSignUp(params);
      
      case 'resend':
        return await resendConfirmationCode(params);
      
      case 'forgotPassword':
        return await forgotPassword(params);
      
      case 'resetPassword':
        return await confirmForgotPassword(params);
      
      case 'refreshToken':
        return await refreshToken(params);
      
      case 'signout':
        return await signOut(params);
      
      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid action' }),
        };
    }
  } catch (error) {
    console.error('Auth error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal Server Error',
        message: error.message 
      }),
    };
  }
};

async function signUp({ email, password, fullName }) {
  try {
    const params = {
      ClientId: CLIENT_ID,
      Username: email,
      Password: password,
      UserAttributes: [
        {
          Name: 'email',
          Value: email,
        },
        {
          Name: 'name',
          Value: fullName,
        },
      ],
    };

    const result = await cognito.signUp(params).promise();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'User registered successfully',
        userSub: result.UserSub,
        confirmationRequired: !result.UserConfirmed,
      }),
    };
  } catch (error) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ 
        error: error.code || 'SignUpError',
        message: error.message 
      }),
    };
  }
}

async function signIn({ email, password }) {
  try {
    const params = {
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: CLIENT_ID,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    };

    const result = await cognito.initiateAuth(params).promise();

    if (result.ChallengeName) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          challenge: result.ChallengeName,
          session: result.Session,
          challengeParameters: result.ChallengeParameters,
        }),
      };
    }

    const { AccessToken, RefreshToken, IdToken } = result.AuthenticationResult;

    // Get user attributes
    const userParams = {
      AccessToken,
    };
    const userResult = await cognito.getUser(userParams).promise();

    const userAttributes = {};
    userResult.UserAttributes.forEach(attr => {
      userAttributes[attr.Name] = attr.Value;
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Sign in successful',
        tokens: {
          accessToken: AccessToken,
          refreshToken: RefreshToken,
          idToken: IdToken,
        },
        user: {
          username: userResult.Username,
          email: userAttributes.email,
          name: userAttributes.name,
          emailVerified: userAttributes.email_verified === 'true',
        },
      }),
    };
  } catch (error) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ 
        error: error.code || 'SignInError',
        message: error.message 
      }),
    };
  }
}

async function confirmSignUp({ email, confirmationCode }) {
  try {
    const params = {
      ClientId: CLIENT_ID,
      Username: email,
      ConfirmationCode: confirmationCode,
    };

    await cognito.confirmSignUp(params).promise();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Email confirmed successfully',
      }),
    };
  } catch (error) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ 
        error: error.code || 'ConfirmationError',
        message: error.message 
      }),
    };
  }
}

async function resendConfirmationCode({ email }) {
  try {
    const params = {
      ClientId: CLIENT_ID,
      Username: email,
    };

    await cognito.resendConfirmationCode(params).promise();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Confirmation code resent successfully',
      }),
    };
  } catch (error) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ 
        error: error.code || 'ResendError',
        message: error.message 
      }),
    };
  }
}

async function forgotPassword({ email }) {
  try {
    const params = {
      ClientId: CLIENT_ID,
      Username: email,
    };

    await cognito.forgotPassword(params).promise();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Password reset code sent to your email',
      }),
    };
  } catch (error) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ 
        error: error.code || 'ForgotPasswordError',
        message: error.message 
      }),
    };
  }
}

async function confirmForgotPassword({ email, confirmationCode, newPassword }) {
  try {
    const params = {
      ClientId: CLIENT_ID,
      Username: email,
      ConfirmationCode: confirmationCode,
      Password: newPassword,
    };

    await cognito.confirmForgotPassword(params).promise();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Password reset successfully',
      }),
    };
  } catch (error) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ 
        error: error.code || 'ResetPasswordError',
        message: error.message 
      }),
    };
  }
}

async function refreshToken({ refreshToken }) {
  try {
    const params = {
      AuthFlow: 'REFRESH_TOKEN_AUTH',
      ClientId: CLIENT_ID,
      AuthParameters: {
        REFRESH_TOKEN: refreshToken,
      },
    };

    const result = await cognito.initiateAuth(params).promise();
    const { AccessToken, IdToken } = result.AuthenticationResult;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Token refreshed successfully',
        tokens: {
          accessToken: AccessToken,
          idToken: IdToken,
        },
      }),
    };
  } catch (error) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ 
        error: error.code || 'RefreshTokenError',
        message: error.message 
      }),
    };
  }
}

async function signOut({ accessToken }) {
  try {
    const params = {
      AccessToken: accessToken,
    };

    await cognito.globalSignOut(params).promise();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Signed out successfully',
      }),
    };
  } catch (error) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ 
        error: error.code || 'SignOutError',
        message: error.message 
      }),
    };
  }
}