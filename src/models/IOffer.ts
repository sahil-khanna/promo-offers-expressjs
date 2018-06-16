export interface IOffer {
	title: string;
	description: string;
	offerStart: Date;
	offerEnd: Date;
	type: 'amount' | 'percent';
	minPurchaseAmount?: Number;
	fixedDiscountAmount?: Number;
	maxDiscountAmount?: Number;
	discountPercent?: Number;
	status: boolean;
	isEnabled: boolean;
	vendorId: string;
}