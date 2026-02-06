// Eleventy filters

// Parse DD-MM-YYYY date string to Date object
function parseDate(dateString) {
    if (!dateString) return null;
    const [day, month, year] = String(dateString).split('-').map(Number);
    return new Date(year, month - 1, day);
}

// Convert DD-MM-YYYY date to ISO format (YYYY-MM-DD) for JavaScript
function toIso(dateString) {
    if (!dateString) return '';
    const date = parseDate(dateString);
    if (!date || isNaN(date.getTime())) return '';
    const [day, month, year] = String(dateString).split('-');
    return `${year}-${month}-${day}`;
}

// Format date to readable string (US English)
function formatDate(dateString) {
    if (!dateString) return '';
    const date = parseDate(dateString);
    if (!date || isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Calculate age from DOB
function calculateAge(dateString) {
    if (!dateString) return '';
    const dob = parseDate(dateString);
    if (!dob || isNaN(dob.getTime())) return '';

    const now = new Date();
    const diff = now - dob;
    const years = Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
    const months = Math.floor((diff % (365.25 * 24 * 60 * 60 * 1000)) / (30.44 * 24 * 60 * 60 * 1000));

    if (years === 0) {
        return `${months} month${months !== 1 ? 's' : ''} old`;
    } else if (months === 0) {
        return `${years} year${years !== 1 ? 's' : ''} old`;
    } else {
        return `${years} year${years !== 1 ? 's' : ''}, ${months} month${months !== 1 ? 's' : ''} old`;
    }
}

// Check if a vaccination is the latest dose for the same vaccine
function isLatestVaccination(vaccination, allVaccinations, currentDateParsed) {
    if (!vaccination || !Array.isArray(allVaccinations)) return true;
    // find all doses of the same vaccine
    const sameName = allVaccinations.filter(v => v.name === vaccination.name);
    if (sameName.length <= 1) return true;
    // use pre-parsed date if provided
    const currentDate = currentDateParsed || parseDate(vaccination.date);
    if (!currentDate) return true;
    // return whether no other common dose has a newer date
    return !sameName.some(v => {
        const otherDate = parseDate(v.date);
        return otherDate && otherDate > currentDate;
    });
}

// Get vaccination status
function vaccinationStatus(nextDueDate, vaccination, allVaccinations) {
    // parse vaccination date
    const vaxDate = vaccination ? parseDate(vaccination.date) : null;
    const hasValidDate = vaxDate && !isNaN(vaxDate.getTime());
    // mark as complete if there has been a newer dose for the same vaccine
    if (vaccination && allVaccinations && !isLatestVaccination(vaccination, allVaccinations, vaxDate)) {
        return { class: 'current', label: 'Complete' };
    }
    // determine based on whether vaccine was given if no nextDue
    if (!nextDueDate) {
        // no booster needed
        if (hasValidDate) {
            return { class: 'current', label: 'Complete' };
        }
        return { class: 'unknown', label: 'Unknown' };
    }
    // calculate status based on nextDue date
    const now = new Date();
    const dueDate = parseDate(nextDueDate);
    // nextDue is invalid
    if (!dueDate || isNaN(dueDate.getTime())) {
        // mark as complete if vaccine was given
        if (hasValidDate) {
            return { class: 'current', label: 'Complete' };
        }
        // mark as unknown if vaccine was not given
        return { class: 'unknown', label: 'Unknown' };
    }
    // calculate how many days until due if nextDue is valid
    const daysUntilDue = Math.floor((dueDate - now) / (24 * 60 * 60 * 1000));
    if (daysUntilDue < 0) {
        // nextDue date has passed
        return { class: 'overdue', label: 'Overdue' };
    } else if (daysUntilDue <= 30) {
        // nextDue within 30 days
        return { class: 'due-soon', label: 'Due Soon' };
    }
    // nextDue is more than 30 days away
    return { class: 'current', label: 'Current' };
}

// Format routine key (camelCase to Title Case with spaces)
function formatRoutineKey(key) {
    if (!key) return '';
    return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();
}

// Get current year
function currentYear() {
    return new Date().getFullYear();
}

// Format phone number for tel: link (keep + and digits only)
function telLink(phone) {
    if (!phone) return '';
    return String(phone).replace(/[^\d+]/g, '');
}

module.exports = {
    formatDate,
    toIso,
    calculateAge,
    vaccinationStatus,
    formatRoutineKey,
    currentYear,
    telLink
};
