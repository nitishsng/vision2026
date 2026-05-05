const TZ = 'Asia/Kolkata'

function normalizeYYYYMMDD(input) {
  try {
    if (!input) return null
    const d = typeof input === 'string' ? new Date(input) : new Date(input)
    if (isNaN(d.getTime())) return null
    return d.toLocaleDateString('en-CA', { timeZone: TZ })
  } catch {
    return null
  }
}

function isInRange(dateStr, startStr, endStr) {
  const d = normalizeYYYYMMDD(dateStr)
  if (!d) return false
  const s = startStr ? normalizeYYYYMMDD(startStr) : null
  const e = endStr ? normalizeYYYYMMDD(endStr) : null
  if (s && d < s) return false
  if (e && d > e) return false
  return true
}

function sumVisit(patients, startStr, endStr) {
  if (!Array.isArray(patients) || patients.length === 0) return 0;
  const noRange = !startStr && !endStr;
  return patients.reduce((sum, p) => {
    const visits = Array.isArray(p?.visitDetails) ? p.visitDetails : [];
    for (const v of visits) {
      const price = Number(v?.visitPrice || 0);
      const date = v?.visitDate;
      if (date == null) {
        if (noRange) sum += price;
      } else {
        if (isInRange(date, startStr, endStr)) sum += price;
      }
    }
    return sum;
  }, 0);
}

function sumMedicines(patients, startStr, endStr) {
  if (!Array.isArray(patients) || patients.length === 0) return 0;

  const noRange = !startStr && !endStr;

  return patients.reduce((sum, p) => {
    const meds = (p && Array.isArray(p.medicines)) ? p.medicines : [];

    for (const m of meds) {
      const price = Number(m?.price || 0);
      const date = m?.date;

      if (date == null) {
        // Rule: include price if BOTH startStr and endStr are empty
        if (noRange) sum += price;
      } else {
        // Original rule using isInRange
        if (isInRange(date, startStr, endStr)) sum += price;
      }
    }

    return sum;
  }, 0);
}


function sumOpticalPayments(patients, startStr, endStr) {
  if (!Array.isArray(patients) || patients.length === 0) return 0;

  return patients.reduce((sum, p) => {
    const pay = Array.isArray(p?.opticalPayDetails) ? p.opticalPayDetails : [];
    for (const d of pay) {
      const date = d?.date;
      const amount = Number(d?.amount || 0);
      if (isInRange(date, startStr, endStr)) {
        sum += amount;
      }
    }
    return sum;
  }, 0);
}


function computeTotals(patients, startStr, endStr, expenses = []) {
  const visitTotal = sumVisit(patients, startStr, endStr)
  const medicineTotal = sumMedicines(patients, startStr, endStr)
  const opticalTotal = sumOpticalPayments(patients, startStr, endStr)
  
  let onlineTotal = 0;
  let offlineTotal = 0;
  let totalExpenses = 0;

  if (Array.isArray(patients)) {
    patients.forEach(p => {
      // Visit details
      if (Array.isArray(p.visitDetails)) {
        p.visitDetails.forEach(v => {
          if (isInRange(v.visitDate, startStr, endStr)) {
            if (v.mode === 'online') onlineTotal += Number(v.visitPrice || 0);
            else offlineTotal += Number(v.visitPrice || 0); // default to offline for legacy data
          }
        });
      }
      // Medicines
      if (Array.isArray(p.medicines)) {
        p.medicines.forEach(m => {
          if (isInRange(m.date, startStr, endStr)) {
            if (m.mode === 'online') onlineTotal += Number(m.price || 0);
            else offlineTotal += Number(m.price || 0);
          }
        });
      }
      // Optical
      if (Array.isArray(p.opticalPayDetails)) {
        p.opticalPayDetails.forEach(d => {
          if (isInRange(d.date, startStr, endStr)) {
            if (d.mode === 'online') onlineTotal += Number(d.amount || 0);
            else offlineTotal += Number(d.amount || 0);
          }
        });
      }
    });
  }

  if (Array.isArray(expenses)) {
    expenses.forEach(e => {
      if (isInRange(e.date, startStr, endStr)) {
        totalExpenses += Number(e.amount || 0);
      }
    });
  }

  return {
    visitTotal,
    medicineTotal,
    opticalTotal,
    onlineTotal,
    offlineTotal,
    totalExpenses,
    totalAdvance: visitTotal + medicineTotal + opticalTotal,
  }
}

module.exports = {
  normalizeYYYYMMDD,
  isInRange,
  sumVisit,
  sumMedicines,
  sumOpticalPayments,
  computeTotals,
}
