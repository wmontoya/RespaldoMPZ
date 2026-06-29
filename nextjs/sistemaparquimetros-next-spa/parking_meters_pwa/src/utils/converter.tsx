export const formatAmount = (amount: number, decimales: number = 2) => {
  const options: Intl.NumberFormatOptions = {
    style: "currency",
    currency: 'USD',
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  };

  const numberFormated: number = Number(amount.toString().replace(',', '.'));
  const response = new Intl.NumberFormat('en-US', options).format(numberFormated).replace('$', '₡ ');

  return response;
}

export const formatDate = (date: Date | undefined, formatType: "date" | "time" | "all"): string => {
  if (date != undefined) {
    if (formatType === "date") {
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    }

    if (formatType === "time") {
      return date.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }
    if (formatType === "all") {
      date = new Date(date); 
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();

      let hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');

      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      const formattedHours = String(hours).padStart(2, '0');

      return `${day}/${month}/${year} ${formattedHours}:${minutes}:${seconds} ${ampm}`;
    }
  }
  return "";
};

export const getTimeRemaining = () => {
  const now = new Date();
  const fivePM = new Date();
  fivePM.setHours(17, 0, 0, 0);
  const timeDifference = fivePM.getTime() - now.getTime();
  const remainingHours = Math.floor(timeDifference / (1000 * 60 * 60));
  return remainingHours;
};

export const calculateEndTime = (totalHours: number, startDate: Date) => {
  const newEndTime = new Date(startDate);
  const fullHours = Math.floor(totalHours);
  const fractionalHours = totalHours - fullHours;
  const minutes = Math.round(fractionalHours * 60);
  newEndTime.setHours(newEndTime.getHours() + fullHours);
  newEndTime.setMinutes(newEndTime.getMinutes() + minutes);
  return newEndTime;
};

export const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};
