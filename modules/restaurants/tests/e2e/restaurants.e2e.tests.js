'use strict';

describe('Restaurants E2E Tests:', function() {
	describe('Test Restaurants page', function() {
		it('Should not include new Restaurants', function() {
			browser.get('http://localhost:3000/#!/restaurants');
			expect(element.all(by.repeater('restaurant in restaurants')).count()).toEqual(0);
		});
	});
});
