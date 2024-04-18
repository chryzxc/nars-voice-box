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
  schedule: {
    date: { type: 'string' },
    timeSlots: { type: 'array', items: { type: 'string' } },
  },
  appointment: {
    doctorType: { type: 'string' },
    doctorUserId: { type: 'string' },
    date: { type: 'string' },
    time: { type: 'string' },
    patientName: { type: 'string' },
    patientContactInformation: { type: 'string' },
    patientAddress: { type: 'string' },
    notes: { type: 'string' },
  },
};
