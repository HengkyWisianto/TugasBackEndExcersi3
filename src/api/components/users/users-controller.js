const usersService = require('./users-service');
const { errorResponder, errorTypes } = require('../../../core/errors');
const authenticationServices = require('../authentication/authentication-service');
 
/**
 * Handle get list of users request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getUsers(request, response, next) {
  try {
    const users = await usersService.getUsers();
    return response.status(200).json(users);
  } catch (error) {
    return next(error);
  }
}
/**
 * Handle get user detail request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getUser(request, response, next) {
  try {
    const user = await usersService.getUser(request.params.id);
 
    if (!user) {
      throw errorResponder(errorTypes.UNPROCESSABLE_ENTITY, 'Unknown user');
    }
 
    return response.status(200).json(user);
  } catch (error) {
    return next(error);
  }
}
 
/**
 * Handle create user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function createUser(request, response, next) {
  try {
    const name = request.body.name;
    const email = request.body.email;
    const password = request.body.password;
    const password_confirm = request.body.password_confirm;
 
    if(password !== password_confirm){
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
      );
    }
 
    const success = await usersService.createUser(name, email, password);
    if (!success) {
      throw errorResponder(
        errorTypes.EMAIL_ALREADY_TAKEN,
        'EMAIL_ALREADY_TAKEN'
      );
    }
 
    return response.status(409).json({ name, email });
  } catch (error) {
    return next(error);
  }
}
 
/**
 * Handle update user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function updateUser(request, response, next) {
  try {
    const id = request.params.id;
    const name = request.body.name;
    const email = request.body.email;
 
    const success = await usersService.updateUser(id, name, email);
    if (!success) {
      throw errorResponder(
        errorTypes.EMAIL_ALREADY_TAKEN,
        'EMAIL_ALREADY_TAKEN'
      );
    }
 
    return response.status(409).json({ id });
  } catch (error) {
    return next(error);
  }
}
 
/**
 * Handle delete user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function deleteUser(request, response, next) {
  try {
    const id = request.params.id;
 
    const success = await usersService.deleteUser(id);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to delete user'
      );
    }
 
    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}
 
async function NewPW(request, response, next) {
  try {
    const id = request.params.id;
    const email = request.body.email;
    const password = request.body.password;
    const password_confirm = request.body.password_confirm;
    const changePassword = request.body.changePassword;
    const change_password_confirm = request.body.change_password_confirm;

    // Check if new password matches confirm password
    if (changePassword !== change_password_confirm) {
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
        'changed password tidak sama dengan change password confirm'
      );
    }


    // Verify if old password matches the current password
    const user = await usersService.getUser(id);
    if (!user) {
      throw errorResponder(errorTypes.UNAUTHORIZED, 'User not found');
    }
    if(user.email !== email) {
      throw errorResponder(
        errorTypes.EMAIL_ENTERED,
        'Email salah'
      )
    }
    // Verify if old password matches the current password
    if (password_confirm !== password) {
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
        'password tidak sama dengan password confirm'
      );
    }

    const loginSuccess = await authenticationServices.checkLoginCredentials(
      email, 
      password
    );

    if(!loginSuccess) {
      throw errorResponder(
        errorTypes.INVALID_CREDENTIALS,
        'Salah Email / PW'
      )
    }
    // Update password
    const success = await usersService.NewPW(
      id,
      password,
      password_confirm,
      changePassword,
      change_password_confirm
    );

    if (!success) {
      throw errorResponder(
        errorTypes.INTERNAL_SERVER_ERROR,
        'Gagal mengubah password'
      );
    }

    return response.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    return next(error);
  }
}
 
module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  NewPW,
};
