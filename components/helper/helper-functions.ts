import {Timestamp} from "@firebase/firestore";
import JSZip from 'jszip';
import {saveAs} from "file-saver";
import {Song} from "@/models/song";


export function toPlainObject(obj: any) {
  return JSON.parse(JSON.stringify(obj))
}

export function getDayByTimestamp(timestamp: Timestamp) {
  if (!timestamp) return ""

  const date = new Date(timestamp.seconds * 1000);
  return date.toLocaleDateString('en-US', { weekday: 'short' }); // 'Mon', 'Tue', etc.
}

export function isTimestampPast(timestamp: Timestamp): boolean {
  const date = new Date(timestamp.seconds * 1000)
  const today = new Date()
  today.setHours(0, 0, 0, 0);
  return date < today;
}

export function timestampToDateString(timestamp: Timestamp) {
  if (!timestamp) return "Undefined"

  const jsDate = new Date(timestamp.seconds * 1000); // Explicitly type firestoreTimestamp.seconds as a number

  // Format the JavaScript Date into a string in 'yyyy-mm-dd' format
  const year = jsDate.getFullYear();
  const month = String(jsDate.getMonth() + 1).padStart(2, '0'); // Adding 1 to month because it's zero-indexed
  const day = String(jsDate.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`
}

export function timestampToDateStringFormatted(timestamp: Timestamp) {
  if (!timestamp) return "Undefined"

  const jsDate = new Date(timestamp.seconds * 1000); // Explicitly type firestoreTimestamp.seconds as a number

  // Define month names
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Extract year, month, and day from the date
  const year = jsDate.getFullYear();
  const monthIndex = jsDate.getMonth();
  const day = jsDate.getDate();

  // Format the date string
  return `${monthNames[monthIndex]} ${day}, ${year}`;
}

export function timestampToDatePassedFromNow(timestamp: Timestamp) {
  const jsDate = new Date(timestamp.seconds * 1000); // Convert Firestore timestamp to JavaScript Date
  const now = new Date();

  const diffInSeconds = Math.floor((now.getTime() - jsDate.getTime()) / 1000);

  const secondsInMinute = 60;
  const secondsInHour = secondsInMinute * 60;
  const secondsInDay = secondsInHour * 24;
  const secondsInWeek = secondsInDay * 7;
  const secondsInMonth = secondsInDay * 30;
  const secondsInYear = secondsInDay * 365;

  let result;

  if (diffInSeconds < secondsInMinute) {
    result = `${diffInSeconds} seconds ago`;
  }
  else if (diffInSeconds < secondsInHour) {
    const minutes = Math.floor(diffInSeconds / secondsInMinute);
    result = `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  }
  else if (diffInSeconds < secondsInDay) {
    const hours = Math.floor(diffInSeconds / secondsInHour);
    result = `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  }
  else if (diffInSeconds < secondsInWeek) {
    const days = Math.floor(diffInSeconds / secondsInDay);
    result = `${days} day${days !== 1 ? 's' : ''} ago`;
  }
  else if (diffInSeconds < secondsInMonth) {
    const weeks = Math.floor(diffInSeconds / secondsInWeek);
    result = `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
  }
  else if (diffInSeconds < secondsInYear) {
    const months = Math.floor(diffInSeconds / secondsInMonth);
    result = `${months} month${months !== 1 ? 's' : ''} ago`;
  }
  else {
    const years = Math.floor(diffInSeconds / secondsInYear);
    result = `${years} year${years !== 1 ? 's' : ''} ago`;
  }
  return result;
}

export function timestampToDatePassedFromNowMini(timestamp: Timestamp) {
  const jsDate = new Date(timestamp.seconds * 1000); // Convert Firestore timestamp to JavaScript Date
  const now = new Date();

  const diffInSeconds = Math.floor((now.getTime() - jsDate.getTime()) / 1000);

  const secondsInMinute = 60;
  const secondsInHour = secondsInMinute * 60;
  const secondsInDay = secondsInHour * 24;
  const secondsInWeek = secondsInDay * 7;
  const secondsInMonth = secondsInDay * 30;
  const secondsInYear = secondsInDay * 365;

  let result;

  if (diffInSeconds < secondsInMinute) {
    result = `${diffInSeconds} seconds ago`;
  }
  else if (diffInSeconds < secondsInHour) {
    const minutes = Math.floor(diffInSeconds / secondsInMinute);
    result = `${minutes}min ago`;
  }
  else if (diffInSeconds < secondsInDay) {
    const hours = Math.floor(diffInSeconds / secondsInHour);
    result = `${hours}hrs ago`;
  }
  else if (diffInSeconds < secondsInWeek) {
    const days = Math.floor(diffInSeconds / secondsInDay);
    result = `${days}d ago`;
  }
  else if (diffInSeconds < secondsInYear) {
    const months = Math.floor(diffInSeconds / secondsInMonth);
    result = `${months}m ago`;
  }
  else {
    const years = Math.floor(diffInSeconds / secondsInYear);
    result = `${years}y ago`;
  }
  return result;
}

export function timestampToDate(timestamp: Timestamp) {
  try {
    return new Date(timestamp.seconds * 1000)
  }
  catch(e) {
    console.log("Err: timestampToDate")
    return new Date()
  }
}

export function OpenYoutubeLink(url: string) {
  if (url) {
    window.open(url, '_blank');
    return;
    // Extract the video ID from the YouTube URL (assuming it is in the standard format)
    const videoId = url.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/)?.[1];

    if (videoId) {
      if (isMobile()) {
        window.location.href = `youtube://www.youtube.com/watch?v=${videoId}`;
      }
      else {
        window.open(url, '_blank');
      }
    }
    else {
      window.open(url, '_blank');
    }
  }
}

function isMobile() {
  // Example of a simple mobile detection function
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function isPWA() {
  // Example of a function to detect if the app is running as a PWA
  return window.matchMedia('(display-mode: standalone)').matches;
}

export function emailExists(emails: Array<string>, targetEmail:string) {
  if (emails.map((x) => x.toLowerCase().trim()).includes(targetEmail.toLowerCase().trim())) {
    return true;
  }
  return false;
}


function extractFileType(imageUrl: string) {
  let fileName = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);

  // Remove extra strings after '?' if they exist
  const queryIndex = fileName.indexOf('?');
  if (queryIndex !== -1) {
    fileName = fileName.substring(0, queryIndex);
  }

  // Get the file extension from the file name
  return fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();

}

async function fetchImageAsBlob (url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image from ${url}`);
  }
  return response.blob();
}


export async function downloadMultipleMusicSheets(songs: Array<Song>) {
  const zip = new JSZip();

  // Add files to the zip
  for (const song of songs) {
    for (const url of song.music_sheet_urls) {
      const blob = await fetchImageAsBlob(url);
      zip.file(`${song?.title}.${extractFileType(url)}`, blob)
    }
  }

  // Generate the zip file and trigger download
  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, 'music_sheets.zip');
}
