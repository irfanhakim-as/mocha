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
function isLatestVaccination(vaccination, allVaccinations) {
    if (!vaccination || !Array.isArray(allVaccinations)) return true;
    // find all doses of the same vaccine
    const sameName = allVaccinations.filter(v => v.name === vaccination.name);
    if (sameName.length <= 1) return true;
    // check if this is the most recent one
    const currentDate = parseDate(vaccination.date);
    if (!currentDate) return true;
    // return whether no other common dose has a newer date
    return !sameName.some(v => {
        const otherDate = parseDate(v.date);
        return otherDate && otherDate > currentDate;
    });
}

// Get vaccination status
function vaccinationStatus(nextDueDate, vaccination, allVaccinations) {
    // mark as complete if there has been a newer dose for the same vaccine
    if (vaccination && allVaccinations && !isLatestVaccination(vaccination, allVaccinations)) {
        return { class: 'current', label: 'Complete' };
    }

    // check the nextDue date if the vaccination is not complete
    if (!nextDueDate) return { class: 'unknown', label: 'N/A' };
    const now = new Date();
    const dueDate = parseDate(nextDueDate);
    if (!dueDate || isNaN(dueDate.getTime())) return { class: 'unknown', label: 'N/A' };
    const daysUntilDue = Math.floor((dueDate - now) / (24 * 60 * 60 * 1000));

    if (daysUntilDue < 0) {
        return { class: 'overdue', label: 'Overdue' };
    } else if (daysUntilDue <= 30) {
        return { class: 'due-soon', label: 'Due Soon' };
    } else {
        return { class: 'current', label: 'Current' };
    }
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
