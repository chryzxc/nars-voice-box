export const ValidateProps = {
  user: {
    firstName: { type: 'string', minLength: 2, maxLength: 30 },
    middleName: { type: 'string', minLength: 1, maxLength: 30 },
    lastName: { type: 'string', minLength: 2, maxLength: 30 },
    username: { type: 'string' },
    password: { type: 'string', minLength: 6 },
    role: { type: 'string' },
    email: { type: 'string', minLength: 1 },
    bio: { type: 'string', minLength: 0, maxLength: 160 },
  },
  // post: {
  //   content: { type: 'string', minLength: 1, maxLength: 280 },
  // },
  // comment: {
  //   content: { type: 'string', minLength: 1, maxLength: 280 },
  // },
};
