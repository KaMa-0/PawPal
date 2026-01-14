// Simple email service - logs to console in development
// In production, integrate with a real email service (SendGrid, AWS SES, etc.)

export const sendPasswordResetEmail = async (email: string, resetToken: string): Promise<void> => {
  const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/reset-password?token=${resetToken}`;

  console.log('\n' + '='.repeat(80));
  console.log('PASSWORD RESET EMAIL');
  console.log('='.repeat(80));
  console.log(`To: ${email}`);
  console.log(`Subject: PawPal - Password Reset Request`);
  console.log('-'.repeat(80));
  console.log('Body:');
  console.log(`
Hi there,

You requested to reset your password. Click the link below to proceed:

${resetLink}

This link will expire in 1 hour.

If you didn't request this, please ignore this email.
  `);
  console.log('-'.repeat(80));
  console.log('Email logged to console (development mode)');
  console.log('='.repeat(80) + '\n');
};

export const sendPasswordResetSuccessEmail = async (email: string): Promise<void> => {
  console.log('\n' + '='.repeat(80));
  console.log('PASSWORD RESET SUCCESS EMAIL');
  console.log('='.repeat(80));
  console.log(`To: ${email}`);
  console.log(`Subject: PawPal - Password Changed Successfully`);
  console.log('-'.repeat(80));
  console.log('Body:');
  console.log(`
Hi there,

Your password has been successfully reset.

If you didn't make this change, please contact support immediately.
  `);
  console.log('-'.repeat(80));
  console.log('Email logged to console (development mode)');
  console.log('='.repeat(80) + '\n');
};

