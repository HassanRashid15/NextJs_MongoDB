// Form validation utilities

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation
export const validatePassword = (password: string): ValidationResult => {
  const errors: ValidationError[] = [];

  if (password.length < 6) {
    errors.push({
      field: "password",
      message: "Password must be at least 6 characters long",
    });
  }

  if (!/(?=.*[a-z])/.test(password)) {
    errors.push({
      field: "password",
      message: "Password must contain at least one lowercase letter",
    });
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push({
      field: "password",
      message: "Password must contain at least one uppercase letter",
    });
  }

  if (!/(?=.*\d)/.test(password)) {
    errors.push({
      field: "password",
      message: "Password must contain at least one number",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Name validation
export const validateName = (
  name: string,
  fieldName: string = "name"
): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!name.trim()) {
    errors.push({
      field: fieldName,
      message: `${
        fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
      } is required`,
    });
  }

  if (name.length < 2) {
    errors.push({
      field: fieldName,
      message: `${
        fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
      } must be at least 2 characters long`,
    });
  }

  if (name.length > 50) {
    errors.push({
      field: fieldName,
      message: `${
        fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
      } must be less than 50 characters`,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Registration form validation
export const validateRegistrationForm = (data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}): ValidationResult => {
  const errors: ValidationError[] = [];

  // Validate first name
  const firstNameValidation = validateName(data.firstName, "firstName");
  errors.push(...firstNameValidation.errors);

  // Validate last name
  const lastNameValidation = validateName(data.lastName, "lastName");
  errors.push(...lastNameValidation.errors);

  // Validate email
  if (!validateEmail(data.email)) {
    errors.push({
      field: "email",
      message: "Please enter a valid email address",
    });
  }

  // Validate password
  const passwordValidation = validatePassword(data.password);
  errors.push(...passwordValidation.errors);

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Login form validation
export const validateLoginForm = (data: {
  email: string;
  password: string;
}): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!validateEmail(data.email)) {
    errors.push({
      field: "email",
      message: "Please enter a valid email address",
    });
  }

  if (!data.password.trim()) {
    errors.push({
      field: "password",
      message: "Password is required",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Change password form validation
export const validateChangePasswordForm = (data: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!data.currentPassword.trim()) {
    errors.push({
      field: "currentPassword",
      message: "Current password is required",
    });
  }

  const passwordValidation = validatePassword(data.newPassword);
  errors.push(...passwordValidation.errors);

  if (data.newPassword !== data.confirmPassword) {
    errors.push({
      field: "confirmPassword",
      message: "Passwords do not match",
    });
  }

  if (data.currentPassword === data.newPassword) {
    errors.push({
      field: "newPassword",
      message: "New password must be different from current password",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Profile update validation
export const validateProfileForm = (data: {
  firstName: string;
  lastName: string;
  email: string;
}): ValidationResult => {
  const errors: ValidationError[] = [];

  const firstNameValidation = validateName(data.firstName, "firstName");
  errors.push(...firstNameValidation.errors);

  const lastNameValidation = validateName(data.lastName, "lastName");
  errors.push(...lastNameValidation.errors);

  if (!validateEmail(data.email)) {
    errors.push({
      field: "email",
      message: "Please enter a valid email address",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Utility function to get error message for a specific field
export const getFieldError = (
  errors: ValidationError[],
  fieldName: string
): string | null => {
  const error = errors.find((err) => err.field === fieldName);
  return error ? error.message : null;
};
