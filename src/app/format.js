export const formatDate = (dateStr) => {
  const formatDateValide = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/
  if (dateStr === NaN || dateStr === '' || !dateStr.match(formatDateValide)) {
    return 'Date invalide'
  } else {
    const date = new Date(dateStr)
    const ye = new Intl.DateTimeFormat('fr', { year: 'numeric' }).format(date)
    const mo = new Intl.DateTimeFormat('fr', { month: 'short' }).format(date)
    const da = new Intl.DateTimeFormat('fr', { day: '2-digit' }).format(date)
    const month = mo.charAt(0).toUpperCase() + mo.slice(1)
    return `${parseInt(da)} ${month.substr(0,3)}. ${ye.toString().substr(2,4)}`
  }
}
 
export const formatStatus = (status) => {
  switch (status) {
    case "pending":
      return "En attente"
    case "accepted":
      return "Accepté"
    case "refused":
      return "Refused"
  }
}