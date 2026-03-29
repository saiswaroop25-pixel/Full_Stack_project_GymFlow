// ── CSV Export Utility ────────────────────────────────────────────────────────

/**
 * Convert an array of objects to CSV and trigger download
 * @param {Object[]} data - array of row objects
 * @param {string}   filename - download filename (no extension needed)
 */
export function exportToCSV(data, filename) {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row =>
      headers.map(h => {
        const val = row[h];
        if (val === null || val === undefined) return '';
        const str = String(val).replace(/"/g, '""'); // escape quotes
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str}"` : str;
      }).join(',')
    ),
  ];

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Flatten a member object for CSV export
 */
export function flattenMember(m) {
  return {
    Name:         m.name,
    Email:        m.email,
    Plan:         m.plan,
    Goal:         m.goal || '',
    Status:       m.isActive ? 'Active' : 'Inactive',
    Workouts:     m._count?.workoutLogs || 0,
    Visits:       m._count?.attendanceLogs || 0,
    JoinedDate:   m.createdAt ? new Date(m.createdAt).toLocaleDateString('en-IN') : '',
  };
}

/**
 * Flatten a workout log for CSV export
 */
export function flattenWorkout(w) {
  return {
    Name:       w.name,
    Date:       new Date(w.date).toLocaleDateString('en-IN'),
    Duration:   `${w.duration} min`,
    Calories:   w.calories || 0,
    Volume:     w.volume ? `${w.volume.toFixed(0)} kg` : '',
    Exercises:  w.exercises?.length || 0,
  };
}

/**
 * Flatten a meal for CSV export
 */
export function flattenMeal(m) {
  return {
    Meal:     m.name,
    Date:     new Date(m.date).toLocaleDateString('en-IN'),
    Calories: m.calories,
    Protein:  `${Math.round(m.protein)}g`,
    Carbs:    `${Math.round(m.carbs)}g`,
    Fat:      `${Math.round(m.fat)}g`,
  };
}
