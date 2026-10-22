/**
 * Generate .ics calendar file content for an appointment
 */
export const generateICS = ({ title, description, date, timeSlot, location, duration = 60 }) => {
    // Parse the date and time
    const [time, period] = timeSlot.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    const startDate = new Date(date);
    startDate.setHours(hours, minutes, 0);

    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + duration);

    const formatICSDate = (d) => {
        return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    };

    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//HealSmart AI//EN',
        'BEGIN:VEVENT',
        `DTSTART:${formatICSDate(startDate)}`,
        `DTEND:${formatICSDate(endDate)}`,
        `SUMMARY:${title}`,
        `DESCRIPTION:${description}`,
        `LOCATION:${location || 'HealSmart Clinic'}`,
        'STATUS:CONFIRMED',
        `UID:${Date.now()}@healsmart.ai`,
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');

    return icsContent;
};

/**
 * Download .ics file
 */
export const downloadICS = (appointment) => {
    const title = `Doctor Appointment - ${appointment.doctorName || 'Doctor'}`;
    const description = `${appointment.doctorSpecialization || ''} appointment at ${appointment.doctorHospital || 'HealSmart'}. Reason: ${appointment.reason || 'Consultation'}`;

    const ics = generateICS({
        title,
        description,
        date: appointment.date,
        timeSlot: appointment.timeSlot,
        location: appointment.doctorHospital,
        duration: 30
    });

    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `appointment-${appointment._id || Date.now()}.ics`;
    link.click();
    URL.revokeObjectURL(url);
};

/**
 * Download .ics for lab test booking
 */
export const downloadLabTestICS = (booking) => {
    const ics = generateICS({
        title: `Lab Test - ${booking.testName}`,
        description: `${booking.collectionType === 'home' ? 'Home Collection' : 'Lab Visit'}. Address: ${booking.address || ''}`,
        date: booking.date,
        timeSlot: booking.timeSlot,
        location: booking.address || 'HealSmart Lab',
        duration: 30
    });

    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lab-test-${booking._id || Date.now()}.ics`;
    link.click();
    URL.revokeObjectURL(url);
};
