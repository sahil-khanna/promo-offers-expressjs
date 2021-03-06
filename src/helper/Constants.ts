export class Constants {

	public static DB_COLLECTIONS = {
		USER: 'user',
		TOKEN: 'token',
		CONTRIBUTION: 'contribution',
		VENDOR: 'vendor',
		OFFER: 'offer'
	};

	public static USER_ROLE = {
		ADMIN: 1,
		VENDOR: 2,
		GENERAL_USER: 3
	};

	public static PROJECT_SECRET_KEY = 'Hello_User_Profile_Project';

	public static TOKEN_HEADER_KEY = 'x-token';

	public static FILE_UPLOAD_PATH = 'resources/uploads/';

	public static SELF_URL = 'http://localhost:3000';
	public static WEBSITE_URL = 'http://localhost:4200';

	public static RESPONSE_LOGGED_OUT = 'Logged out';
	public static RESPONSE_INVALID_TOKEN = 'Invalid token';
	public static RESPONSE_INVALID_EMAIL = 'Email is not valid';
	public static RESPONSE_INVALID_IMAGE = 'Image is not valid';
	public static RESPONSE_INVALID_PASSWORD = 'Password is not valid';
	public static RESPONSE_INVALID_ROLE = 'Role is not valid';
	public static RESPONSE_INVALID_USERNAME_OR_PASSWORD = 'Invalid username or password';
	public static RESPONSE_ACCOUNT_NOT_ACTIVATED = 'Account not activated. Check your email for instructions to activate your account';
	public static RESPONSE_INVALID_EMAIL_OR_ACCOUNT_NOT_ACTIVATED = 'Email is not registered or account is not activated';
	public static RESPONSE_FORGOT_PASSWORD_EMAIL = 'Check your email for instructions to reset your password. The reset password URL is also printed on console';
	public static RESPONSE_UNABLE_TO_PROCESS = 'Unable to process request';
	public static RESPONSE_INVALID_PARAMETERS = 'Invalid parameters';
	public static RESPONSE_PASSWORD_RESET = 'Password reset successfully';
	public static RESPONSE_INVALID_ACTIVATION_KEY = 'Invalid activation key';
	public static RESPONSE_ACCOUNT_ACTIVATED = 'Account activated successfully';
	public static RESPONSE_PROFILE_UPDATED = 'Profile updated sucessfully';
	public static RESPONSE_CONTRIBUTION_ADDED = 'Thank you for your contribution';
	public static RESPONSE_INVALID_MOBILE = 'Mobile is not valid';
	public static RESPONSE_INVALID_GENDER = 'Gender is not valid';
	public static RESPONSE_INVALID_NAME = 'Name is not valid';
	public static RESPONSE_INVALID_FIRST_NAME = 'First name is not valid';
	public static RESPONSE_INVALID_LAST_NAME = 'Last name is not valid';
	public static RESPONSE_INVALID_TYPE = 'Type is not valid';
	public static RESPONSE_INVALID_MAX_DISCOUNT_AMOUNT = 'Max. discount amount is not valid';
	public static RESPONSE_INVALID_MIN_PURCHASE_AMOUNT = 'Min. purchase amount is not valid';
	public static RESPONSE_INVALID_CONTRIBUTION_IS_PACKED = 'Is Packed is not valid';
	public static RESPONSE_INVALID_DESCRIPTION = 'Description is not valid';
	public static RESPONSE_INVALID_WEBSITE = 'Website is not valid';
	public static RESPONSE_INVALID_ADDRESS = 'Address is not valid';
	public static RESPONSE_VENDOR_ADDED = 'Vendor added. To begin using account, reset password using the link below';
	public static RESPONSE_OFFER_ADDED = 'Offer added';
	public static RESPONSE_INVALID_VENDOR = 'Vendor is not valid';
	public static RESPONSE_INFORMATION_UPDATED = 'Information updated successfully';
	public static RESPONSE_RECORD_DELETED = 'Record deleted successfully';
	public static RESPONSE_EMAIL_ALREADY_REGISTERED = 'Email already registered. Try entering a different email';
	public static RESPONSE_USER_REGISTERED = 'Account registered. Check your email for instructions to activate your account. The activation URL is also printed on console';
	public static RESPONSE_INVALID_TITLE = 'Title is not valid';
	public static RESPONSE_INVALID_START_DATE = 'Start date is not valid';
	public static RESPONSE_INVALID_END_DATE = 'End date is not valid';
	public static RESPONSE_INVALID_FIXED_DISCOUNT_AMOUNT = 'Invalid fixed discount amount';
	public static RESPONSE_INVALID_DISCOUNT_PERCENT = 'Invalid discount percent';
}