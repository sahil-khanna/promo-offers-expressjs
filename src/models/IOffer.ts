export interface IOffer {
	title: string;
	description: string;
	startDateTime: Date;
	endDateTime: Date;
	type: 'fixed_price' | 'percent' | 'percent_max_price';
	percentageOff?: Number;
	fixedPriceOff?: Number;
	minPurchaseAmount?: Number;
	maxDiscountAmount?: Number;
	status: boolean;
	isEnabled: boolean;
	vendorId: string;
}