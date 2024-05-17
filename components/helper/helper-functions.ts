import {Timestamp} from "@firebase/firestore";

export function toPlainObject(obj: any) {
  return JSON.parse(JSON.stringify(obj))
}

export function timestampToDateString(timestamp: Timestamp) {
  const jsDate = new Date(timestamp.seconds * 1000); // Explicitly type firestoreTimestamp.seconds as a number

  // Format the JavaScript Date into a string in 'yyyy-mm-dd' format
  const year = jsDate.getFullYear();
  const month = String(jsDate.getMonth() + 1).padStart(2, '0'); // Adding 1 to month because it's zero-indexed
  const day = String(jsDate.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`
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

export function isMobile() {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
}

export function OpenYoutubeLink(url: string) {
  if (url) {
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
