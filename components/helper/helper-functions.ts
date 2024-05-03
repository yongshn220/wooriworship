import {Timestamp} from "@firebase/firestore";

export function toPlainObject(obj: any) {
  return JSON.parse(JSON.stringify(obj))
}

export function timestampToDate(timestamp: Timestamp) {
  const jsDate = new Date(timestamp.seconds * 1000); // Explicitly type firestoreTimestamp.seconds as a number

  // Format the JavaScript Date into a string in 'yyyy-mm-dd' format
  const year = jsDate.getFullYear();
  const month = String(jsDate.getMonth() + 1).padStart(2, '0'); // Adding 1 to month because it's zero-indexed
  const day = String(jsDate.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`
}
