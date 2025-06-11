/**
 * Validation utilities for scraped calendar data
 */
/**
 * Validate a single calendar day
 */
export function validateCalendarDay(day, dayIndex) {
    const errors = [];
    const warnings = [];
    // Check required fields
    if (!day.day) {
        errors.push(`Day ${dayIndex + 1}: Missing 'day' field`);
    }
    if (!day.dayInEn) {
        errors.push(`Day ${dayIndex + 1}: Missing 'dayInEn' field`);
    }
    if (!day.en) {
        errors.push(`Day ${dayIndex + 1}: Missing 'en' field`);
    }
    // Validate day number consistency
    if (day.day && day.dayInEn) {
        const nepaliToEnglish = convertNepaliToEnglish(day.day);
        if (nepaliToEnglish !== day.dayInEn) {
            warnings.push(`Day ${dayIndex + 1}: Nepali day '${day.day}' doesn't match English day '${day.dayInEn}'`);
        }
    }
    // Validate English date format
    if (day.en && !/^\d{1,2}$/.test(day.en)) {
        warnings.push(`Day ${dayIndex + 1}: English date '${day.en}' should be a number`);
    }
    // Check for reasonable day numbers
    if (day.dayInEn) {
        const dayNum = parseInt(day.dayInEn, 10);
        if (isNaN(dayNum) || dayNum < 1 || dayNum > 32) {
            errors.push(`Day ${dayIndex + 1}: Invalid day number '${day.dayInEn}'`);
        }
    }
    // Validate boolean fields
    if (typeof day.isHoliday !== 'boolean') {
        errors.push(`Day ${dayIndex + 1}: 'isHoliday' must be a boolean`);
    }
    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}
/**
 * Validate a calendar month
 */
export function validateCalendarMonth(month, monthIndex) {
    const errors = [];
    const warnings = [];
    // Check month number
    if (!month.month || month.month < 1 || month.month > 12) {
        errors.push(`Month ${monthIndex + 1}: Invalid month number '${month.month}'`);
    }
    // Check if days array exists
    if (!Array.isArray(month.days)) {
        errors.push(`Month ${monthIndex + 1}: 'days' must be an array`);
        return { isValid: false, errors, warnings };
    }
    // Check reasonable number of days
    if (month.days.length < 28 || month.days.length > 32) {
        warnings.push(`Month ${monthIndex + 1}: Unusual number of days (${month.days.length})`);
    }
    // Validate each day
    month.days.forEach((day, dayIndex) => {
        const dayValidation = validateCalendarDay(day, dayIndex);
        errors.push(...dayValidation.errors.map(err => `Month ${monthIndex + 1}, ${err}`));
        warnings.push(...dayValidation.warnings.map(warn => `Month ${monthIndex + 1}, ${warn}`));
    });
    // Check for sequential day numbers
    const dayNumbers = month.days
        .map(day => parseInt(day.dayInEn, 10))
        .filter(num => !isNaN(num));
    if (dayNumbers.length > 1) {
        for (let i = 1; i < dayNumbers.length; i++) {
            const currentDay = dayNumbers[i];
            const previousDay = dayNumbers[i - 1];
            if (currentDay !== undefined && previousDay !== undefined && currentDay !== previousDay + 1) {
                // Allow for month transitions (e.g., 31 -> 1)
                if (!(previousDay > 28 && currentDay === 1)) {
                    warnings.push(`Month ${monthIndex + 1}: Non-sequential day numbers at position ${i}`);
                }
            }
        }
    }
    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}
/**
 * Validate a full calendar year
 */
export function validateCalendarYear(year, yearNumber) {
    const errors = [];
    const warnings = [];
    // Check if it's an array
    if (!Array.isArray(year)) {
        errors.push(`Year ${yearNumber}: Must be an array of months`);
        return { isValid: false, errors, warnings };
    }
    // Check number of months
    if (year.length !== 12) {
        errors.push(`Year ${yearNumber}: Must have exactly 12 months, found ${year.length}`);
    }
    // Validate each month
    year.forEach((month, monthIndex) => {
        const monthValidation = validateCalendarMonth(month, monthIndex);
        errors.push(...monthValidation.errors.map(err => `Year ${yearNumber}, ${err}`));
        warnings.push(...monthValidation.warnings.map(warn => `Year ${yearNumber}, ${warn}`));
    });
    // Check month sequence
    year.forEach((month, index) => {
        if (month.month !== index + 1) {
            errors.push(`Year ${yearNumber}: Month at index ${index} has incorrect month number ${month.month}`);
        }
    });
    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}
/**
 * Convert Nepali numerals to English numerals
 */
export function convertNepaliToEnglish(nepaliStr) {
    const nepaliToEnglishMap = {
        '०': '0',
        '१': '1',
        '२': '2',
        '३': '3',
        '४': '4',
        '५': '5',
        '६': '6',
        '७': '7',
        '८': '8',
        '९': '9'
    };
    return nepaliStr
        .split('')
        .map(char => nepaliToEnglishMap[char] || char)
        .join('');
}
/**
 * Validate scraped data and return comprehensive results
 */
export function validateScrapedData(data) {
    const errors = [];
    const warnings = [];
    if (!data || typeof data !== 'object') {
        errors.push('Data must be an object');
        return { isValid: false, errors, warnings };
    }
    const calendarData = data;
    // Validate each year
    Object.entries(calendarData).forEach(([yearStr, yearData]) => {
        const yearNumber = parseInt(yearStr, 10);
        if (isNaN(yearNumber)) {
            errors.push(`Invalid year key: '${yearStr}'`);
            return;
        }
        if (!Array.isArray(yearData)) {
            errors.push(`Year ${yearNumber}: Data must be an array`);
            return;
        }
        const yearValidation = validateCalendarYear(yearData, yearNumber);
        errors.push(...yearValidation.errors);
        warnings.push(...yearValidation.warnings);
    });
    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}
//# sourceMappingURL=validation.js.map