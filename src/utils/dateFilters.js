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
  if (!Array.isArray(patients) || patients.length === 0) return 0
  return patients.reduce((sum, p) => {
    const vd = p && p.visitDate ? p.visitDate : null
    if (isInRange(vd, startStr, endStr)) {
      sum += Number(p.visitPrice || 0)
    }
    return sum
  }, 0)
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

  const noRange = !startStr && !endStr;

  return patients.reduce((sum, p) => {
    const pay = Array.isArray(p?.opticalPayDetails) ? p.opticalPayDetails : [];

    // Rule: if opticalPayDetails is empty & no date filter → add totalAdvance
    if (pay.length === 0 && noRange) {
      sum += Number(p?.opticalAdvance || 0);
      return sum;
    }

    // Existing logic (only when there *are* details OR when date filter exists)
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


function computeTotals(patients, startStr, endStr) {
  const visitTotal = sumVisit(patients, startStr, endStr)
  const medicineTotal = sumMedicines(patients, startStr, endStr)
  const opticalTotal = sumOpticalPayments(patients, startStr, endStr)
  return {
    visitTotal,
    medicineTotal,
    opticalTotal,
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

