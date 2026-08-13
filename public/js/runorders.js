let selectedDate = new Date();
const selectedDateText = document.getElementById('selectedDateText');
const selectedDateLabel = document.getElementById('selectedDateLabel');
const prevDate = document.getElementById('prevDate');
const nextDate = document.getElementById('nextDate');
let date;

function formatDisplayDate(date) {
    return date.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}
function formatDatabaseDate(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
function getRelativeDateLabel(date, type) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(date);
    selected.setHours(0, 0, 0, 0);
    const difference = Math.round(
        (selected - today) / (1000 * 60 * 60 * 24)
    );
    if (difference === 0) {
        return "Today";
    }
    if (difference === 1) {
        return "Tomorrow";
    }
    if (difference === -1) {
        return "Yesterday";
    }
    if (difference > 1) {
      if(type == 'main'){
        return `${difference} days from now`;
      }else{
        return `for ${difference} days from now`;
      }
    }
    if(type == 'main'){
      return `${Math.abs(difference)} days ago`;
    }else{
      return `from ${Math.abs(difference)} days ago`;
    }
}
function updateSelectedDate() {
    selectedDateText.textContent = formatDisplayDate(selectedDate);
    selectedDateLabel.textContent = getRelativeDateLabel(selectedDate, 'main');
    date = formatDatabaseDate(selectedDate);
}
prevDate.addEventListener('click', () => {
    selectedDate.setDate(selectedDate.getDate() - 1);
    updateSelectedDate();
});
nextDate.addEventListener('click', () => {
    selectedDate.setDate(selectedDate.getDate() + 1);
    updateSelectedDate();
});
updateSelectedDate();