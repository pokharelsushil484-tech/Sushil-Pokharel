
import emailjs from '@emailjs/browser';

// ==============================================================================
// CONFIGURATION: Replace these with your actual keys from https://www.emailjs.com
// ==============================================================================
const PUBLIC_KEY = 'YOUR_EMAILJS_PUBLIC_KEY'; 
const SERVICE_ID = 'YOUR_EMAILJS_SERVICE_ID'; 
const TEMPLATE_ID = 'YOUR_EMAILJS_TEMPLATE_ID'; 
// ==============================================================================

export const sendPasswordResetEmail = async (email: string, name: string, link: string): Promise<boolean> => {
  // Fallback for simulation if keys are not configured
  if (PUBLIC_KEY.startsWith('YOUR_')) {
    console.warn("EmailJS not configured. Falling back to simulation.");
    const copiable = prompt(`(Simulation) Password Reset Email sent to ${email}\n\nCopy this link:`, link);
    return true;
  }

  try {
    await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
      to_email: email,
      to_name: name,
      message: `Click the following link to reset your password: ${link}`,
      subject: "Reset your Password",
      type: "reset"
    }, PUBLIC_KEY);
    return true;
  } catch (error) {
    console.error("Failed to send reset email:", error);
    alert("Failed to send email. Please check your internet connection.");
    return false;
  }
};

export const sendVerificationEmail = async (email: string, name: string, link: string): Promise<boolean> => {
  // Fallback for simulation
  if (PUBLIC_KEY.startsWith('YOUR_')) {
    console.warn("EmailJS not configured. Falling back to simulation.");
    const copiable = prompt(`(Simulation) Verification Link sent to ${email}\n\nCopy this link to verify your account:`, link);
    return true;
  }

  try {
    await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
      to_email: email,
      to_name: name,
      message: `Welcome to StudentPocket! Click this link to verify your account: ${link}`,
      subject: "Verify Your Account",
      type: "verify"
    }, PUBLIC_KEY);
    return true;
  } catch (error) {
    console.error("Failed to send verification email:", error);
    alert("Failed to send email. Please check your internet connection.");
    return false;
  }
};
