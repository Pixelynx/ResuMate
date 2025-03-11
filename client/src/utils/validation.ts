export const validateName = (name: string, fieldName: 'firstName' | 'lastName'): string | null => {
  const trimmedName = name.trim();
  const fieldLabel = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
  
  if (!trimmedName) return `Please enter your ${fieldName}`;
  if (trimmedName.length < 2) return `${fieldLabel} must be at least 2 characters`;
  if (!/^[a-zA-Z\s'-]+$/.test(trimmedName)) return `${fieldLabel} can only contain letters, hyphens, and apostrophes`;
  
  return null;
};
  
  export const validateEmail = (email: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Please enter a valid email address";
    if (!emailRegex.test(email)) return "Email must include a domain (e.g., @example.com)";
    if (email.length > 100) return "Email must be less than 100 characters";
    return null;
  };
  
  export const validatePhone = (phone: string): string | null => {
    const stripped = phone.replace(/\D/g, '');
    if (!stripped) return "Please enter a valid phone number";
    if (stripped.length === 11 && !stripped.startsWith('1')) return "Invalid country code";
    if (stripped.length !== 10 && stripped.length !== 11) return "US phone numbers must have 10 digits";
    return null;
  };
  
  export const formatPhone = (phone: string): string => {
    const stripped = phone.replace(/\D/g, '');
    if (stripped.length === 10) {
      return `+1 ${stripped.slice(0,3)}-${stripped.slice(3,6)}-${stripped.slice(6)}`;
    }
    if (stripped.length === 11 && stripped.startsWith('1')) {
      return `+1 ${stripped.slice(1,4)}-${stripped.slice(4,7)}-${stripped.slice(7)}`;
    }
    return phone;
  };
  
  export const validateUrl = (url: string): string | null => {
    if (!url) return null; // Optional field
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      return null;
    } catch {
      return "Please enter a valid URL with domain (e.g., www.example.com)";
    }
  };
  
  export const validateLocation = (location: string): string | null => {
    const trimmedLocation = location.trim();
    if (!trimmedLocation) return "Please enter your location";
    if (trimmedLocation.length < 3) return "Location must be at least 3 characters";
    if (!/^[a-zA-Z0-9\s,.-]+$/.test(trimmedLocation)) return "Location can only contain letters, numbers, spaces, commas, and periods";
    return null;
  };